const {
    getAllTimeSlots,
    getOneTimeSlot,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
} = require('../controller/timeSlotController');

function timeSlotRoute(app) {
    app.get('/api/v1/time-slot', getAllTimeSlots);
    app.get('/api/v1/time-slot/:id', getOneTimeSlot);
    app.post('/api/v1/time-slot', createTimeSlot);
    app.put('/api/v1/time-slot/:id', updateTimeSlot);
    app.delete('/api/v1/time-slot/:id', deleteTimeSlot);
}

module.exports = timeSlotRoute;
