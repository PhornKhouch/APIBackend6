const {
    getAllStudents,
    getOneStudent,
    createStudent,
    updateStudent,
    deleteStudent,
} = require('../controller/studentController');

function studentRoute(app) {
    app.get('/api/v1/student', getAllStudents);
    app.get('/api/v1/student/:id', getOneStudent);
    app.post('/api/v1/student', createStudent);
    app.put('/api/v1/student/:id', updateStudent);
    app.delete('/api/v1/student/:id', deleteStudent);
}

module.exports = studentRoute;
