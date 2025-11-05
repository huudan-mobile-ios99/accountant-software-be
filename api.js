var dboperation = require('./dboperation')
var express = require('express')
var body_parser = require('body-parser')
var cors = require('cors')
var app = express();
var router = express.Router();
var fs = require('fs');
var cmd = require('node-cmd');
var app = express();
var router = express.Router();
var path = require('path');
var soap = require('./soap');
const moment = require('moment-timezone');
//SWAGGER
const swaggerUi = require("swagger-ui-express"),
swaggerDocument = require("./swagger.json");
const morgan = require('morgan');


app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);
//middleware
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
router.use((err, req, res, next) => {
    console.error('Error:', err.message);
    // Continue server execution
    res.status(500).json({ error: 'Internal Server Error' });
});


app.use(body_parser.urlencoded({ extended: true }))
app.use(body_parser.json())
app.use(cors())
app.use('/api', router)


router.use((request, response, next) => {
    console.log('middleware!');
    next();
});
// Error handling middleware
router.use((err, req, res, next) => {
    console.error('Error:', err.message);
    // Continue server execution
    res.status(500).json({ error: 'Internal Server Error' });
});

var port = process.env.PORT || 8090;
app.listen(port);
console.log('ACCOUNTANT SOFTWARE BE: ' + port);


app.use('/', router);
// app.use(express.static('public-flutter'));
// app.use(express.static('public-flutter/assets'));
// router.get('/', (request, response) => {
//     response.sendFile(path.resolve('./public-flutter/index.html'));
// })


//Customer date frame
router.route('/dateframe_by_number').post((request, response,next) => {
    const { number } = request.body;
    // console.log(number)
    dboperation.getDateFrameByNumber(number, function (err, result) {
        if (err) {
            console.log(`error dateframe by number ${err}`);
            return next(err)
        }
        response.json(result)
    }).catch(err=>{
        return next(err);
    });
});

