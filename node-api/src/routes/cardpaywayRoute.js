// import { getstudent, getstudentbyid } from '../controller/studentController';
var  {createCheckoutSession ,PaymentSuccess ,generateKHQR , verifyKHQR , checkPaymentStatus} = require('../controller/cardpaywayController');

const cardpaywayRoute = (app) => {
    app.post('/api/cardpayway/create-checkout-session', createCheckoutSession);
    app.get('/success', PaymentSuccess);

   app.post('/api/khqr/generate' , generateKHQR);     
   app.post('/api/khqr/verify' , verifyKHQR);            // Verify KHQR string
    app.post('/api/khqr/check-payment' , checkPaymentStatus); // Check payment status via Bakong API
}
// export default userRoute;
module.exports = {cardpaywayRoute};
