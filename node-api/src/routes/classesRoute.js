const {
    getAllClasses,
    getOneClass,
    createClass,
    updateClass,
    deleteClass,
    getClassStudents,
    setClassStudents,
} = require('../controller/classesController');

function classesRoute(app) {
    app.get('/api/v1/class', getAllClasses);
    app.get('/api/v1/class/:id', getOneClass);
    app.post('/api/v1/class', createClass);
    app.put('/api/v1/class/:id', updateClass);
    app.delete('/api/v1/class/:id', deleteClass);

    // Students enrolled in a specific class
    app.get('/api/v1/class/:id/students', getClassStudents);
    app.put('/api/v1/class/:id/students', setClassStudents);
}

module.exports = classesRoute;
