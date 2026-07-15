const { TimeSlot } = require("../models");
const logError = require("../helper/log_helper");

const getAllTimeSlots = async (req, res) => {
    try {
        const timeSlots = await TimeSlot.findAll();
        res.status(200).json({
            message: "Time slots retrieved successfully",
            data: timeSlots,
        });
    } catch (err) {
        logError(res, err, "timeSlotController");
    }
};

const getOneTimeSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const timeSlot = await TimeSlot.findByPk(id);

        if (!timeSlot) {
            return res.status(404).json({ message: `Time slot not found with ID: ${id}` });
        }

        res.status(200).json({
            message: "Time slot retrieved successfully",
            data: timeSlot,
        });
    } catch (err) {
        logError(res, err, "timeSlotController");
    }
};

const createTimeSlot = async (req, res) => {
    try {
        const { day_of_week, start_time, end_time } = req.body;

        if (!day_of_week || !start_time || !end_time) {
            return res.status(400).json({
                message: "day_of_week, start_time and end_time are required",
            });
        }

        const timeSlot = await TimeSlot.create({
            day_of_week,
            start_time,
            end_time,
        });

        res.status(201).json({
            message: "Time slot created successfully",
            data: timeSlot,
        });
    } catch (err) {
        logError(res, err, "timeSlotController");
    }
};

const updateTimeSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const timeSlot = await TimeSlot.findByPk(id);

        if (!timeSlot) {
            return res.status(404).json({ message: `Time slot not found with ID: ${id}` });
        }

        const { day_of_week, start_time, end_time } = req.body;

        await timeSlot.update({
            day_of_week,
            start_time,
            end_time,
        });

        res.status(200).json({
            message: "Time slot updated successfully",
            data: timeSlot,
        });
    } catch (err) {
        logError(res, err, "timeSlotController");
    }
};

const deleteTimeSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const timeSlot = await TimeSlot.findByPk(id);

        if (!timeSlot) {
            return res.status(404).json({ message: `Time slot not found with ID: ${id}` });
        }

        await timeSlot.destroy();

        res.status(200).json({
            message: `Time slot deleted successfully with ID: ${id}`,
        });
    } catch (err) {
        logError(res, err, "timeSlotController");
    }
};

module.exports = {
    getAllTimeSlots,
    getOneTimeSlot,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
};
