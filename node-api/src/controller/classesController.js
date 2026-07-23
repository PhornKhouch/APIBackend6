const { Class, AcademicYear, Semester, Teacher, ClassEnrollment, Student } = require("../models");
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

        // Enrolled headcount per class for the capacity bars on the cards.
        // One grouped query instead of an N+1 across the list — merged onto
        // each row as `enrolled_count` (0 when a class has no enrollments).
        const counts = await ClassEnrollment.count({ group: ["class_id"] });
        const countByClass = new Map(counts.map((c) => [String(c.class_id), c.count]));

        const data = classes.map((c) => ({
            ...c.toJSON(),
            enrolled_count: countByClass.get(String(c.class_id)) || 0,
        }));

        res.status(200).json({
            message: "Classes retrieved successfully",
            data,
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

// GET /api/v1/class/:id/students — students enrolled in this class, each row
// carrying its nested Student so the picker can show names.
const getClassStudents = async (req, res) => {
    try {
        const { id } = req.params;
        const classItem = await Class.findByPk(id);
        if (!classItem) {
            return res.status(404).json({ message: `Class not found with ID: ${id}` });
        }

        const enrollments = await ClassEnrollment.findAll({
            where: { class_id: id },
            include: [{ model: Student }],
        });

        res.status(200).json({
            message: "Enrolled students retrieved successfully",
            data: enrollments,
        });
    } catch (err) {
        logError(res, err, "classesController");
    }
};

// PUT /api/v1/class/:id/students — replace the full set of students enrolled in
// this class. Body: { student_ids: [1, 2, ...] }. Replaces rather than appends
// so it maps cleanly onto the multi-select panel's checked state.
const setClassStudents = async (req, res) => {
    try {
        const { id } = req.params;
        const classItem = await Class.findByPk(id);
        if (!classItem) {
            return res.status(404).json({ message: `Class not found with ID: ${id}` });
        }

        const { student_ids } = req.body;
        if (!Array.isArray(student_ids)) {
            return res.status(400).json({ message: "student_ids must be an array" });
        }

        // De-dupe and drop empties before replacing the enrollment set.
        const ids = [...new Set(student_ids.map(Number).filter((n) => Number.isInteger(n)))];

        await ClassEnrollment.destroy({ where: { class_id: id } });
        if (ids.length) {
            const today = new Date().toISOString().slice(0, 10);
            await ClassEnrollment.bulkCreate(
                ids.map((student_id) => ({
                    class_id: id,
                    student_id,
                    enrollment_date: today,
                    status: "Active",
                }))
            );
        }

        const enrollments = await ClassEnrollment.findAll({
            where: { class_id: id },
            include: [{ model: Student }],
        });

        res.status(200).json({
            message: "Enrolled students updated successfully",
            data: enrollments,
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
    getClassStudents,
    setClassStudents,
};
