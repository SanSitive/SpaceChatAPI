let express = require('express');
let router = express.Router();
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./public/images/upload/');
    },
    filename: function(req,file,cb){
        cb(null, new Date().toLocaleTimeString('it-IT') + file.originalname)
    }
});

const fileFilter = (req,file,cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        //accept a file
        cb(null,true);
    }else{
        //reject a file
        cb(null,false);
    }
};
const upload = multer({
    storage:storage,
    limits: {fileSize: 1024 * 1024},
    fileFilter: fileFilter
})

//Required controller modules
const post_controller = require('../controllers/postController');
const { CustomValidation } = require('express-validator/src/context-items');


//////////////////////////
////// POST ROUTES ///////
//////////////////////////

// GET request for create post page
router.get('/user/:user_id/post/create',post_controller.user_create_postpage_get);

// POST request for ceating post page
router.post('/user/:user_id/post/create',upload.single('picture'), post_controller.user_create_postpage_post);

// GET request for specific post
router.get('/user/:user_id/post/:post_id', post_controller.user_specific_postpage_get);

// GET request for update a specific post
router.get('/user/:user_id/post/:post_id/update', post_controller.user_specific_post_updatepage_get);

// PATCH request for update a specific post 
router.patch('/user/:user_id/post/:post_id/update', post_controller.user_specific_post_updatepage_patch);

// GET request for specific post on delete page
router.get('/user/:user_id/post/:post_id/delete', post_controller.user_specific_post_deletepage_get);

// DELETE request for specific post on delete page
router.delete('/user/:user_id/post/:post_id/delete', post_controller.user_specific_post_deletepage_delete);

//Exporter les routes
module.exports = router;