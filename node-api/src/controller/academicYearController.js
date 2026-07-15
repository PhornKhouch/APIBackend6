const { AcademicYear, Semester } = require("../models");
const logError = require("../helper/log_helper");

const getAllAcademicYears = async (req, res) => {
    try {
        const academicYears = await AcademicYear.findAll({
            include: [{ model: Semester }],
        });
        res.status(200).json({
            message: "Academic years retrieved successfully",
            data: academicYears,
        });
    } catch (err) {
        logError(res, err, "academicYearController");
    }
};

const getOneAcademicYear = async (req, res) => {
    try {
        const { id } = req.params;
        const academicYear = await AcademicYear.findByPk(id, {
            include: [{ model: Semester }],
        });

        if (!academicYear) {
            return res.status(404).json({ message: `Academic year not found with ID: ${id}` });
        }

        res.status(200).json({
            message: "Academic year retrieved successfully",
            data: academicYear,
        });
    } catch (err) {
        logError(res, err, "academicYearController");
    }
};

const createAcademicYear = async (req, res) => {
    try {
        const { year_name, start_date, end_date, status } = req.body;

        if (!year_name || !start_date || !end_date) {
            return res.status(400).json({
                message: "year_name, start_date and end_date are required",
            });
        }

        const academicYear = await AcademicYear.create({
            year_name,
            start_date,
            end_date,
            status,
        });

        res.status(201).json({
            message: "Academic year created successfully",
            data: academicYear,
        });
    } catch (err) {
        logError(res, err, "academicYearController");
    }
};

const updateAcademicYear = async (req, res) => {
    try {
        const { id } = req.params;
        const academicYear = await AcademicYear.findByPk(id);

        if (!academicYear) {
            return res.status(404).json({ message: `Academic year not found with ID: ${id}` });
        }

        const { year_name, start_date, end_date, status } = req.body;

        await academicYear.update({
            year_name,
            start_date,
            end_date,
            status,
        });

        res.status(200).json({
            message: "Academic year updated successfully",
            data: academicYear,
        });
    } catch (err) {
        logError(res, err, "academicYearController");
    }
};

const deleteAcademicYear = async (req, res) => {
    try {
        const { id } = req.params;
        const academicYear = await AcademicYear.findByPk(id);

        if (!academicYear) {
            return res.status(404).json({ message: `Academic year not found with ID: ${id}` });
        }

        await academicYear.destroy();

        res.status(200).json({
            message: `Academic year deleted successfully with ID: ${id}`,
        });
    } catch (err) {
        logError(res, err, "academicYearController");
    }
};

module.exports = {
    getAllAcademicYears,
    getOneAcademicYear,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
};
