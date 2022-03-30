
let mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const config = require('../config');
const Common = require('../Common')
const fetch = require('node-fetch');

/// CONNECTION ROUTES ///
// GET request for connection page.
// Renvoie la page de connexion
exports.connection_get = function(req,res,next){
    let session;
    if(Common.isConnected(req)){session = req.session}
    res.render('connection_form',{title:'Connection', session:session});
};

// GET connection check.
//Vérifie si l'on est bien la personne que l'on veut prétendre être
exports.connection_getdata = function(req,res,next){
    // Validate and sanitize fields.
    body('identifiant', 'Identifiant must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('password', 'Password must not be empty.').trim().isLength({ min: 1 }).escape()
    
    // Process request after validation and sanitization.
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    
    //Create a user for temporary stock the data
    
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        res.render('connection_form', { title: 'Connection',user:req.body,errors: errors.array() });
        return;
    }
    else {
        let user_data = {
            pseudo : req.body.identifiant,
            password : String(req.body.password)
        };
        // Data from form is valid. Check DB

        fetch(config.API_URI + '/user/populated/by_identify/'+user_data.pseudo,{
            method: 'GET',
            headers:{"Content-Type" : "application/json"},
            mode:'cors'
        }).then( response => response.json()).then( user =>{
            if (user){
                bcrypt.compare(user_data.password,user.UserPassword).then(response =>{
                    if(response && user.UserStatus!='Banned'){
                        const sess= req.session;
                        sess.user_id = user._id;
                        sess.Identify = user.UserId;
                        sess.Status = user.UserStatus;
                        sess.Style = user.UserMode.StyleUrl
                        res.redirect('/home/user/'+user_data.pseudo);
                    }else{
                        let erros = "Votre mot de passe ou identifiant n'est pas le bon";
                        if(user.UserStatus =='Banned'){
                            erros = "Votre compte est banni";
                        }
                        res.render('connection_form', { title: 'Connection',user:req.body,erros: erros });
                    }
                }).catch(err => Common.error(err,res))
            }else{
                let erros = "Votre mot de passe ou identifiant n'est pas le bon";
                res.render('connection_form', { title: 'Connection',user:req.body,erros: erros });
            }
        }).catch(err => Common.error(err,res))
    }
   

    
};

// GET request for disconnection page.
// Permet de se déconnecter en détruisant la session associé
exports.disconnection_get = function(req,res,next){
    if(Common.isConnected(req)){
        req.session.destroy();
    }
    res.redirect('/home')
}