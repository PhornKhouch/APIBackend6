const {
    getAllPayments,
    getOnePayment,
    createPayment,
    updatePayment,
} = require('../controller/paymentController');

// Payments are never deleted — corrections are made by recording a new payment.
function paymentRoute(app) {
    app.get('/api/v1/payment', getAllPayments);
    app.get('/api/v1/payment/:id', getOnePayment);
    app.post('/api/v1/payment', createPayment);
    app.put('/api/v1/payment/:id', updatePayment);
}

module.exports = paymentRoute;
