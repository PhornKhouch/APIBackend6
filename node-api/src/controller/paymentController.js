const { Payment, Invoice, User } = require("../models");
const logError = require("../helper/log_helper");

// Payments always carry the invoice they settle and the user who recorded them.
const PAYMENT_INCLUDES = [
    { model: Invoice },
    { model: User, as: "RecordedByUser" },
];

// After any payment change, re-derive the invoice's amount_paid from the sum of
// its payments and move its status accordingly. Keeps the invoice as the single
// source of truth rather than trusting a client-supplied figure.
const recomputeInvoice = async (invoice_id) => {
    const invoice = await Invoice.findByPk(invoice_id);
    if (!invoice) return;

    const paid = (await Payment.sum("amount", { where: { invoice_id } })) || 0;
    const total = Number(invoice.total_amount);

    let status;
    if (paid >= total && total > 0) {
        status = "Paid";
    } else if (paid > 0) {
        status = "Partial";
    } else {
        // Unpaid, unless the due date has already passed.
        const today = new Date().toISOString().slice(0, 10);
        status = invoice.due_date && String(invoice.due_date) < today ? "Overdue" : "Unpaid";
    }

    await invoice.update({ amount_paid: paid, status });
};

const getAllPayments = async (req, res) => {
    try {
        // Optional ?invoice_id= filter to list one invoice's payments.
        const where = {};
        if (req.query.invoice_id) where.invoice_id = req.query.invoice_id;

        const payments = await Payment.findAll({
            where,
            include: PAYMENT_INCLUDES,
            order: [["payment_id", "DESC"]],
        });

        res.status(200).json({
            message: "Payments retrieved successfully",
            data: payments,
        });
    } catch (err) {
        logError(res, err, "paymentController");
    }
};

const getOnePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findByPk(id, { include: PAYMENT_INCLUDES });

        if (!payment) {
            return res.status(404).json({ message: `Payment not found with ID: ${id}` });
        }

        res.status(200).json({
            message: "Payment retrieved successfully",
            data: payment,
        });
    } catch (err) {
        logError(res, err, "paymentController");
    }
};

const createPayment = async (req, res) => {
    try {
        const {
            invoice_id,
            payment_date,
            amount,
            payment_method,
            receipt_url,
            recorded_by,
            notes,
        } = req.body;

        if (!invoice_id || !amount || !payment_method || !recorded_by) {
            return res.status(400).json({
                message: "invoice_id, amount, payment_method and recorded_by are required",
            });
        }

        // Reject payments against an invoice that doesn't exist.
        const invoice = await Invoice.findByPk(invoice_id);
        if (!invoice) {
            return res.status(404).json({ message: `Invoice not found with ID: ${invoice_id}` });
        }

        const today = new Date().toISOString().slice(0, 10);

        const payment = await Payment.create({
            invoice_id,
            payment_date: payment_date || today,
            amount,
            payment_method,
            receipt_url,
            recorded_by,
            notes,
        });

        await recomputeInvoice(invoice_id);

        res.status(201).json({
            message: "Payment created successfully",
            data: payment,
        });
    } catch (err) {
        logError(res, err, "paymentController");
    }
};

const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findByPk(id);

        if (!payment) {
            return res.status(404).json({ message: `Payment not found with ID: ${id}` });
        }

        const {
            payment_date,
            amount,
            payment_method,
            receipt_url,
            recorded_by,
            notes,
        } = req.body;

        // invoice_id is intentionally not reassignable — a payment stays with its
        // original invoice; correct by recording a new one instead.
        await payment.update({
            payment_date: payment_date ?? payment.payment_date,
            amount: amount ?? payment.amount,
            payment_method: payment_method ?? payment.payment_method,
            receipt_url: receipt_url ?? payment.receipt_url,
            recorded_by: recorded_by ?? payment.recorded_by,
            notes: notes ?? payment.notes,
        });

        await recomputeInvoice(payment.invoice_id);

        res.status(200).json({
            message: "Payment updated successfully",
            data: payment,
        });
    } catch (err) {
        logError(res, err, "paymentController");
    }
};

module.exports = {
    getAllPayments,
    getOnePayment,
    createPayment,
    updatePayment,
};
