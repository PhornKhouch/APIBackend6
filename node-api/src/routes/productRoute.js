
var product = require('../controller/productController');
var { validate_token } = require('../middleware/middleware');
function productRoute(app) {
    
    app.get('/api/product', validate_token() ,product.getProduct);
 
    app.get('/api/product/:id', validate_token() ,product.getProductById);

    app.post('/api/product', validate_token() ,product.NewProduct);

    app.put('/api/product', validate_token() ,product.update);

    app.delete('/api/product/:id', validate_token() ,product.deleteProduct);

    app.post('/api/product/send-message',product.SendMessageToTelegram);

     app.post('/api/product/send-email',product.SendEmail);

}

// export default studentRoute;
module.exports = productRoute;
