
let mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');
const multer = require('multer');
const upload = multer({
    dest: 'uploads/'
});
const { diffIndexes } = require('../models/user');
const Common = require('../Common');
const fetch = require('node-fetch');
const config = require('../config')

const user_function = require('../API/user');
const comment_function = require('../API/comment');


// COMMENTS ROUTES 
// POST comment on a post
exports.post_comment = function(req,res,next){
    // Validate and sanitize fields.
    body('content', 'Content must not be empty.').trim().isLength({ min: 1 }).escape()
    
    // Process request after validation and sanitization.
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    //Create a user for temporary stock the data
    
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        res.redirect('/home/user/'+req.params.user_id+'/post/'+req.params.post_id);
    }else if(Common.isConnected(req)){
        fetch(config.API_URI + '/user/by_id/' + req.session.user_id).then(response => response.json()).then( user =>{
            if(user){
                let instance = {};
                instance.CommentPostId = req.params.post_id;
                instance.CommentAuthorId = user._id;
                instance.CommentContent = req.body.content;
                fetch(config.API_URI+'/comment/create',{
                    method:'POST',
                    headers:{"Content-Type" : "application/json"},
                    mode:'cors',
                    body : JSON.stringify(instance)
                }).then(response =>{
                    res.redirect('/home/user/'+req.params.user_id+'/post/'+req.params.post_id);
                }).catch(err => Common.error(err,res));
            }else{
                res.redirect('/home/user/'+req.params.user_id+'/post/'+req.params.post_id);
            }
        }).catch(err => Common.error(err,res));
    }else{
        res.redirect('/home/user/'+req.params.user_id+'/post/'+req.params.post_id);
    }
} 