const {
    getAllTeachers,
    getOneTeacher,
    createTeacher,
    updateTeacher,
    deleteTeacher,
} = require('../controller/teacherController');

function teacherRoute(app) {
    app.get('/api/v1/teacher', getAllTeachers);
    app.get('/api/v1/teacher/:id', getOneTeacher);
    app.post('/api/v1/teacher', createTeacher);
    app.put('/api/v1/teacher/:id', updateTeacher);
    app.delete('/api/v1/teacher/:id', deleteTeacher);
}

// export default teacherRoute;
module.exports = teacherRoute;