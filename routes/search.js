let express = require('express');
let router = express.Router();





//Required controller modules
let search_controller = require('../controllers/searchController');
const { CustomValidation } = require('express-validator/src/context-items');




/// SEARCH ROUTES ///
// GET request for Search page
router.get('/search', search_controller.search_get);

// POST request for send Search form.
router.post('/search', search_controller.search_post);


//Exporter les routes
module.exports = router;