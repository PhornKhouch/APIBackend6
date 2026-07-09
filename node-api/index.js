// import express from 'express';
// import studentRoute from './src/routes/studentRoute.js';
// import teacherRoute from './src/routes/teacherRoute.js';

var express = require('express');
const cors = require('cors'); 
var UserRoute = require('./src/routes/userRoute');
var teacherRoute = require('./src/routes/teacherRoute');
var subjectRoute = require('./src/routes/subjectRoute');
var semesterRoute = require('./src/routes/semesterRoute');
var productRoute = require('./src/routes/productRoute');
var {BackgroundJob} = require('./src/controller/userController');
// TODO: employeeRoute references src/models/{employee,order,sale,department}.js which
// don't exist in the repo, so requiring it crashes the server. Re-enable once those
// models are added back.
// var {Employee} = require('./src/routes/employeeRoute');
var sequelize = require('./src/config/dbconnectSeqeulize');
var {cardpaywayRoute} = require('./src/routes/cardpaywayRoute');
// register SMS models so sequelize.sync() knows about them
require('./src/models');
var app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

UserRoute(app);
teacherRoute(app);
subjectRoute(app);
semesterRoute(app);
productRoute(app);
// Employee(app);
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