const { Class, AcademicYear, Semester, Teacher } = require("../models");
const logError = require("../helper/log_helper");

// Includes reused across list/getOne so a class always comes back with its
// academic year, semester and (optional) homeroom teacher.
const CLASS_INCLUDES = [
    { model: AcademicYear },
    { model: Semester },
    { model: Teacher, as: "HomeroomTeacher" },
];

const getAllClasses = async (req, res) => {
    try {
        const classes = await Class.findAll({
            include: CLASS_INCLUDES,
        });
        res.status(200).json({
            message: "Classes retrieved successfully",
            data: classes,
        });
    } catch (err) {
        logError(res, err, "classesController");
    }
};

const getOneClass = async (req, res) => {
    try {
        const { id } = req.params;
        const classItem = await Class.findByPk(id, {
            include: CLASS_INCLUDES,
        });

        if (!classItem) {
            return res.status(404).json({ message: `Class not found with ID: ${id}` });
        }

        res.status(200).json({
            message: "Class retrieved successfully",
            data: classItem,
        });
    } catch (err) {
        logError(res, err, "classesController");
    }
};

const createClass = async (req, res) => {
    try {
        const {
            class_name,
            academic_year_id,
            semester_id,
            room_number,
            max_capacity,
            homeroom_teacher_id,
        } = req.body;

        if (!class_name || !academic_year_id || !semester_id) {
            return res.status(400).json({
                message: "class_name, academic_year_id and semester_id are required",
            });
        }

        const classItem = await Class.create({
            class_name,
            academic_year_id,
            semester_id,
            room_number,
            max_capacity,
            homeroom_teacher_id,
        });

        res.status(201).json({
            message: "Class created successfully",
            data: classItem,
        });
    } catch (err) {
        logError(res, err, "classesController");
    }
};

const updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const classItem = await Class.findByPk(id);

        if (!classItem) {
            return res.status(404).json({ message: `Class not found with ID: ${id}` });
        }

        const {
            class_name,
            academic_year_id,
            semester_id,
            room_number,
            max_capacity,
            homeroom_teacher_id,
        } = req.body;

        await classItem.update({
            class_name,
            academic_year_id,
            semester_id,
            room_number,
            max_capacity,
            homeroom_teacher_id,
        });

        res.status(200).json({
            message: "Class updated successfully",
            data: classItem,
        });
    } catch (err) {
        logError(res, err, "classesController");
    }
};

const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;
        const classItem = await Class.findByPk(id);

        if (!classItem) {
            return res.status(404).json({ message: `Class not found with ID: ${id}` });
        }

        await classItem.destroy();

        res.status(200).json({
            message: `Class deleted successfully with ID: ${id}`,
        });
    } catch (err) {
        logError(res, err, "classesController");
    }
};

module.exports = {
    getAllClasses,
    getOneClass,
    createClass,
    updateClass,
    deleteClass,
};
