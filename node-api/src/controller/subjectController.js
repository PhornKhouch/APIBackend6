const { Subject } = require("../models");
const logError = require("../helper/log_helper");

const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.findAll({
            include: [{ model: Subject, as: "Prerequisite" }],
        });
        res.status(200).json({
            message: "Subjects retrieved successfully",
            data: subjects,
        });
    } catch (err) {
        logError(res, err, "subjectController");
    }
};

const getOneSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const subject = await Subject.findByPk(id, {
            include: [{ model: Subject, as: "Prerequisite" }],
        });

        if (!subject) {
            return res.status(404).json({ message: `Subject not found with ID: ${id}` });
        }

        res.status(200).json({
            message: "Subject retrieved successfully",
            data: subject,
        });
    } catch (err) {
        logError(res, err, "subjectController");
    }
};

const createSubject = async (req, res) => {
    try {
        const { subject_code, subject_name, description, prerequisite_subject_id } = req.body;

        if (!subject_code || !subject_name) {
            return res.status(400).json({
                message: "subject_code and subject_name are required",
            });
        }

        const subject = await Subject.create({
            subject_code,
            subject_name,
            description,
            prerequisite_subject_id,
        });

        res.status(201).json({
            message: "Subject created successfully",
            data: subject,
        });
    } catch (err) {
        logError(res, err, "subjectController");
    }
};

const updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const subject = await Subject.findByPk(id);

        if (!subject) {
            return res.status(404).json({ message: `Subject not found with ID: ${id}` });
        }

        const { subject_code, subject_name, description, prerequisite_subject_id } = req.body;

        await subject.update({
            subject_code,
            subject_name,
            description,
            prerequisite_subject_id,
        });

        res.status(200).json({
            message: "Subject updated successfully",
            data: subject,
        });
    } catch (err) {
        logError(res, err, "subjectController");
    }
};

const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const subject = await Subject.findByPk(id);

        if (!subject) {
            return res.status(404).json({ message: `Subject not found with ID: ${id}` });
        }

        await subject.destroy();

        res.status(200).json({
            message: `Subject deleted successfully with ID: ${id}`,
        });
    } catch (err) {
        logError(res, err, "subjectController");
    }
};

module.exports = {
    getAllSubjects,
    getOneSubject,
    createSubject,
    updateSubject,
    deleteSubject,
};
