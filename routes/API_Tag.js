let express = require('express');
let router = express.Router();


const API_Tag = require('../API/TagAPI');


/// USER ROUTES ///
// GET request for getting user by parent id
router.get('/tags', API_Tag.APIgetAllTags);

// GET request for getting alls users that are banned
router.get('/tags/:name', API_Tag.APIgetAllTagsMatchingName);

//POST request for creating tag
router.post('/tag/create',API_Tag.APIcreate);

//PATCH request for update tag
router.patch('/tag/update',API_Tag.APIsave);

//DELETE request for delete tag
router.delete('/tag/delete',API_Tag.APIdelete);






//Exporter les routes
module.exports = router;