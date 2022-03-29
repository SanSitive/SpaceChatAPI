let express = require('express');
let router = express.Router();


const API_Comment = require('../API/CommentAPI');


/// USER ROUTES ///
// GET request for getting user by parent id
router.get('/comments/:parent_id', API_Comment.APIgetCommentByParentPostId);

// GET request for getting alls users that are banned
router.get('/comment/:id', API_Comment.APIgetCommentById);

//POST request for creating user
router.post('/comment/create',API_Comment.APIcreate);

//PATCH request for update comment
router.patch('/comment/update',API_Comment.APIsave);

//DELETE request for delete comment
router.delete('/comment/delete',API_Comment.APIdelete);






//Exporter les routes
module.exports = router;