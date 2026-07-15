const { Student, StudentEmergencyContact } = require("../models");
const logError = require("../helper/log_helper");

const getAllStudents = async (req, res) => {
    try {
        const students = await Student.findAll({
            include: [{ model: StudentEmergencyContact }],
        });
        res.status(200).json({
            message: "Students retrieved successfully",
            data: students,
        });
    } catch (err) {
        logError(res, err, "studentController");
    }
};

const getOneStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findByPk(id, {
            include: [{ model: StudentEmergencyContact }],
        });

        if (!student) {
            return res.status(404).json({ message: `Student not found with ID: ${id}` });
        }

        res.status(200).json({
            message: "Student retrieved successfully",
            data: student,
        });
    } catch (err) {
        logError(res, err, "studentController");
    }
};

const createStudent = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            dob,
            gender,
            photo_url,
            contact_number,
            address,
            enrollment_date,
            status,
        } = req.body;

        if (!first_name || !last_name || !enrollment_date) {
            return res.status(400).json({
                message: "first_name, last_name and enrollment_date are required",
            });
        }

        const student = await Student.create({
            first_name,
            last_name,
            dob,
            gender,
            photo_url,
            contact_number,
            address,
            enrollment_date,
            status,
        });

        res.status(201).json({
            message: "Student created successfully",
            data: student,
        });
    } catch (err) {
        logError(res, err, "studentController");
    }
};

const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findByPk(id);

        if (!student) {
            return res.status(404).json({ message: `Student not found with ID: ${id}` });
        }

        const {
            first_name,
            last_name,
            dob,
            gender,
            photo_url,
            contact_number,
            address,
            enrollment_date,
            status,
        } = req.body;

        await student.update({
            first_name,
            last_name,
            dob,
            gender,
            photo_url,
            contact_number,
            address,
            enrollment_date,
            status,
        });

        res.status(200).json({
            message: "Student updated successfully",
            data: student,
        });
    } catch (err) {
        logError(res, err, "studentController");
    }
};

const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findByPk(id);

        if (!student) {
            return res.status(404).json({ message: `Student not found with ID: ${id}` });
        }

        await student.destroy();

        res.status(200).json({
            message: `Student deleted successfully with ID: ${id}`,
        });
    } catch (err) {
        logError(res, err, "studentController");
    }
};

module.exports = {
    getAllStudents,
    getOneStudent,
    createStudent,
    updateStudent,
    deleteStudent,
};
