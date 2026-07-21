const { Schedule, Class, Subject, Teacher, TimeSlot, ScheduleStudent, Student } = require("../models");
const logError = require("../helper/log_helper");

// Includes reused across list/getOne so a schedule row always comes back with
// its class, subject, teacher and time slot — everything the timetable grid
// needs to render a cell (subject + teacher) at the right day/period.
const SCHEDULE_INCLUDES = [
    { model: Class },
    { model: Subject },
    { model: Teacher },
    { model: TimeSlot },
];

const getAllSchedules = async (req, res) => {
    try {
        // Optional ?class_id= / ?teacher_id= filters back the class badge and
        // the "teacher's weekly schedule" views without a separate endpoint.
        const where = {};
        if (req.query.class_id) where.class_id = req.query.class_id;
        if (req.query.teacher_id) where.teacher_id = req.query.teacher_id;

        const schedules = await Schedule.findAll({
            where,
            include: SCHEDULE_INCLUDES,
        });
        res.status(200).json({
            message: "Schedules retrieved successfully",
            data: schedules,
        });
    } catch (err) {
        logError(res, err, "scheduleController");
    }
};

const getOneSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await Schedule.findByPk(id, {
            include: SCHEDULE_INCLUDES,
        });

        if (!schedule) {
            return res.status(404).json({ message: `Schedule not found with ID: ${id}` });
        }

        res.status(200).json({
            message: "Schedule retrieved successfully",
            data: schedule,
        });
    } catch (err) {
        logError(res, err, "scheduleController");
    }
};

const createSchedule = async (req, res) => {
    try {
        const { class_id, subject_id, teacher_id, time_slot_id, room_number } = req.body;

        if (!class_id || !subject_id || !teacher_id || !time_slot_id) {
            return res.status(400).json({
                message: "class_id, subject_id, teacher_id and time_slot_id are required",
            });
        }

        const schedule = await Schedule.create({
            class_id,
            subject_id,
            teacher_id,
            time_slot_id,
            room_number,
        });

        res.status(201).json({
            message: "Schedule created successfully",
            data: schedule,
        });
    } catch (err) {
        logError(res, err, "scheduleController");
    }
};

const updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await Schedule.findByPk(id);

        if (!schedule) {
            return res.status(404).json({ message: `Schedule not found with ID: ${id}` });
        }

        const { class_id, subject_id, teacher_id, time_slot_id, room_number } = req.body;

        await schedule.update({
            class_id,
            subject_id,
            teacher_id,
            time_slot_id,
            room_number,
        });

        res.status(200).json({
            message: "Schedule updated successfully",
            data: schedule,
        });
    } catch (err) {
        logError(res, err, "scheduleController");
    }
};

const deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await Schedule.findByPk(id);

        if (!schedule) {
            return res.status(404).json({ message: `Schedule not found with ID: ${id}` });
        }

        await schedule.destroy();

        res.status(200).json({
            message: `Schedule deleted successfully with ID: ${id}`,
        });
    } catch (err) {
        logError(res, err, "scheduleController");
    }
};

// GET /api/v1/schedule/:id/students — the students assigned to this schedule
// entry, each row carrying its nested Student so the panel can show names.
const getScheduleStudents = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await Schedule.findByPk(id);
        if (!schedule) {
            return res.status(404).json({ message: `Schedule not found with ID: ${id}` });
        }

        const assignments = await ScheduleStudent.findAll({
            where: { schedule_id: id },
            include: [{ model: Student }],
        });

        res.status(200).json({
            message: "Assigned students retrieved successfully",
            data: assignments,
        });
    } catch (err) {
        logError(res, err, "scheduleController");
    }
};

// PUT /api/v1/schedule/:id/students — replace the full set of students assigned
// to this schedule entry. Body: { student_ids: [1, 2, ...] }. Replaces rather
// than appends so it maps cleanly onto the multi-select panel's checked state.
const setScheduleStudents = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await Schedule.findByPk(id);
        if (!schedule) {
            return res.status(404).json({ message: `Schedule not found with ID: ${id}` });
        }

        const { student_ids } = req.body;
        if (!Array.isArray(student_ids)) {
            return res.status(400).json({ message: "student_ids must be an array" });
        }

        // De-dupe and drop empties before replacing the assignment set.
        const ids = [...new Set(student_ids.map(Number).filter((n) => Number.isInteger(n)))];

        await ScheduleStudent.destroy({ where: { schedule_id: id } });
        if (ids.length) {
            const today = new Date().toISOString().slice(0, 10);
            await ScheduleStudent.bulkCreate(
                ids.map((student_id) => ({ schedule_id: id, student_id, assigned_date: today }))
            );
        }

        const assignments = await ScheduleStudent.findAll({
            where: { schedule_id: id },
            include: [{ model: Student }],
        });

        res.status(200).json({
            message: "Assigned students updated successfully",
            data: assignments,
        });
    } catch (err) {
        logError(res, err, "scheduleController");
    }
};

module.exports = {
    getAllSchedules,
    getOneSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getScheduleStudents,
    setScheduleStudents,
};
