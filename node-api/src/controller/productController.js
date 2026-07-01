const db = require('../config/dbconfig');
const logError = require('../helper/log_helper');
const TelegramBot = require('node-telegram-bot-api');
const nodemailer = require('nodemailer');
const token = '8885943257:AAEiQB_REf7yb15bEGQRtU-aiZhkpBjZAmg';
const bot = new TelegramBot(token, { polling: true });

const SendMessageToTelegram = async (req, res) => {
    const message = req.body.message; // Get the message from the request body
    const chatId = '-1003924130263'; // Replace with your Telegram group chat ID
    try {
        await bot.sendMessage(chatId, message);
        res.status(200).json({
            message: "Message sent to Telegram successfully"
        });
    } catch (error) {
        console.error("Error sending message to Telegram:", error);
    }
}



const Mailer  =  nodemailer.createTransport({
    service: 'gmail',
    auth: { 
        user : "pkhouch97@gmail.com",
        pass : "c s i b z p g e p k x l k w g f"
    }
});


const SendEmail = async (req, res) => {
    try{
        const { email, subject, text } = req.body;
        const mailOptions = {
            from: "pkhouch97@gmail.com",// sender email
            to : email, // receiver email
            subject: subject,
            text: text
        }
        await Mailer.sendMail(mailOptions);
        res.status(200).json({
            message: "Email sent successfully"
        });
    }
    catch(err){
        logError(res, err, "product");
    }
}





const getProduct = async (req, res) => {
    try {
        const SQL = `
           SELECT * FROM tbl_master_product;
       `;
        const [result] = await db.promise().query(SQL);
        res.status(200).json({
            message: "Get Product",
            data: result
        });
    } catch (err) {
        logError(res, err, "product");
    }
}


const NewProduct = (req, res) => {
    var NewProuct = {
        id: req.body.id,
        name: req.body.name,
        price: req.body.price,
        description: req.body.description
    }
    //if prduct id is exist in productList array then return error message
    var isExist = productList.find(product => product.id === NewProuct.id);
    if (isExist) {
        return res.status(400).json({
            message: "Product ID already exists"
        });
    }
    //add product to productList array
    productList.push(NewProuct); // push is array function to add element to array
    res.json({
        message: "Add prodcut successfully",
        data: NewProuct
    });
}

const getProductById = async (req, res) => {
    try {
        var id = req.params.id; // get id from url
        const SQLWhere = `SELECT * FROM tbl_master_product WHERE prd_id = ?;`;
        const [product] = await db.promise().query(SQLWhere, [id]);
        if (!product[0]) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        res.json({
            message: "Get Product By ID",
            data: product[0]
        });
    }
    catch (err) {
        logError(res, err, "product");
    }
}

const update = (req, res) => {
    try {
        var { id, name, price, description } = req.body; // get id from request body
        var product = productList.find(product => product.id == id);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        product.name = name;
        product.price = price;
        product.description = description;

        res.json({
            message: "Update Product",
            data: product
        });
    }
    catch (err) {
        logError(res, err, "product");
    }
}

const deleteProduct = (req, res) => {
    try {
        var id = req.params.id; // get id from url
        var productIndex = productList.findIndex(product => product.id == id);
        if (productIndex === -1) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        productList.splice(productIndex, 1); // splice is array function to remove element from array
        res.status(200).json({
            message: "Delete Product",
            success: true
        });
    }
    catch (err) {
        logError(res, err, "product");
    }
}

module.exports = {
    getProduct,
    getProductById,
    NewProduct,
    update,
    deleteProduct,
    SendMessageToTelegram,
    SendEmail
};