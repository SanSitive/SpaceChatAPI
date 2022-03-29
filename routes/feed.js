let express = require('express');
let router = express.Router();






//Required controller modules
let feed_controller = require('../controllers/feedController');
const { CustomValidation } = require('express-validator/src/context-items');



/// HOME PAGE ///
// GET home page.
router.get('/', feed_controller.index);


/// FEED ROUTES ///
// GET request for Feed page
router.get('/feed', feed_controller.feed_get);

//Exporter les routes
module.exports = router;
