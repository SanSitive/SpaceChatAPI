let express = require('express');
let router = express.Router();


const API_Style = require('../API/StyleAPI');


/// USER ROUTES ///
// GET request for getting user by parent id
router.get('/styles',API_Style.APIgetAllStyles)

// GET request for getting alls users that are banned
router.get('/style/:name', API_Style.APIgetStyleByName);

//POST request for creating tag
router.post('/style/create',API_Style.APIcreate);

//PATCH request for update tag
router.patch('/style/update',API_Style.APIsave);

//DELETE request for delete tag
router.delete('/style/delete',API_Style.APIdelete);



//Exporter les routes
module.exports = router;