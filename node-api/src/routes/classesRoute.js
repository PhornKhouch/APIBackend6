const {
    getAllClasses,
    getOneClass,
    createClass,
    updateClass,
    deleteClass,
} = require('../controller/classesController');

function classesRoute(app) {
    app.get('/api/v1/class', getAllClasses);
    app.get('/api/v1/class/:id', getOneClass);
    app.post('/api/v1/class', createClass);
    app.put('/api/v1/class/:id', updateClass);
    app.delete('/api/v1/class/:id', deleteClass);
}

module.exports = classesRoute;
