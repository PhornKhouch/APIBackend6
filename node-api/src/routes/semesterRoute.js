const {
    getAllSemesters,
    getOneSemester,
    createSemester,
    updateSemester,
    deleteSemester,
} = require('../controller/semesterController');

function semesterRoute(app) {
    app.get('/api/v1/semester', getAllSemesters);
    app.get('/api/v1/semester/:id', getOneSemester);
    app.post('/api/v1/semester', createSemester);
    app.put('/api/v1/semester/:id', updateSemester);
    app.delete('/api/v1/semester/:id', deleteSemester);
}

module.exports = semesterRoute;
