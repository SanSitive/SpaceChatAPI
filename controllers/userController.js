let async = require('async');
let mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');
const { diffIndexes } = require('../models/user');

const config = require('../config')
const fetch = require('node-fetch')
const Common = require('../Common')

const bcrypt = require('bcryptjs/dist/bcrypt');

// GET request for one User
exports.user_detail_get = function(req,res,next){
    async.waterfall([
        function(callback){//récupère l'utilisateur par son Identify
            fetch(config.API_URI+'/user/by_identify/'+req.params.id,{
                method:'GET',
                headers:{"Content-Type" : "application/json"},
                mode:'cors'
            }).then(response => response.json()).then( user =>{
                if(!user){
                    let session;
                    if(Common.isConnected(req)){session = req.session}
                    let resultat = {UserStatus : 'Banned'};
                    res.render('user_detail',{title: 'User '+ req.params.id + ' not found', session:session, user:resultat })
                }else{
                    callback(user)
                }
            })
        }
    ],
    function(user, callback){//récupère les posts de l'utilisateur correspondant
        fetch(config.API_URI+'/posts/post_author_id/'+user._id,{
            method:'GET',
            headers:{"Content-Type" : "application/json"},
            mode:'cors'
        }).then( response => response.json()).then( posts => {
            if(user.UserPicture){
                user.UserPicture = user.UserPicture.slice(7);
            }
            let session;
            if(Common.isConnected(req)){session = req.session}
            if(!posts){
                res.render('user_detail',{title: 'User ' + req.params.id, session:session, user:user})
            }else{
                for(let i=0; i< posts.length; i++){
                    if(posts[i].PostPicture){
                        posts[i].PostPicture = posts[i].PostPicture.slice(7);
                    }
                }
                res.render('user_detail',{title: 'User ' + req.params.id, user:user, session:session, posts:posts})
            }
        }).catch(err => Common.error(err,res));
    })
};

// GET request for creating User
//Renvoie la page de création d'utilisateur
exports.user_create_get = function (req,res,next){
    let session;
    if(Common.isConnected(req)){session = req.session}
    res.render('user_form',{title:'User Form', session:session})
};

// POST request for creating User
exports.user_create_post = function(req,res,next){
    // Validate and sanitize fields.
    body('identifiant', 'Identifiant must not be empty.').trim().isLength({ min: 1 }).escape()
    body('pseudo', 'User name must not be empty.').trim().isLength({min: 1}).escape()
    body('email', 'Email must not be empty.').trim().isLength({ min: 1 }).escape()
    body('password', 'Password must not be empty.').trim().isLength({ min: 1 }).escape()
    //Pour stocker les futurs attributs
    // Process request after validation and sanitization.
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    
    let session;
    if(Common.isConnected(req)){session = req.session}
    
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        res.render('user_form', { title: 'User Form',user:req.body,session: session, errors: errors.array() });
        return;
    }
    else {
        //Mot de passe à encrypter
        let passw = req.body.password;
        fetch(config.API_URI+'/user/count/'+req.body.identifiant,{
            method:'GET',
            headers:{"Content-Type" : "application/json"},
            mode:'cors'
        }).then( response => response.json()).then( user_res => {
            if(user_res.number >= 1){
                let erros = "Votre identifiant n'est pas disponible";
                res.render('user_form', { title: 'User Form',user:req.body,session: session, erros: erros })
            }else{
                bcrypt.genSalt(10).then(salt =>{
                    bcrypt.hash(passw,salt).then(hashed =>{//Après avoir crypté le password on créer et sauvegarde l'utilisateur
                        let instance = {};
                        instance.UserId = req.body.identifiant;
                        instance.UserPseudo = req.body.pseudo;
                        instance.UserPassword = hashed;
                        instance.UserEmail = req.body.email;
                        console.log(instance)
                        fetch(config.API_URI+'/user/create',{
                            method:'POST',
                            headers:{"Content-Type" : "application/json"},
                            mode:'cors',
                            body : JSON.stringify(instance)
                        }).then(response => {
                            res.redirect('/home/connection')
                        }).catch(err => Common.error(err,res))
                    })
                }).catch(err => Common.error(err,res))   
            }
        }).catch(err => Common.error(err,res))
    }
};

// GET request to update User.
// Renvoie la page d'update form pour un utilisateur
exports.user_updatepage_get = function(req,res,next){
    if(Common.isConnected(req)){
        fetch(config.API_URI+'/user/by_id/'+req.session.user_id,{
            method:'GET',
            headers:{"Content-Type" : "application/json"},
            mode:'cors'
        }).then(response => response.json()).then(user => {
            if(user){
                if(req.params.id == user.UserId){
                    fetch(config.API_URI+'/styles',{
                        method:'GET',
                        headers:{"Content-Type" : "application/json"},
                        mode:'cors'
                    }).then(response => response.json()).then( styles => {
                        if(user.UserPicture){
                            user.UserPicture = user.UserPicture.slice(7)
                        }
                        if(Common.isConnected(req)){session = req.session}
                        res.render('user_update',{title: 'User Update Form',user:user, styles:styles, session:session });
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

// PATCH request to update User.
// Modifie les données utilisateur
exports.user_updatepage_patch = function(req,res,next){
    // Validate and sanitize fields.
    body('pseudo', 'Pseudo must not be empty.').trim().isLength({min:4}).escape();
    body('biography').trim().escape();
    body('style').trim().escape();
    
    // Process request after validation and sanitization.
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    let session;
    if(Common.isConnected(req)){session = req.session}
    //Create a user for temporary stock the data
    if (!req.body.pseudo){
            res.render('user_update',{title:'User Update Form', session:session, erros: "Il faut choisir un pseudo de plus de 4 charactères"})
        return;
    }
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        res.render('user_update', { title: 'User Update Form',user:user,session: session, errors: errors.array() });
        return;
    }
    else {
        if(Common.isConnected(req)){
            fetch(config.API_URI+'/user/by_id/'+req.session.user_id,{
                method:'GET',
                headers:{"Content-Type" : "application/json"},
                mode:'cors'
            }).then(response => response.json()).then(user => {
                if(user){
                    if(req.params.id == user.UserId){
                        fetch(config.API_URI+'/style/'+req.body.style,{
                            method:'GET',
                            headers:{"Content-Type" : "application/json"},
                            mode:'cors'
                        }).then(response => response.json()).then( style => {
                            let news = {UserBiography: req.body.biography, UserPseudo: req.body.pseudo, UserMode: style._id}
                            if(req.file){
                                news.UserPicture = req.file.path;
                            }
                            news._id = user._id;
                            req.session.Style = style.StyleUrl;//update l'utilisateur
                            fetch(config.API_URI+'/user/update',{
                                method:'PATCH',
                                headers:{"Content-Type" : "application/json"},
                                mode:'cors',
                                body : JSON.stringify(news)
                            }).then(response => response).then( user => {
                                res.redirect('/home/user/'+req.params.id);
                            }).catch(err => Common.error(err,res));

                        }).catch(err => Common.error(err,res))
                    }
                }
            }).catch(err => Common.error(err,res))
        }else{
            res.redirect('/home/feed');
        }
    }
};


// GET request for User page parameter
// Renvoie la page pour changer les paramètres utilisateur
exports.user_parameter_get = function(req,res,next){
    if(Common.isConnected(req)){
        fetch(config.API_URI+'/user/by_id/'+req.session.user_id,{
            method:'GET',
            headers:{"Content-Type" : "application/json"},
            mode:'cors'
        }).then(response => response.json()).then( user => {
            if(user){
                if(req.params.id == user.UserId){
                    if(user.UserPicture){
                        user.UserPicture = user.UserPicture.slice(7)
                    }
                    let session;
                    if(Common.isConnected(req)){session = req.session}
                    res.render('user_parameter',{title: 'User Update Form',user:user,session:session });
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
}

// PATCH request for User page parameter
exports.user_parameter_patch = function(req,res,next){
    // Validate and sanitize fields.
    body('email', 'Pseudo must not be empty.').trim().isLength({min:4}).escape();
    body('password1', 'Password must not be empty').trim().isLength({min:1}).escape();
    body('password2', 'Password must not be empty').trim().isLength({min:1}).escape();
    
    // Process request after validation and sanitization.
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    //Create a user for temporary stock the data
    let news = {UserEmail: req.body.email, UserPassword: req.body.password_a, UserPicture: undefined}
    let session;
    if(Common.isConnected(req)){session = req.session}
    //Si les mdp ne correspondent pas ou qu'il manque une info
    if (!req.body.email || !req.body.password_a || !req.body.password_b || (req.body.password_a != req.body.password_b)){
        if(req.body.password_a != req.body.password_b){
            res.render('user_parameter',{title:'User Parameter Form',user:news, session: session,  erros: "Les password ne sont pas égaux"})
        }else{
            res.render('user_parameter',{title:'User Parameter Form',user:news, session: session,  erros: "Il faut remplir le formulaire"})
        }
        return;
    }
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        res.render('user_update', { title: 'User Update Form',user:news, session:session, errors: errors.array() });
        return;
    }
    else {
        if(Common.isConnected(req) && req.body.password1 == req.body.password2){
            fetch(config.API_URI+'/user/by_id/'+req.session.user_id,{
                method:'GET',
                headers:{"Content-Type" : "application/json"},
                mode:'cors'
            }).then(response => response.json()).then(user => {
                if(user){
                    if(req.params.id == user.UserId){//Si l'utilisateur de la session est bien celui de la page concerné
                        bcrypt.genSalt(10).then(salt=>{
                            bcrypt.hash(news.UserPassword,salt).then(hashed=>{
                                news.UserPassword = hashed;
                                news._id = user._id;
                                fetch(config.API_URI+'/user/update',{
                                    method:'PATCH',
                                    headers:{"Content-Type" : "application/json"},
                                    mode:'cors',
                                    body : JSON.stringify(news)
                                }).then(response => response).then( user =>{
                                    res.redirect('/home/user/'+req.params.id);
                                }).catch(err => Common.error(err,res))
                            }).catch(err => Common.error(err,res))
                        }).catch(err => Common.error(err,res))
                    }else{
                        res.redirect('/home/feed');
                    }
                }else{
                    res.redirect('/home/feed');
                }
            })
        }else{
            res.redirect('/home/feed');
        }
    }
}

//GET request for all banned users
// Renvoie la page contenant toutes les personnes bannies
exports.user_get_all_banned = function(req,res,next){
    if(Common.isConnected(req)){
        fetch(config.API_URI+'/user/by_id/'+req.session.user_id,{
            method:'GET',
            headers:{"Content-Type" : "application/json"},
            mode:'cors'
        }).then(response => response.json()).then( user => {
            if(user.UserStatus == 'Admin'){//Si on est bien un admin on peut alors accéder à la page contenant toutes les personnes bannies
                fetch(config.API_URI+'/users/banned',{
                    method:'GET',
                    headers:{"Content-Type" : "application/json"},
                    mode:'cors'
                }).then(response => response.json()).then( users => {
                    if(users){
                        for(let i =0; i< users.length; i++){
                            if(users[i].UserPicture){
                                users[i].UserPicture = users[i].UserPicture.slice(7)
                            }
                        }
                        let session;
                        if(Common.isConnected(req)){session = req.session}
                        res.render('banned',{title:'All Users Banned', users: users, session:session});
                    }else{
                        res.redirect('/home/feed');
                    }
                }).catch(err => Common.error(err,res));
            }else{
                res.redirect('/home/feed');
            }
        }).catch(err => Common.error(err,res))
    }else{
        res.redirect('/home/feed');
    }
}

// GET request for unban someone page.
// Renvoie la page pour confirmer si l'on veut bien unban un utilisateur
exports.user_unban_someone_get = function(req,res,next){
    if(Common.isConnected(req)){
        fetch(config.API_URI+'/user/by_id/'+req.session.user_id,{
            method:'GET',
            headers:{"Content-Type" : "application/json"},
            mode:'cors'
        }).then(response => response.json()).then( user => {
            if(user.UserStatus == 'Admin'){
                fetch(config.API_URI+'/user/by_identify/'+req.params.id,{
                    method:'GET',
                    headers:{"Content-Type" : "application/json"},
                    mode:'cors'
                }).then(response => response.json()).then(user_res => {
                    if(user_res){
                        if(user_res.UserPicture){
                            user_res.UserPicture = user_res.UserPicture.slice(7)
                        }
                        let session;
                        if(Common.isConnected(req)){session = req.session}
                        res.render('user_unban',{title:'User '+req.params.id, user: user_res, session:session});
                    }else{
                        res.redirect('/home/feed');
                    }
                }).catch(err => Common.error(err,res));
            }else{
                res.redirect('/home/feed');
            }
        }).catch(er => Common.error(err,res));
    }else{
        res.redirect('/home/feed');
    }
}

//PATCH request for unban someone page
//Update les données d'un utilisateur en enlevant le bannissement
exports.user_unban_someone_patch = function(req,res,next){
    console.log(req.params.id)
    if(Common.isConnected(req)){
        fetch(config.API_URI+'/user/by_id/'+req.session.user_id,{
            method:'GET',
            headers:{"Content-Type" : "application/json"},
            mode:'cors'
        }).then(response => response.json()).then( user => {
            if(user.UserStatus == 'Admin'){//Si on est bien un admin on peut alors accéder à la page contenant toutes les personnes bannies
                fetch(config.API_URI+'/user/by_identify/'+req.params.id,{
                    method:'GET',
                    headers:{"Content-Type" : "application/json"},
                    mode:'cors'
                }).then(response => response.json()).then( user_res =>{
                    let news = {UserStatus : 'Classic'}
                    news._id = user_res._id;
                    fetch(config.API_URI+'/user/update',{
                        method:'PATCH',
                        headers:{"Content-Type" : "application/json"},
                        mode:'cors',
                        body : JSON.stringify(news)
                    }).then(response => response).then(final => {
                        res.redirect('/home/user/'+user_res.UserId);
                    }).catch(err => Common.error(err,res));
                }).catch(err => Common.error(err,res));
            }
        }).catch(err => Common.error(err,res));
    }else{
        res.redirect('/home/feed');
    }
}

// GET request for ban someone page.
// Renvoie la page pour confirmer si l'on veut bien ban un utilisateur
exports.user_ban_someone_get = function(req,res,next){
    if(Common.isConnected(req)){
        fetch(config.API_URI+'/user/by_id/'+req.session.user_id,{
            method:'GET',
            headers:{"Content-Type" : "application/json"},
            mode:'cors'
        }).then(response => response.json()).then(user =>{
            if(user.UserStatus == 'Admin'){
                fetch(config.API_URI+'/user/by_identify/'+req.params.id,{
                    method:'GET',
                    headers:{"Content-Type" : "application/json"},
                    mode:'cors'
                }).then(response => response.json()).then(user_res => {
                    if(user_res){
                        if(user.UserPicture){
                            user.UserPicture = user.UserPicture.slice(7)
                        }
                        let session;
                        if(Common.isConnected(req)){session = req.session}
                        res.render('user_ban',{title:'User '+req.params.id, user: user_res, session:session});
                    }else{
                        res.redirect('/home/feed');
                    }
                }).catch(err => Common.error(err,res));
            }else{
                res.redirect('/home/feed');
            }
        }).catch(err => Common.error(err,res));
    }else{
        res.redirect('/home/feed');
    }
}

//PATCH request for ban someone page.
//Update les données d'un utilisateur en le bannissant
exports.user_ban_someone_patch = function(req,res,next){
    if(Common.isConnected(req)){
        fetch(config.API_URI+'/user/by_id/'+req.session.user_id,{
            method:'GET',
            headers:{"Content-Type" : "application/json"},
            mode:'cors'
        }).then(response => response.json()).then(user => {
            if(user.UserStatus == 'Admin'){
                fetch(config.API_URI+'/user/by_identify/'+req.params.id).then(response => response.json()).then(user_res => {
                    let news = {UserStatus : 'Banned'}
                    news._id = user_res._id;
                    fetch(config.API_URI+'/user/update',{
                        method:'PATCH',
                        headers:{"Content-Type" : "application/json"},
                        mode:'cors',
                        body : JSON.stringify(news)
                    }).then(response => response).then(final => {
                        res.redirect('/home/user/'+user_res.UserId);
                    }).catch(err => Common.error(err,res));
                }).catch(err=> Common.error(err,res));
            }else{
                res.redirect('/home/feed');
            }
        }).catch(err => Common.error(err,res));
    }else{
        res.redirect('/home/feed');
    }
}

//POST request for follow someone
// Permet de follow un utilisateur en inserrant une instance dans la table associé
exports.user_follow_someone_post = function(req,res,next){
    if(Common.isConnected(req)){
        fetch(config.API_URI+'/user/by_identify/'+req.params.id,{
            method:'GET',
            headers:{"Content-Type" : "application/json"},
            mode:'cors'
        }).then(response => response.json()).then( user =>{
            if(user){
                let object = {user_suivant:req.session.user_id,user_suivi:user._id}
                fetch(config.API_URI+'/follow/is_following/user_suivant/'+object.user_suivant+'/user_suivi/'+object.user_suivi,{
                    method:'GET',
                    headers:{"Content-Type" : "application/json"},
                    mode:'cors',
                }).then(response => response.json()).then( count => {
                    console.log(count.number)
                    if(count.number < 1){//Si l'on est pas encore abonné
                        let instance ={};
                         instance.UserIdSuivant= req.session.user_id
                         instance.UserIdSuivi= user._id;
                        fetch(config.API_URI+'/follow'+'/create',{
                            method:'POST',
                            headers:{"Content-Type" : "application/json"},
                            mode:'cors',
                            body:JSON.stringify(instance)
                        }).then(response => {
                            res.redirect('/home/user/'+req.params.id);

                        }).catch(err => Common.error(err,res))
                    }else{//Si on suit déjà l'utilisateur
                        res.redirect('/home/user/'+req.params.id)
                    }
                }).catch(err => Common.error(err,res));
            }else{
                res.redirect('/home/user/'+req.params.id)
            }
        }).catch(err => Common.error(err,res));
    }else{
        res.redirect('/home/user/'+req.params.id)
    }
}


//DELETE request for unfollow someone
// Permet d'unfollow un utilisateur en supprimant l'instance de la table associé
exports.user_unfollow_someone_delete = function(req,res,next){
    if(Common.isConnected(req)){
        fetch(config.API_URI+'/user/by_identify/'+req.params.id,{
            method:'GET',
            headers:{"Content-Type" : "application/json"},
            mode:'cors'
        }).then(response => response.json()).then( user => {
            if(user){
                let object = {user_suivant:req.session.user_id,user_suivi:user._id}
                fetch(config.API_URI+'/follow/is_following/user_suivant/'+object.user_suivant+'/user_suivi/'+object.user_suivi,{
                    method:'GET',
                    headers:{"Content-Type" : "application/json"},
                    mode:'cors',
                }).then(response => response.json()).then(count =>{
                    if(count.number > 0){//Si l'on suit déjà la personne
                        fetch(config.API_URI+'/follow/instance/user_suivant/'+object.user_suivant+'/user_suivi/'+object.user_suivi,{
                            method:'GET',
                            headers:{"Content-Type" : "application/json"},
                            mode:'cors',
                        }).then(response => response.json()).then(follow => {
                            if(follow){//Si on suit bien quelqu'un
                                let news = {_id: follow._id}
                                fetch(config.API_URI+'/follow/delete',{
                                    method:'DELETE',
                                    headers:{"Content-Type" : "application/json"},
                                    mode:'cors',
                                    body:JSON.stringify(news)
                                }).then(response => response).then(final => {
                                    res.redirect('/home/user/'+req.params.id)
                                }).catch(err => Common.error(err,res))
                            }
                        }).catch(err => Common.error(err,res))
                    }else{//Si on ne la suit pas
                        res.redirect('/home/user/'+req.params.id)
                    }
                }).catch(err => Common.error(err,res))
            }else{
                res.redirect('/home/user/'+req.params.id)
            }
        }).catch(err => Common.error(err,res))
    }else{
        res.redirect('/home/user/'+req.params.id)
    }
}
