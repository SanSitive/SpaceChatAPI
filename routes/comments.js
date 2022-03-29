let express = require('express');
let router = express.Router();





//Required controller modules
const comment_controller = require('../controllers/commentController');
const { CustomValidation } = require('express-validator/src/context-items');


// COMMENTS ROUTES 
// POST comment on a post
router.post('/user/:user_id/post/:post_id',comment_controller.post_comment); 


//Exporter les routes
module.exports = router;