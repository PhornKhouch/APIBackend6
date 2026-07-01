// import { getstudent, getstudentbyid } from '../controller/studentController';
var  {get , Create , Update , deleteUser ,Login ,sendotp} = require('../controller/userController');

const { validate_token } = require('../middleware/middleware');
function userRoute(app) {
    
    app.get('/api/user', get);
    app.post('/api/user', Create);
    app.post('/api/user/login', Login);
    app.put('/api/user/update', Update);

    app.delete('/api/user/delete/:id', validate_token() , deleteUser);
    // send otp code to gmail 
    
    app.post('/api/user/send-otp',sendotp);
}

// export default userRoute;
module.exports = userRoute;
