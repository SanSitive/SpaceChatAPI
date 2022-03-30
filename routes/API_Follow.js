let express = require('express');
let router = express.Router();

const API_Follow = require('../API/FollowAPI');



// GET request for getting user by id
router.get('/follows/id_suivant/:id', API_Follow.APIgetAllFollowBySuivant);

// GET request for getting user by identify
router.get('/follows/ne_id_suivant/:id', API_Follow.APIgetAllFollowNotEqualSuivant);

// GET request for getting user by identify
router.get('/follow/is_following/user_suivant/:user_suivant/user_suivi/:user_suivi', API_Follow.APIisCurrentUserFollowing);


// GET request for getting follow instance
router.get('/follow/instance/user_suivant/:user_suivant/user_suivi/:user_suivi', API_Follow.APIgetSpecificInstance);

//POST request for creating user
router.post('/follow/create',API_Follow.APIcreate);

//PATCH request for creating user
router.patch('/follow/update',API_Follow.APIsave);

//DELETE request for user
router.delete('/follow/delete',API_Follow.APIdelete);






//Exporter les routes
module.exports = router;