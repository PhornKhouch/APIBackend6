const { Semester, AcademicYear } = require("../models");
const logError = require("../helper/log_helper");

const getAllSemesters = async (req, res) => {
    try {
        const semesters = await Semester.findAll({
            include: [{ model: AcademicYear }],
        });
        res.status(200).json({
            message: "Semesters retrieved successfully",
            data: semesters,
        });
    } catch (err) {
        logError(res, err, "semesterController");
    }
};

const getOneSemester = async (req, res) => {
    try {
        const { id } = req.params;
        const semester = await Semester.findByPk(id, {
            include: [{ model: AcademicYear }],
        });

        if (!semester) {
            return res.status(404).json({ message: `Semester not found with ID: ${id}` });
        }

        res.status(200).json({
            message: "Semester retrieved successfully",
            data: semester,
        });
    } catch (err) {
        logError(res, err, "semesterController");
    }
};

const createSemester = async (req, res) => {
    try {
        const { academic_year_id, semester_name, start_date, end_date } = req.body;

        if (!academic_year_id || !semester_name || !start_date || !end_date) {
            return res.status(400).json({
                message: "academic_year_id, semester_name, start_date and end_date are required",
            });
        }

        const semester = await Semester.create({
            academic_year_id,
            semester_name,
            start_date,
            end_date,
        });

        res.status(201).json({
            message: "Semester created successfully",
            data: semester,
        });
    } catch (err) {
        logError(res, err, "semesterController");
    }
};

const updateSemester = async (req, res) => {
    try {
        const { id } = req.params;
        const semester = await Semester.findByPk(id);

        if (!semester) {
            return res.status(404).json({ message: `Semester not found with ID: ${id}` });
        }

        const { academic_year_id, semester_name, start_date, end_date } = req.body;

        await semester.update({
            academic_year_id,
            semester_name,
            start_date,
            end_date,
        });

        res.status(200).json({
            message: "Semester updated successfully",
            data: semester,
        });
    } catch (err) {
        logError(res, err, "semesterController");
    }
};

const deleteSemester = async (req, res) => {
    try {
        const { id } = req.params;
        const semester = await Semester.findByPk(id);

        if (!semester) {
            return res.status(404).json({ message: `Semester not found with ID: ${id}` });
        }

        await semester.destroy();

        res.status(200).json({
            message: `Semester deleted successfully with ID: ${id}`,
        });
    } catch (err) {
        logError(res, err, "semesterController");
    }
};

module.exports = {
    getAllSemesters,
    getOneSemester,
    createSemester,
    updateSemester,
    deleteSemester,
};
