const {
    getAllSchedules,
    getOneSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
} = require('../controller/scheduleController');

function scheduleRoute(app) {
    app.get('/api/v1/schedule', getAllSchedules);
    app.get('/api/v1/schedule/:id', getOneSchedule);
    app.post('/api/v1/schedule', createSchedule);
    app.put('/api/v1/schedule/:id', updateSchedule);
    app.delete('/api/v1/schedule/:id', deleteSchedule);
}

module.exports = scheduleRoute;
