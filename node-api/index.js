// import express from 'express';
// import studentRoute from './src/routes/studentRoute.js';
// import teacherRoute from './src/routes/teacherRoute.js';

var express = require('express');
const cors = require('cors'); 
var UserRoute = require('./src/routes/userRoute');
var teacherRoute = require('./src/routes/teacherRoute');
var productRoute = require('./src/routes/productRoute');
var {BackgroundJob} = require('./src/controller/userController');
var {Employee} = require('./src/routes/employeeRoute');
var sequelize = require('./src/config/dbconnectSeqeulize');
var {cardpaywayRoute} = require('./src/routes/cardpaywayRoute');
// register models so sequelize.sync() knows about them
require('./src/models/employee');
require('./src/models/order');
require('./src/models/sale');
require('./src/models/department');
var app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

UserRoute(app);
teacherRoute(app);
productRoute(app);
Employee(app);
cardpaywayRoute(app);
//running server
//auto migration
// async function start() {
//     try {
//         await sequelize.authenticate();
//         console.log("Database connection established.");

//         // alter:true re-adds unique indexes on every boot and eventually
//         // hits MySQL's 64-key limit (ER_TOO_MANY_KEYS). Only alter when
//         // explicitly requested, e.g. DB_SYNC=alter node index.js
//         const syncOptions =
//             process.env.DB_SYNC === "alter"
//                 ? { alter: true }
//                 : process.env.DB_SYNC === "force"
//                 ? { force: true }
//                 : {};
//         await sequelize.sync(syncOptions);
//         console.log("Database & tables synced!");

//         app.listen(3000, function () {
//             console.log('localhost:3000');
//             //BackgroundJob();
//         });
//     } catch (err) {
//         console.error("Unable to connect / sync the database:", err);
//     }
// }


// start();


app.listen(3000, function () {
    console.log('localhost:3000');
    //BackgroundJob();
});