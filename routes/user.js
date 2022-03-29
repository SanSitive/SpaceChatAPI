let express = require('express');
let router = express.Router();
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./public/images/upload/');
    },
    filename: function(req,file,cb){
        cb(null, new Date().toISOString() + file.originalname)
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
let user_controller= require('../controllers/userController');
const { CustomValidation } = require('express-validator/src/context-items');



/// USER ROUTES ///
// GET request for creating User
router.get('/user/create', user_controller.user_create_get);

// POST request for creating User
router.post('/user/create', user_controller.user_create_post);

// GET request for one User
router.get('/user/:id', user_controller.user_detail_get);

// GET request for User page parameter
router.get('/user/:id/parameter',user_controller.user_parameter_get);

// PATCH request for User page parameter
router.patch('/user/:id/parameter',user_controller.user_parameter_patch);

// GET request to update User.
router.get('/user/:id/update', user_controller.user_updatepage_get);

// PATCH request to update User.
router.patch('/user/:id/update',upload.single('picture'), user_controller.user_updatepage_patch);

//GET request for all banned users
router.get('/users/banned', user_controller.user_get_all_banned);
// GET request for unban someone page.
router.get('/user/:id/unban',user_controller.user_unban_someone_get);
//PATCH request for unbann someone page.
router.patch('/user/:id/unban', user_controller.user_unban_someone_patch);
// GET request for ban someone page.
router.get('/user/:id/ban',user_controller.user_ban_someone_get);
//PATCH request for ban someone page.
router.patch('/user/:id/ban', user_controller.user_ban_someone_patch);

//POST request for follow someone
router.post('/user/:id/follow_create',user_controller.user_follow_someone_post);

//DELETE request for unfollow someone
router.delete('/user/:id/follow_delete', user_controller.user_unfollow_someone_delete);





//Exporter les routes
module.exports = router;