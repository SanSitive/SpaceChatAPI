let express = require('express');
let router = express.Router();


const API_User = require('../API/UserAPI');
/// USER ROUTES ///
// GET request for getting user by id
router.get('/user/by_id/:id', API_User.APIgetById);

// GET request for getting user by identify
router.get('/user/by_identify/:id', API_User.APIgetByIdentify);

// GET request for getting user by identify
router.get('/user/populated/by_identify/:id', API_User.APIgetByIdentify);

// GET request for getting user by identify
router.get('/user/connection/:id', API_User.APIconnection);

// GET request for getting alls users that are banned
router.get('/users/banned', API_User.APIgetAllUserBanned);

// GET request to know the number of instance that have the same identify
router.get('/user/count/:id',API_User.APIcountSameIdentify);

//POST request for creating user
router.post('/user/create',API_User.APIcreate);

//PATCH request for creating user
router.patch('/user/update',API_User.APIsave);

//DELETE request for user
router.delete('/user/delete',API_User.APIdelete);







//Exporter les routes
module.exports = router;