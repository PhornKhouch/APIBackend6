// import { getstudent, getstudentbyid } from '../controller/studentController';
var  {GetEmployee ,GetOne} = require('../controller/employeeController');

const Employee= (app) => {
    app.get('/api/employee', GetEmployee);
    app.get('/api/employee/getone', GetOne);
}
// export default userRoute;
module.exports = {Employee};
