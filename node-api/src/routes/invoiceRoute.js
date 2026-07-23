const {
    getAllInvoices,
    getOneInvoice,
    createInvoice,
    updateInvoice,
} = require('../controller/invoiceController');

// Invoices are never deleted — void by updating status instead.
function invoiceRoute(app) {
    app.get('/api/v1/invoice', getAllInvoices);
    app.get('/api/v1/invoice/:id', getOneInvoice);
    app.post('/api/v1/invoice', createInvoice);
    app.put('/api/v1/invoice/:id', updateInvoice);
}

module.exports = invoiceRoute;
