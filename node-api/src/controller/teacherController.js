const bcrypt = require("bcrypt");
const { sequelize, Teacher, User } = require("../models");
const logError = require("../helper/log_helper");

const userAttributes = { exclude: ["password_hash"] };

const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.findAll({
            include: [{ model: User, attributes: userAttributes }],
        });
        res.status(200).json({
            message: "Teachers retrieved successfully",
            data: teachers,
        });
    } catch (err) {
        logError(res, err, "teacherController");
    }
};

const getOneTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher = await Teacher.findByPk(id, {
            include: [{ model: User, attributes: userAttributes }],
        });

        if (!teacher) {
            return res.status(404).json({ message: `Teacher not found with ID: ${id}` });
        }

        res.status(200).json({
            message: "Teacher retrieved successfully",
            data: teacher,
        });
    } catch (err) {
        logError(res, err, "teacherController");
    }
};

const createTeacher = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            username,
            email,
            password,
            first_name,
            last_name,
            gender,
            dob,
            photo_url,
            contact_number,
            specialization,
            bio,
            hire_date,
            status,
        } = req.body;

        if (!username || !email || !password || !first_name || !last_name) {
            await t.rollback();
            return res.status(400).json({
                message: "username, email, password, first_name and last_name are required",
            });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const user = await User.create(
            { username, email, password_hash, role: "Teacher" },
            { transaction: t }
        );

        const teacher = await Teacher.create(
            {
                user_id: user.user_id,
                first_name,
                last_name,
                gender,
                dob,
                photo_url,
                contact_number,
                specialization,
                bio,
                hire_date,
                status,
            },
            { transaction: t }
        );

        await t.commit(); // save complete

        res.status(201).json({
            message: "Teacher created successfully",
            data: { ...teacher.toJSON(), User: { ...user.toJSON(), password_hash: undefined } },
        });
    } catch (err) {
        await t.rollback();
        logError(res, err, "teacherController");
    }
};

const updateTeacher = async (req, res) => {
    const t = await sequelize.transaction();//open transaction
    try {
        const { id } = req.params;
        const teacher = await Teacher.findByPk(id, { transaction: t });

        if (!teacher) {
            await t.rollback();
            return res.status(404).json({ message: `Teacher not found with ID: ${id}` });
        }

        const {
            first_name,
            last_name,
            gender,
            dob,
            photo_url,
            contact_number,
            specialization,
            bio,
            hire_date,
            status,
            username,
            email,
        } = req.body;

        await teacher.update(
            {
                first_name,
                last_name,
                gender,
                dob,
                photo_url,
                contact_number,
                specialization,
                bio,
                hire_date,
                status,
            },
            { transaction: t }
        );

        if (username || email) {
            await User.update(
                { username, email },
                { where: { user_id: teacher.user_id }, transaction: t }
            );
        }

        await t.commit();

        const updatedTeacher = await Teacher.findByPk(id, {
            include: [{ model: User, attributes: userAttributes }],
        });

        res.status(200).json({
            message: "Teacher updated successfully",
            data: updatedTeacher,
        });
    } catch (err) {
        await t.rollback();
        logError(res, err, "teacherController");
    }
};

const deleteTeacher = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const teacher = await Teacher.findByPk(id, { transaction: t });

        if (!teacher) {
            await t.rollback();
            return res.status(404).json({ message: `Teacher not found with ID: ${id}` });
        }

        const { user_id } = teacher;
        await teacher.destroy({ transaction: t });
        await User.destroy({ where: { user_id }, transaction: t });

        await t.commit();

        res.status(200).json({
            message: `Teacher deleted successfully with ID: ${id}`,
        });
    } catch (err) {
        await t.rollback();
        logError(res, err, "teacherController");
    }
};

module.exports = {
    getAllTeachers,
    getOneTeacher,
    createTeacher,
    updateTeacher,
    deleteTeacher,
};
