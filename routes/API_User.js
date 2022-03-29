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

const API_User = require('../API/UserAPI');
/// USER ROUTES ///
// GET request for getting user by id
router.get('/user/by_id/:id', API_User.APIgetById);

// GET request for getting user by identify
router.get('/user/by_identify/:id', API_User.APIgetByIdentify);

// GET request for getting user by identify
router.get('/user/connection/:id', API_User.APIconnection);

// GET request for getting alls users that are banned
router.get('/users/banned', API_User.APIgetAllUserBanned);

//POST request for creating user
router.post('/user/create',API_User.APIcreate);

//PATCH request for creating user
router.patch('/user/update',API_User.APIsave);

//DELETE request for user
router.delete('/user/delete',API_User.APIdelete);



////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

//POST request for follow someone
//router.post('/user/:id/follow_create',user_controller.user_follow_someone_post);

//DELETE request for unfollow someone
//router.delete('/user/:id/follow_delete', user_controller.user_unfollow_someone_delete);





//Exporter les routes
module.exports = router;