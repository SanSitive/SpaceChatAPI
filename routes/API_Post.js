let express = require('express');
let router = express.Router();


const API_Post = require('../API/PostAPI');


/// USER ROUTES ///
// GET request for getting user by parent id
router.get('/posts/post_author_id/:id', API_Post.APIgetPostsByAuthorId);

// GET request for getting alls users that are banned
router.get('/post/:id', API_Post.APIgetPostById);

// GET request for getting alls users that are banned
router.get('/posts/populated/post_author_id/:id', API_Post.APIgetAllPostByAuthorIdPopulated);

// GET le post d'un autheur
router.get('/post/populated/id/:id', API_Post.APIgetPostById_PopulatedByAuthor);

// GET tout les posts d'un autheur mais populated
router.get('/posts/populated', API_Post.APIgetAllPosts_PopulatedByAuthor);

//POST request for creating user
router.post('/post/create',API_Post.APIcreate);

//PATCH request for update comment
router.patch('/post/update',API_Post.APIsave);

//DELETE request for delete comment
router.delete('/post/delete',API_Post.APIdelete);




//Exporter les routes
module.exports = router;