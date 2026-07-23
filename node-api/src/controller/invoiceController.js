const { Invoice, Student, FeeStructure, Semester, Payment, Class } = require("../models");
const logError = require("../helper/log_helper");

// Every invoice comes back with the student it bills, the fee it derives from
// (and that fee's class, for the billing table's Class column), its semester
// and any payments recorded against it.
const INVOICE_INCLUDES = [
    { model: Student },
    { model: FeeStructure, include: [{ model: Class }] },
    { model: Semester },
    { model: Payment },
];

// Build a unique-ish human-readable invoice number when the client doesn't
// supply one, e.g. INV-20260723-482. The DB's unique constraint is the real
// guard; this just gives a sensible default.
const buildInvoiceNumber = () => {
    const now = new Date();
    const stamp = now.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(Math.random() * 900 + 100);
    return `INV-${stamp}-${rand}`;
};

const getAllInvoices = async (req, res) => {
    try {
        // Optional ?student_id= filter so a student's ledger can be pulled directly.
        const where = {};
        if (req.query.student_id) where.student_id = req.query.student_id;

        const invoices = await Invoice.findAll({
            where,
            include: INVOICE_INCLUDES,
            order: [["invoice_id", "DESC"]],
        });

        res.status(200).json({
            message: "Invoices retrieved successfully",
            data: invoices,
        });
    } catch (err) {
        logError(res, err, "invoiceController");
    }
};

const getOneInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findByPk(id, { include: INVOICE_INCLUDES });

        if (!invoice) {
            return res.status(404).json({ message: `Invoice not found with ID: ${id}` });
        }

        res.status(200).json({
            message: "Invoice retrieved successfully",
            data: invoice,
        });
    } catch (err) {
        logError(res, err, "invoiceController");
    }
};

const createInvoice = async (req, res) => {
    try {
        const {
            invoice_number,
            student_id,
            fee_id,
            semester_id,
            issue_date,
            due_date,
            total_amount,
        } = req.body;

        if (!student_id || !fee_id || !semester_id || !total_amount) {
            return res.status(400).json({
                message: "student_id, fee_id, semester_id and total_amount are required",
            });
        }

        const today = new Date().toISOString().slice(0, 10);

        const invoice = await Invoice.create({
            invoice_number: invoice_number || buildInvoiceNumber(),
            student_id,
            fee_id,
            semester_id,
            issue_date: issue_date || today,
            due_date: due_date || today,
            total_amount,
            amount_paid: 0,
            status: "Unpaid",
        });

        res.status(201).json({
            message: "Invoice created successfully",
            data: invoice,
        });
    } catch (err) {
        logError(res, err, "invoiceController");
    }
};

const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findByPk(id);

        if (!invoice) {
            return res.status(404).json({ message: `Invoice not found with ID: ${id}` });
        }

        const {
            invoice_number,
            student_id,
            fee_id,
            semester_id,
            issue_date,
            due_date,
            total_amount,
            status,
        } = req.body;

        // amount_paid is driven by recorded payments, not editable directly here.
        await invoice.update({
            invoice_number: invoice_number ?? invoice.invoice_number,
            student_id: student_id ?? invoice.student_id,
            fee_id: fee_id ?? invoice.fee_id,
            semester_id: semester_id ?? invoice.semester_id,
            issue_date: issue_date ?? invoice.issue_date,
            due_date: due_date ?? invoice.due_date,
            total_amount: total_amount ?? invoice.total_amount,
            status: status ?? invoice.status,
        });

        res.status(200).json({
            message: "Invoice updated successfully",
            data: invoice,
        });
    } catch (err) {
        logError(res, err, "invoiceController");
    }
};

module.exports = {
    getAllInvoices,
    getOneInvoice,
    createInvoice,
    updateInvoice,
};
