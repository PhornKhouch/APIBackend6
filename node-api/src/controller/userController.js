const bcrypt = require('bcrypt'); // import bcrypt for password hashing
const dbcon = require('../config/dbconfig'); // import dbcon from dbconfig.js
const logger = require('../helper/log_helper'); // import logger from logger.js
const jwt = require('jsonwebtoken'); // import jsonwebtoken for token generation
const env = require('dotenv').config(); // Load environment variables from .env file
const SECRET_KEY = process.env.SECRET_KEY; // Get the secret key from environment variables
const logError = require('../helper/log_helper'); // Import logError function from log_helper
const schedule = require('node-schedule'); // Import node-schedule for scheduling tasks
const nodemailer = require('nodemailer');
async function get(req, res) {
    try {
        const id = req.query.id;
        if (id) {
            const SQL = `SELECT * FROM tbl_user WHERE user_id = ?;`;
            const [result] = await dbcon.promise().query(SQL, [id]);
            if (result.length > 0) {
                res.status(200).json({
                    message: "Get user by ID successfully",
                    result: result[0]
                });
            } else {
                res.status(404).json({
                    message: "User not found with ID: " + id
                });
            }
        } else {
            const SQL = `SELECT * FROM tbl_user;`;
            const [result] = await dbcon.promise().query(SQL);
            res.status(200).json({
                message: "Get user successfully",
                result: result
            });
        }
    } catch (err) {
        logError(res, err, "userController");
    }
}

const otpStore = new Map();
const OTP_EXPIRE_MS = 5 * 60 * 1000;
const VERIFIED_EXPIRE_MS = 10 * 60 * 1000;

const Create = async (req, res) => {
    try {
        const { userid, username, password, remark } = req.body;

        const SQL = `
            INSERT INTO tbl_user
            (user_id, username, password, remark)
            VALUES (?, ?, ?, ?)
        `;
        var hashedPassword = await bcrypt.hash(password, 10); // Hash the password with a salt rounds of 10
        const [result] = await dbcon.promise().query(SQL, [
            userid,
            username,
            hashedPassword, // Store the hashed password in the database
            remark
        ]);

        res.status(201).json({
            message: "User created successfully",
            data: {
                user_id: userid,
                username: username,
                remark: remark
            }
        });

    } catch (err) {
        logError(res, err, "userController");
    }

};


//login 
const Login = async (req, res) => {
    try {
        const { user_id, password } = req.body;
        const SQL = `SELECT * FROM tbl_user WHERE user_id = ?;`;
        const [result] = await dbcon.promise().query(SQL, [user_id]);
        if (result.length > 0) {
            const user = result[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                var token = jwt.sign({ user_id: user.user_id }, SECRET_KEY, { expiresIn: '1h' });
                res.status(200).json({
                    message: "Login successful",
                    data: {
                        user_id: user.user_id,
                        username: user.username,
                        remark: user.remark
                    },
                    token: token
                });
            } else {
                res.status(401).json({
                    message: "Invalid password or user ID"
                });
            }
        } else {
            res.status(404).json({
                message: "User not found"
            });
        }
    }
    catch (err) {
        logError(res, err, "userController");
    }
}

const Update = async (req, res) => {
    try {
        const { userid, username, password, remark } = req.body;
        const SQL = `
        UPDATE tbl_user SET username = ?, password = ?, remark = ? WHERE user_id = ?;
        `;

        const hashedPassword = await bcrypt.hash(password, 10);
        await dbcon.promise().query(SQL, [
            username,
            hashedPassword,
            remark,
            userid
        ]);
        res.status(200).json({
            message: "User updated successfully",
            data: req.body
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

const deleteUser = async (req, res) => {
    const id = req.params.id;
    const SQL = `
        DELETE FROM tbl_user WHERE user_id = ?;
    `;

    await dbcon.promise().query(SQL, [id]);
    res.status(200).json({
        message: `User deleted successfully with ID: ${id}`
    });
}

const BackgroundJob = () => {
    schedule.scheduleJob('*/5 * * * * *', () => {
        console.log('Background job running every 5 seconds');
        // TODO: put the actual background task logic here
    });
}


const Mailer = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "pkhouch97@gmail.com",
        pass: "c s i b z p g e p k x l k w g f"
    }
});
// send otp code 
const sendotp = async (req, res) => {
    try {
        const { email } = req.body;
        const otp = Math.floor(100000 + Math.random() * 900000);

        const mailOptions = {
            from: "pkhouch97@gmail.com",// sender email
            to: email, // receiver email
            subject: "Send OTP Code",
            text:  `Your OTP code is: ${otp}`
        }

        otpStore.set(email, {
            otp: otp.toString(),
            otpExpireAt: Date.now() + OTP_EXPIRE_MS,
            verified: false,
            verifiedExpireAt: null
        });

        await Mailer.sendMail(mailOptions);
        res.status(200).json({
            message: "code have been send already"
        });
    }
    catch (err) {
        logError(res, err, "product");
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (IsValid(email) || IsValid(otp)) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

       const [user] = await dbcon.query(
                `SELECT *
                FROM tbl_user
                WHERE email = '${email}'`,
            );
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const otpData = otpStore.get(email);
        if (!otpData) {
            return res.status(400).json({
                success: false,
                message: 'OTP not found. Please request a new OTP'
            });
        }

        if (Date.now() > otpData.otpExpireAt) {
            otpStore.delete(email);
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new OTP'
            });
        }

        if (otpData.otp !== otp.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        otpStore.set(email, {
            ...otpData,
            verified: true,
            verifiedExpireAt: Date.now() + VERIFIED_EXPIRE_MS
        });

        res.json({
            success: true,
            message: 'OTP verified successfully'
        });
    }
    catch (error) {
        logError("UserController", error, res);
    }
}
module.exports = {
    get,
    Create,
    Update,
    Login,
    deleteUser,
    BackgroundJob,
    sendotp,
    verifyOtp
}