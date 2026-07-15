const {
    getAllAcademicYears,
    getOneAcademicYear,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
} = require('../controller/academicYearController');

function academicRoute(app) {
    app.get('/api/v1/academic-year', getAllAcademicYears);
    app.get('/api/v1/academic-year/:id', getOneAcademicYear);
    app.post('/api/v1/academic-year', createAcademicYear);
    app.put('/api/v1/academic-year/:id', updateAcademicYear);
    app.delete('/api/v1/academic-year/:id', deleteAcademicYear);
}

module.exports = academicRoute;
