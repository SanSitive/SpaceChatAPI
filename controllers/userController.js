let async = require('async');
let mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');
const multer = require('multer');
const upload = multer({
    dest: 'uploads/'
});
const { diffIndexes } = require('../models/user');
const fs = require('fs-extra');


const user_function = require('../API/user');
const post_function = require('../API/post');
const follow_function = require('../API/follow');
const bcrypt = require('bcryptjs/dist/bcrypt');
const style_function = require('../API/style');

// GET request for one User
exports.user_detail_get = function(req,res,next){
    async.waterfall([
        function(callback){//récupère l'utilisateur par son Identify
            user_function.getUserByIdentify(req.params.id).then((user) => {
                if(!user){
                    let session;
                    if(user_function.isConnected(req)){session = req.session}
                    let resultat = {UserStatus : 'Banned'};
                    res.render('user_detail',{title: 'User '+ req.params.id + ' not found', session:session, user:resultat })
                }else{
                    callback(user)
                }
            }).catch(err => {next(err)})

        }
    ],
    function(user, callback){//récupère les posts de l'utilisateur correspondant
        post_function.getPostByAuthorId(user._id).then((posts) => {
            user.UserPicture = user.UserPicture.slice(7);
            let session;
            if(user_function.isConnected(req)){session = req.session}
            if(!posts){
                res.render('user_detail',{title: 'User ' + req.params.id, session:session, user:user})
            }else{
                for(let i=0; i< posts.length; i++){
                    posts[i].PostPicture = posts[i].PostPicture.slice(7);
                }
                res.render('user_detail',{title: 'User ' + req.params.id, user:user, session:session, posts:posts})
            }
        }).catch(err => {next(err)})
    }
    )
};

// GET request for creating User
//Renvoie la page de création d'utilisateur
exports.user_create_get = function (req,res,next){
    let session;
    if(user_function.isConnected(req)){session = req.session}
    res.render('user_form',{title:'User Form', session:session})
};

// POST request for creating User
exports.user_create_post = function(req,res,next){
    // Validate and sanitize fields.
    body('identifiant', 'Identifiant must not be empty.').trim().isLength({ min: 1 }).escape()
    body('pseudo', 'User name must not be empty.').trim().isLength({min: 1}).escape()
    body('email', 'Email must not be empty.').trim().isLength({ min: 1 }).escape()
    body('password', 'Password must not be empty.').trim().isLength({ min: 1 }).escape()
    
    // Process request after validation and sanitization.
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    let session;
    if(user_function.isConnected(req)){session = req.session}
    
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        res.render('user_form', { title: 'User Form',user:req.body,session: session, errors: errors.array() });
        return;
    }
    else {
        //Mot de passe à encrypter
        let passw = req.body.password;
        user_function.getUserByIdentify(req.body.identifiant).then((user_res) => {
            if(!user_res){
                bcrypt.genSalt(10).then(salt =>{
                    bcrypt.hash(passw,salt).then(hashed =>{//Après avoir crypté le password on créer et sauvegarde l'utilisateur
                        let user = user_function.create(req.body.identifiant, req.body.pseudo, hashed, req.body.email)
                        user_function.save(user).then(
                            res.redirect('/home/connection')
                        ).catch(err => {next(err)})
                    })
                }).catch(err => {next(err)})
            }else{
                let erros = "Votre identifiant n'est pas disponible";
                res.render('user_form', { title: 'User Form',user:req.body,session: session, erros: erros })
            }
        }).catch(err => {next(err)})
    }
};

// GET request to update User.
// Renvoie la page d'update form pour un utilisateur
exports.user_updatepage_get = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user) => {
            if(user){
                if(req.params.id == user.UserId){//Si l'utilisateur de la session est bien celui qui est concerné par la page
                    style_function.getAllStyle().then(styles => {//Récupère tout les modes de page (exemple: dark mode, light mode)
                        user.UserPicture = user.UserPicture.slice(7)
                        let session;
                        if(user_function.isConnected(req)){session = req.session}
                        res.render('user_update',{title: 'User Update Form',user:user, styles:styles, session:session });
                    })
                }else{
                    res.redirect('/home/feed');
                }
            }
            else{
                res.redirect('/home/feed');
            }
        }).catch(err => {next(err)})
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
    if(user_function.isConnected(req)){session = req.session}
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
        if(user_function.isConnected(req)){
            user_function.getUserById(req.session.user_id).then((user) =>{
                if(user){
                    if(req.params.id == user.UserId){//Si l'utilisateur trouvé est bien celui correspondant à la page associé
                        style_function.getStyleByName(req.body.style).then(style => {//Récupère l'identifiant du style associé
                            let news = {UserBiography: req.body.biography, UserPseudo: req.body.pseudo, UserMode: style._id}
                            if(req.file){
                                    news.UserPicture = req.file.path;
                                    req.session.Style = style.StyleUrl;//update l'utilisateur
                                    user_function.updateById(user._id,news).then((user) => {
                                        res.redirect('/home/user/'+req.params.id);
                                    }).catch(err => {next(err)})
                            }else{
                                req.session.Style = style.StyleUrl;//update l'utilisateur
                                    user_function.updateById(user._id,news).then((user) => {
                                        res.redirect('/home/user/'+req.params.id);
                                    }).catch(err => {next(err)})
                            }
                        }).catch(err => {next(err)})
                    }else{
                        res.redirect('/home/feed');
                    }
                }else{
                    res.redirect('/home/feed'); 
                }

            }).catch(err => {next(err)})
        }else{
            res.redirect('/home/feed');
        }
    }
};


// GET request for User page parameter
// Renvoie la page pour changer les paramètres utilisateur
exports.user_parameter_get = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user)=>{
            if(user){
                if(req.params.id == user.UserId){
                    user.UserPicture = user.UserPicture.slice(7)
                    let session;
                    if(user_function.isConnected(req)){session = req.session}
                    res.render('user_parameter',{title: 'User Update Form',user:user,session:session });
                }else{
                    res.redirect('/home/feed');
                }
            }else{
                res.redirect('/home/feed');
            }
        }).catch(err => {next(err)}) 
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
    if(user_function.isConnected(req)){session = req.session}
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
        if(user_function.isConnected(req) && req.body.password1 == req.body.password2){
            user_function.getUserById(req.session.user_id).then((user)=>{
                if(user){
                    if(req.params.id == user.UserId){//Si l'utilisateur de la session est bien celui de la page concerné
                        bcrypt.genSalt(10).then(salt=>{
                            bcrypt.hash(news.UserPassword,salt).then(hashed=>{
                                news.UserPassword = hashed;
                                user_function.updateById(user._id,news).then(()=>{
                                    res.redirect('/home/user/'+req.params.id);
                            })
                        }).catch(err => {next(err)})
                        }).catch(err => {next(err)})
                    }else{
                        res.redirect('/home/feed');
                    }
                }else{
                    res.redirect('/home/feed');
                }
            }).catch(err => {next(err)})
        }else{
            res.redirect('/home/feed');
        }
    }
}

//GET request for all banned users
// Renvoie la page contenant toutes les personnes bannies
exports.user_get_all_banned = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user) => {
            if(user.UserStatus == 'Admin'){//Si on est bien un admin on peut alors accéder à la page contenant toutes les personnes bannies
                user_function.getAllUserBanned().then((users) => {
                    if(users){
                        for(let i =0; i< users.length; i++){
                            users[i].UserPicture = users[i].UserPicture.slice(7)
                        }
                        let session;
                        if(user_function.isConnected(req)){session = req.session}
                        res.render('banned',{title:'All Users Banned', users: users, session:session});
                    }else{
                        res.redirect('/home/feed');
                    }
                }).catch(err => {next(err)})
            }else{
                res.redirect('/home/feed');
            }
        }).catch(err => {next(err)})
    }else{
        res.redirect('/home/feed');
    }
}

// GET request for unban someone page.
// Renvoie la page pour confirmer si l'on veut bien unban un utilisateur
exports.user_unban_someone_get = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user)=>{
            if(user.UserStatus == 'Admin'){
                user_function.getUserByIdentify(req.params.id).then((user_res)=>{
                    if(user_res){
                        user.UserPicture = user.UserPicture.slice(7)
                        let session;
                        if(user_function.isConnected(req)){session = req.session}
                        res.render('user_unban',{title:'User '+req.params.id, user: user_res, session:session});
                    }else{
                        res.redirect('/home/feed');
                    }
                }).catch(err => {next(err)})
            }else{
                res.redirect('/home/feed');
            }
        }).catch(err => {next(err)})
    }else{
        res.redirect('/home/feed');
    }
}

//PATCH request for unban someone page
//Update les données d'un utilisateur en enlevant le bannissement
exports.user_unban_someone_patch = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user)=>{
            if(user.UserStatus == 'Admin'){//Si on est bien un admin on peut alors accéder à la page contenant toutes les personnes bannies
                user_function.getUserByIdentify(req.params.id).then((user_res)=>{
                    let news = {UserStatus : 'Classic'}
                    let id = user_res._id;
                    user_function.updateById(id,news).then((final)=>{
                        res.redirect('/home/user/'+final.UserId);
                    })
                }).catch(err => {next(err)})
            }else{
                res.redirect('/home/feed');
            }
        }).catch(err => {next(err)})
    }else{
        res.redirect('/home/feed');
    }
}

// GET request for ban someone page.
// Renvoie la page pour confirmer si l'on veut bien ban un utilisateur
exports.user_ban_someone_get = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user)=>{
            if(user.UserStatus == 'Admin'){
                user_function.getUserByIdentify(req.params.id).then((user_res)=>{
                    if(user_res){
                        user.UserPicture = user.UserPicture.slice(7)
                        let session;
                        if(user_function.isConnected(req)){session = req.session}
                        res.render('user_ban',{title:'User '+req.params.id, user: user_res, session:session});
                    }else{
                        res.redirect('/home/feed');
                    }
                }).catch(err => {next(err)})
            }else{
                res.redirect('/home/feed');
            }
        }).catch(err => {next(err)})
    }else{
        res.redirect('/home/feed');
    }
}

//PATCH request for ban someone page.
//Update les données d'un utilisateur en le bannissant
exports.user_ban_someone_patch = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user)=>{
            if(user.UserStatus == 'Admin'){
                user_function.getUserByIdentify(req.params.id).then((user_res)=>{
                    let news = {UserStatus : 'Banned'}
                    user_function.updateById(user_res._id,news).then((final)=>{
                        res.redirect('/home/user/'+final.UserId);
                    }).catch(err => {next(err)})
                }).catch(err => {next(err)})
            }else{
                res.redirect('/home/feed');
            }
        }).catch(err => {next(err)})
    }else{
        res.redirect('/home/feed');
    }
}

//POST request for follow someone
// Permet de follow un utilisateur en inserrant une instance dans la table associé
exports.user_follow_someone_post = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserByIdentify(req.params.id).then(user =>{
            if(user){
                follow_function.isCurrentUserFollowing(req.session.user_id,user._id).then(follow =>{
                    if(!follow){//Si l'on n'est pas en train de suivre la personne
                        let instance = follow_function.create(req.session.user_id,user._id);
                        follow_function.save(instance).then(follow_res =>{
                            res.redirect('/home/user/'+req.params.id);
                        }).catch(err => {next(err)})
                    }else{//Si on la suit déjà
                        res.redirect('/home/user/'+req.params.id)
                    }
                }).catch(err => {next(err)})
            }else{
                res.redirect('/home/user/'+req.params.id)
            }
        }).catch(err => {next(err)})
    }else{
        res.redirect('/home/user/'+req.params.id)
    }
}


//DELETE request for unfollow someone
// Permet d'unfollow un utilisateur en supprimant l'instance de la table associé
exports.user_unfollow_someone_delete = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserByIdentify(req.params.id).then(user =>{
            if(user){
                follow_function.isCurrentUserFollowing(req.session.user_id,user._id).then(follow =>{
                    if(follow){//Si l'on suit déjà la personne
                        follow_function.delete(follow._id).then(done=>{
                            res.redirect('/home/user/'+req.params.id)
                        }).catch(err => {next(err)})
                    }else{//Si on ne la suit pas
                        res.redirect('/home/user/'+req.params.id)
                    }
                }).catch(err => {next(err)})
            }else{
                res.redirect('/home/user/'+req.params.id)
            }
        }).catch(err => {next(err)})
    }else{
        res.redirect('/home/user/'+req.params.id)
    }
}
