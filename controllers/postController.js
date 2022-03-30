
let async = require('async');
let Tag = require('../models/tag');
let mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');
const { diffIndexes } = require('../models/user');

const Common = require('../Common');
const fetch = require('node-fetch');


// GET request for create post page
// Renvoie la page de création de post
exports.user_create_postpage_get = function(req,res,next){
    if(Common.isConnected(req)){
        fetch(process.env.API_URI+'/user/by_id/'+req.session.user_id,{
            method:'GET',
            headers:{"Content-Type" : "application/json"},
            mode:'cors'
        }).then(response => response.json()).then( user =>{
            if(user){
                if(req.params.user_id == user.UserId){
                    let session;
                    if(Common.isConnected(req)){session = req.session}
                    res.render('post_form',{title: 'Post Form', session:session});
                }else{
                    res.redirect('/home/feed');
                }
            }else{
                res.redirect('/home/feed');
            }
        }).catch(err => Common.error(err,res))
    }else{
        res.redirect('/home/feed');
    }
};


// POST request for ceating post page
// Pour créer un post
exports.user_create_postpage_post = function(req,response,next){
    
    // Validate and sanitize fields.
    body('description', 'Identifiant must not be empty.').trim().escape()
    
    // Process request after validation and sanitization.
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    let session;
    if(Common.isConnected(req)){session = req.session}
    
    //Create a user for temporary stock the data
    if (!req.body.description || !req.file){
        if(req.body.description){
            response.render('post_form',{title: 'Post form', post:req.body, session:session, erros: "Il faut choisir une image"})
        }else{
            response.render('post_form',{title:'Post form', session: session, erros: "Il faut choisir une image et une description"})
        }
        return;
    }
    
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        response.render('post_form', { title: 'User Form',post:req.body,session: session, errors: errors.array() });
        return;
    }
    else {
        if(Common.isConnected(req)){
            fetch(process.env.API_URI+'/user/by_id/'+req.session.user_id,{
                method:'GET',
                headers:{"Content-Type" : "application/json"},
                mode:'cors'
            }).then(response => response.json()).then( user => {
                if(user){
                    if(req.params.user_id == user.UserId){
                        fetch(process.env.API_URI+'/tags',{
                            method:'GET',
                            headers:{"Content-Type" : "application/json"},
                            mode:'cors'
                        }).then(response => response.json()).then( tags =>{
                            let object = prepareTagToCreate(req,user,tags);//Prépare les tableaux d'id de tag à créer ou pas
                            let tagsNotCreated = object.tagsNotCreated;
                            let tagsIdCreated = object.tagsIdCreated;
                            async.each(tagsNotCreated,function(tag,callback){
                                let instance = {TagName: tag}
                                fetch(process.env.API_URI+'/tag/create',{
                                    method:'POST',
                                    headers:{"Content-Type" : "application/json"},
                                    mode:'cors',
                                    body:JSON.stringify(instance)
                                }).then(response => response.json()).then( tag_res =>{
                                    tagsIdCreated.push(tag_res._id);
                                    callback(null,tag_res)
                                }).catch(err => Common.error(err,res))
                            },function(){
                                let post ={
                                    PostAuthor : user._id,
                                    PostDescription : req.body.description,
                                    PostTags : tagsIdCreated,
                                    PostPicture : req.file.path
                                }
                                fetch(process.env.API_URI+'/post/create',{
                                    method:'POST',
                                    headers:{"Content-Type" : "application/json"},
                                    mode:'cors',
                                    body:JSON.stringify(post)
                                }).then(response => response).then( post =>{
                                    response.redirect('/home/user/'+user.UserId)
                                }).catch(err => Common.error(err,res))
                            })
                        })
                    }
                }
            }).catch(err => Common.error(err,res))
        }else{
            response.redirect('/home/feed');
        }
    }
};


// GET request for specific post
// Renvoie la page d'un post spécifique
exports.user_specific_postpage_get = function(req,res,next){
    fetch(process.env.API_URI+'/post/populated/id/'+req.params.post_id,{
        method:'GET',
        headers:{"Content-Type" : "application/json"},
        mode:'cors' 
    }).then(response => response.json()).then(post =>{
        if(post){
            fetch(process.env.API_URI+'/comments/'+req.params.post_id,{
                method:'GET',
                headers:{"Content-Type" : "application/json"},
                mode:'cors'
            }).then(response => response.json()).then( comments => {
                let user;
                if(post.PostAuthor.UserPicture){
                    user = post.PostAuthor.UserPicture.slice(7);
                }
                if(comments){
                    comments = comments.sort(function compare(a,b){ return b.CommentDate - a.CommentDate});
                }
                let session;
                if(Common.isConnected(req)){session = req.session}
                if(post.PostPicture){
                    post.PostPicture = post.PostPicture.slice(7)
                }
                for(let i=0; i<comments.length; i++){
                    if(comments[i].CommentAuthorId.UserPicture){
                        comments[i].CommentAuthorId.UserPicture = comments[i].CommentAuthorId.UserPicture.slice(7)
                    }
                }
                res.render('post_detail',{title: 'Post detail', post: post,userPicture: user,comments: comments, session:session})
            }).catch(err => Common.error(err,res));
        }else{
            res.render('post_detail',{title: 'Post detail', session:session})
        }
    }).catch(err => Common.error(err,res))
};


// GET request for update a specific post
// Renvoie la page d'update de post
exports.user_specific_post_updatepage_get = function(req,res,next){
    if(Common.isConnected(req)){
        fetch(process.env.API_URI+'/user/by_id/'+req.session.user_id,{
            method:'GET',
            headers:{"Content-Type" : "application/json"},
            mode:'cors'
        }).then(response => response.json()).then( user =>{
            if(user){
                if(req.params.user_id == user.UserId){//Si l'on est bien l'auteur du post on accède à la page de modification
                    fetch(process.env.API_URI+'/post/'+req.params.post_id,{
                        method:'GET',
                        headers:{"Content-Type" : "application/json"},
                        mode:'cors'
                    }).then(response => response.json()).then( post => {
                        if(post){
                            let session;
                            if(Common.isConnected(req)){session = req.session}
                            res.render('post_update_form',{title: 'Post Form',post: post, session:session});
                        }else{
                            res.redirect('/home/feed');
                        }
                    }).catch(err => Common.error(err,res));
                }else{
                    res.redirect('/home/feed');
                }
            }else{
                res.redirect('/home/feed');
            }
        }).catch(err => Common.error(err,res))
    }else{
        res.redirect('/home/feed');
    }
};


// PATCH request for update a specific post
// Modifie le post 
exports.user_specific_post_updatepage_patch = function(req,response,next){
    // Validate and sanitize fields.
    body('description', 'Identifiant must not be empty.').trim().escape()
    
    // Process request after validation and sanitization.
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    let session;
    if(Common.isConnected(req)){session = req.session}
    
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        response.render('post_form', { title: 'User Form',post:req.body, session: session, errors: errors.array() });
        return;
    }
    else {
        if(Common.isConnected(req)){
            fetch(process.env.API_URI+'/user/by_id/'+req.session.user_id,{
                method:'GET',
                headers:{"Content-Type" : "application/json"},
                mode:'cors'
            }).then(response => response.json()).then( user => {
                if(user){
                    if(req.params.user_id == user.UserId){
                        fetch(process.env.API_URI+'/tags',{
                            method:'GET',
                            headers:{"Content-Type" : "application/json"},
                            mode:'cors'
                        }).then(response => response.json()).then( tags => {
                            let object = prepareTagToCreate(req,user,tags);//Prépare les tableaux pour savoir quels tags créer ou pas
                            let tagsNotCreated = object.tagsNotCreated;
                            let tagsIdCreated = object.tagsIdCreated;
                            async.each(tagsNotCreated,function(tag,callback){//Pour chaque tags à créer on le fait
                                let instance = {TagName : tag};
                                fetch(process.env.API_URI+'/tag/create',{
                                    method:'POST',
                                    headers:{"Content-Type" : "application/json"},
                                    mode:'cors',
                                    body:JSON.stringify(instance)
                                }).then(response => response.json()).then( tag_res =>{
                                    tagsIdCreated.push(tag_res._id);
                                    callback(null,tag_res)
                                }).catch(err => Common.error(err,res))
                            },function(err){
                                let post ={
                                    _id: req.params.post_id,
                                    PostAuthor : user._id,
                                    PostDescription : req.body.description,
                                    PostTags : tagsIdCreated,
                                }
                                fetch(process.env.API_URI+'/post/update',{
                                    method:'PATCH',
                                    headers:{"Content-Type" : "application/json"},
                                    mode:'cors',
                                    body:JSON.stringify(post)
                                }).then(response => response).then( post =>{
                                    response.redirect('/home/user/'+user.UserId)
                                }).catch(err => Common.error(err,res))
                            })
                        }).catch(err => Common.error(err,res))
                    }
                }
            }).catch(err => Common.error(err,res))
        }else{
            response.redirect('/home/feed');
        }
    }
};


// GET request for specific post on delete page
// Renvoie une page pour confirmer que l'on veut bien détruire le post
exports.user_specific_post_deletepage_get = function(req,res,next){
    if(Common.isConnected(req)){
        fetch(process.env.API_URI+'/user/by_id/'+req.session.user_id,{
            method:'GET',
            headers:{"Content-Type" : "application/json"},
            mode:'cors'
        }).then(response => response.json()).then(user => {
            if (user){
                if(req.params.user_id == user.UserId || user.UserStatus == 'Admin'){//Si l'utilisateur est bien celui concerné par la page
                    fetch(process.env.API_URI+'/post/'+req.params.post_id,{
                        method:'GET',
                        headers:{"Content-Type" : "application/json"},
                        mode:'cors'
                    }).then(response => response.json()).then( post =>{
                        if (post){
                            let session;
                            if(Common.isConnected(req)){session = req.session}
                            res.render('post_delete',{title: 'Delete Form', post: post, session:session})
                        }else{
                            res.redirect('/home/feed')
                        }
                    }).catch(err => Common.error(err,res))
                }else{
                    res.redirect('/home/feed');
                }
            }else{
                res.redirect('/home/feed');
            }
        }).catch(err => Common.error(err,res))
    }else{
        res.redirect('/home/feed');
    }
};



// DELETE request for specific post on delete page
// Détruit le post passé en paramètre
exports.user_specific_post_deletepage_delete = function(req,res,next){
    if(Common.isConnected(req)){
        fetch(process.env.API_URI+'/user/by_id/'+req.session.user_id,{
            method:'GET',
            headers:{"Content-Type" : "application/json"},
            mode:'cors'
        }).then(response => response.json()).then( user => {
            if(user){
                if(req.params.user_id == user.UserId || user.UserStatus == 'Admin'){
                    let object = {_id: req.params.post_id};
                    fetch(process.env.API_URI+'/post/delete',{
                        method:'DELETE',
                        headers:{"Content-Type" : "application/json"},
                        mode:'cors',
                        body:JSON.stringify(object)
                    }).then(response => response).then(final => {
                        //if success :
                        res.redirect('/home/user/'+req.params.user_id)
                    }).catch(err => Common.error(err,res))
                }else{
                    res.redirect('/home/feed');
                }
            }else{
                res.redirect('/home/feed');
            }
        }).catch(err => Common.error(err,res));
    }else{
        res.redirect('/home/feed');
    }
};


//USEFULS FUNCTIONS
//Permet d'extraire les hashtags de la description
// en déterminant le hashtags et son caractère espace le plus proche
function extractTags(str){
    const s = str;
    let indexs = [];
    for(let i =0; i< s.length; i++){
        if (s[i] === '#'){
            indexs.push(i);
        }
    }
    let spaces = [];
    for(let i= indexs[0]; i< s.length; i++){
        if (s[i] === ' '){
            spaces.push(i);
        }
    }

    let k = 0;
    let m = 0;
    resultat = {indexs : [], spaces: []};
    while (k<indexs.length && m<spaces.length){
        if(spaces[m] < indexs[k+1] && spaces[m] > indexs[k] && k!= indexs.length -1 ){
            resultat.indexs.push(indexs[k]);
            resultat.spaces.push(spaces[m]);
            k++;
            m++;
        }else if (spaces[m] > indexs[k] && k == indexs.length -1){
            resultat.indexs.push(indexs[k]);
            resultat.spaces.push(spaces[m]);
            k++;
            m++;
        }else{
            m++;
        }
    }
    if (indexs[indexs.length -1] > spaces[spaces.length -1]){
        resultat.indexs.push(indexs[indexs.length -1]);
        resultat.spaces.push(s.length);
    }

    let tags = [];
    for(let i =0; i<resultat.indexs.length; i++){
        tags.push(s.substring(resultat.indexs[i]+1, resultat.spaces[i]));
    }
    return tags;
};

//Retourner tout un tableau de string en minuscule
function lowerCaseTab(tab){
    for(let i=0 ; i<tab.length; i++){
        tab[i] = tab[i].charAt(0).toLowerCase() + tab[i].slice(1);
    }
    return tab;
}

//Not used
async function createTag(TagName,cb){
    let tag = new Tag({ TagName: TagName });    
    tag.save(function (err) {
    if (err) {
        cb(err, null);
        return;
    }
    tags.push(tag)
    cb(null, tag);
    }   );
}

function prepareTagToCreate(req,user_res,tags){
    //Extraire les hashtags
    let temp_tag = extractTags(req.body.description + ' ');
    let temp = {
        description : req.body.description,
        tags : temp_tag,
    };
    //Post temporaire
    let post ={
            PostAuthor : user_res._id,
            PostDescription : temp.description,
            PostTags : lowerCaseTab(temp.tags)
    }
    let tagsNotCreated= [];
    let tagsCreated = [];
    let tempTag = []; //Stocker temporairement les noms des tags déjà créer afin des les comparer avec les hastags extraits
    for(let i =0; i<tags.length; i++){
        tempTag.push(tags[i].TagName);
    }
    //Répartir les tags à créer et ceux déjà créés
    for(let j=0; j<post.PostTags.length; j++){
        if(tempTag.indexOf(post.PostTags[j]) == -1){
            tagsNotCreated.push(post.PostTags[j]);
        }else{
            tagsCreated.push(post.PostTags[j])
        }
    }
    //Mettre dans un object les tags à créer que l'on passe dans un Array de tags déjà créer
    let tempObject = {};
    for(let i =0; i<tags.length; i++){
        tempObject[tags[i].TagName] = tags[i]._id;
    }
    let tagsIdCreated = [];
    for(let i =0; i<tagsCreated.length; i++ ){
        tagsIdCreated.push(tempObject[tagsCreated[i]]);
    }
    return {tagsNotCreated : tagsNotCreated, tagsIdCreated: tagsIdCreated};
}