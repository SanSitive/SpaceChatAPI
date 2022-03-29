let express = require('express');
let router = express.Router();






//Required controller modules
let connection_controller = require('../controllers/connectionController');
const comment_controller = require('../controllers/commentController');
const { CustomValidation } = require('express-validator/src/context-items');

/// CONNECTION ROUTES ///
// GET request for connection page.
router.get('/connection',connection_controller.connection_get);

// GET connection check.
router.get('/connection/data',connection_controller.connection_getdata);

// GET request for disconnection page.
router.get('/disconnect',connection_controller.disconnection_get);


//Exporter les routes
module.exports = router;