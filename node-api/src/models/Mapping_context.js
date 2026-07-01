var employee = require('./src/models/employee');
var order = require('./src/models/order');
var sale = require('./src/models/sale');
var department =require('./src/models/department');

module.exports = {
    Employee: employee,
    Order: order,
    Sale: sale,
    Department: department
}