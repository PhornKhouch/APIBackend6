const {
    getAllSubjects,
    getOneSubject,
    createSubject,
    updateSubject,
    deleteSubject,
} = require('../controller/subjectController');

function subjectRoute(app) {
    app.get('/api/v1/subject', getAllSubjects);
    app.get('/api/v1/subject/:id', getOneSubject);
    app.post('/api/v1/subject', createSubject);
    app.put('/api/v1/subject/:id', updateSubject);
    app.delete('/api/v1/subject/:id', deleteSubject);
}

module.exports = subjectRoute;
