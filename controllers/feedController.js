
let async = require('async');
let Post = require('../models/post');
let mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');
const fetch = require('node-fetch');
const Common = require('../Common');
const config = require('../config');



//Home page
exports.index = function(req,res,next){
    let session;
    if(req.session){session = req.session}
    res.render('home',{title:'SpaceChat', session:session});
}

//FEED page on GET
exports.feed_get = function(req,res,next){
    if(Common.isConnected(req)){
        fetch(config.API_URI + '/user/by_id/'+req.session.user_id,{
            method:'GET',
            headers:{"Content-Type" : "application/json"},
            mode:'cors'
        }).then(response => response.json()).then( user_res => {
            if(user_res){
                fetch(config.API_URI + '/follows/id_suivant/'+user_res._id,{
                    method:'GET',
                    headers:{"Content-Type" : "application/json"},
                    mode:'cors'
                }).then(response => response.json()).then( abonnements_res =>{
                    let abonnements = [];
                    for(let i =0; i< abonnements_res.length; i++){
                        abonnements.push(abonnements_res[i].UserIdSuivi);
                    }
                    shuffle(abonnements);
                    async.parallel([
                        function(callback){
                            Post.find({'PostAuthor':abonnements[0]}).populate('PostAuthor').exec((err,posts)=>{
                                if(err){callback(err)}
                                if(posts){callback(null,posts)}

                            })
                        },
                        function(callback){
                            Post.find({'PostAuthor':abonnements[1]}).populate('PostAuthor').exec((err,posts)=>{
                                if(err){callback(err)}
                                if(posts){callback(null,posts)}

                            })
                        },
                        function(callback){
                            Post.find({'PostAuthor':abonnements[2]}).populate('PostAuthor').exec((err,posts)=>{
                                if(err){callback(err)}
                                if(posts){callback(null,posts)}

                            })
                        },
                    ],
                    function(err,resultat){
                        if(err){next(err)}
                        if(resultat){
                            let posts = [];
                            for(let i =0; i<resultat.length; i++){
                                for(let j=0; j<resultat[i].length;j++){
                                    posts.push(resultat[i][j]);
                                }
                            }//Sélectionne les infos à renvoyer dans le feed
                            let PostARenvoyer = setUpRes(posts)
                            PostARenvoyer.sort(function compare(a,b){return b.PostDate - a.PostDate});
                            let session;
                            if(Common.isConnected(req)){session = req.session}
                            if(PostARenvoyer.length > 0){
                                res.render('feed',{title:'Feed',posts:PostARenvoyer, session:session})
                            }else{//Renvoie tout les posts des personnes non bannies dans le feed
                                fetch(config.API_URI+'/posts/populated/',{
                                    method:'GET',
                                    headers:{"Content-Type" : "application/json"},
                                    mode:'cors'
                                }).then(response => response.json()).then(posts => {
                                    console.log('p1')
                                    posts.sort(function compare(a,b){return b.PostDate - a.PostDate});
                                    let PostARenvoyer = setUpRes(posts)
                                    res.render('feed',{title:'Feed', session: session,posts:PostARenvoyer});
                        
                                }).catch(err => Common.error(err,res))
                            }
                        }

                    })
                })
            }else{//Récupère tout les posts des personnes non bannies et les renvoie dans le template feed
                fetch(config.API_URI+'/posts/populated/',{
                    method:'GET',
                    headers:{"Content-Type" : "application/json"},
                    mode:'cors'
                }).then(response => response.json()).then(posts => {
                    console.log('p2')
                    posts.sort(function compare(a,b){return b.PostDate - a.PostDate});
                    let PostARenvoyer = setUpRes(posts)
                    res.render('feed',{title:'Feed', posts:PostARenvoyer});
        
                }).catch(err => Common.error(err,res))
            }
        })
    }else{//Comme ci-dessus si l'on est pas connecté
        fetch(config.API_URI+'/posts/populated/',{
            method:'GET',
            headers:{"Content-Type" : "application/json"},
            mode:'cors'
        }).then(response => response.json()).then(posts => {
            posts.sort(function compare(a,b){return b.PostDate - a.PostDate});
            let PostARenvoyer = setUpRes(posts)
            res.render('feed',{title:'Feed', posts:PostARenvoyer});

        }).catch(err => Common.error(err,res))
    }

}



//FONCTION UTILES
function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

function setUpRes(posts){
    let PostARenvoyer = [];
    for(let i=0; i<posts.length; i++){
        if(posts[i].PostAuthor.UserStatus != 'Banned'){
            let instance = {
                PostDescription : posts[i].PostDescription,
                PostLike : posts[i].PostLike,
                PostDate : posts[i].date,
                PostTags : posts[i].PostTags,
                PostAuthorId : posts[i].PostAuthor.UserId,
                PostAuthorStatus: posts[i].PostAuthor.UserStatus,
                _id: posts[i]._id,
                UserPicture: posts[i].PostAuthor.UserPicture.slice(7)
            }
            if(posts[i].PostPicture){
                instance.PostPicture= posts[i].PostPicture.slice(7)
            }
            PostARenvoyer.push(instance);
        }
    }
    return PostARenvoyer;
}