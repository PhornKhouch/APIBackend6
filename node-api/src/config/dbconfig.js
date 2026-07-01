const mysql = require('mysql2');
const dbcon = mysql.createPool({
    host: 'localhost',
    user: 'root',   
    password: '',
    database: 'backend6',
    namedPlaceholders: true
    // waitForConnections: true,
    // connectionLimit: 10,
    // queueLimit: 0
});


module.exports = dbcon;