
const EmployeeModel = require("../models/employee");
var Department = require("../models/department");
var Position = require("../models/position");
const GetEmployee = async (req, res) => {
    try {
        const employees = await EmployeeModel.findAll({
            attributes: ["EmpCode", "EmpName", "Gender"], // select specific columns
            include: [ // join table 
                {
                    model: Department, // table 
                    attributes: ["DepartmentName"], // select specific columns
                    required : true
                },
                {
                    model: Position, // table 
                    attributes: ["PositionName"], // select specific columns
                    required : true
                },
            ],
            where: {
                gender: 'M' 
            },
           // order: [["EmpName", "ASC"]], // order by EmpName ascending
        });
        res.json({
            message: "Employee data retrieved successfully",
            data: employees
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}


const GetOne = async (req, res) => {
    try {
        var gender = req.query.gender;
        const [employees] = await EmployeeModel.findAll({
            where: {
                gender: gender
            }
        });// select * from employee where EmpCode=id
        res.json({
            message: "Employee data retrieved successfully",
            data: employees
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}
module.exports = { GetEmployee, GetOne };