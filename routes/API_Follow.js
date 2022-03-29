let express = require('express');
let router = express.Router();

const API_Follow = require('../API/FollowAPI');



// GET request for getting user by id
router.get('/follows/id_suivant/:id', API_Follow.APIgetAllFollowBySuivant);

// GET request for getting user by identify
router.get('/follows/ne_id_suivant/:id', API_Follow.APIgetAllFollowNotEqualSuivant);

// GET request for getting user by identify
router.get('/follow/is_following', API_Follow.APIisCurrentUserFollowing);

//POST request for creating user
router.post('/follow/create',API_Follow.APIcreate);

//PATCH request for creating user
router.patch('/follow/update',API_Follow.APIsave);

//DELETE request for user
router.delete('/follow/delete',API_Follow.APIdelete);



////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

//POST request for follow someone
//router.post('/user/:id/follow_create',user_controller.user_follow_someone_post);

//DELETE request for unfollow someone
//router.delete('/user/:id/follow_delete', user_controller.user_unfollow_someone_delete);





//Exporter les routes
module.exports = router;