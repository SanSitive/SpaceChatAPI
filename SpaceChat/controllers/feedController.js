
let async = require('async');
let Post = require('../models/post');
let mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');


const user_function = require('../API/user')
const post_function = require('../API/post')
const follow_function = require('../API/follow')


//Home page
exports.index = function(req,res,next){
    let session;
    if(req.session){session = req.session}
    res.render('home',{title:'SpaceChat', session:session});
}

//FEED page on GET
exports.feed_get = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user_res)=>{
            if(user_res){
                follow_function.getAllFollowBySuivant(user_res._id).then((abonnements_res)=>{
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
                            let PostARenvoyer =[];
                            for(let i=0; i<posts.length; i++){
                                let instance = {
                                    PostPicture : posts[i].PostPicture.slice(7),
                                    PostDescription : posts[i].PostDescription,
                                    PostLike : posts[i].PostLike,
                                    PostDate : posts[i].date,
                                    PostTags : posts[i].PostTags,
                                    PostAuthorId : posts[i].PostAuthor.UserId,
                                    PostAuthorStatus: posts[i].PostAuthor.UserStatus,
                                    _id: posts[i]._id,
                                    UserPicture: posts[i].PostAuthor.UserPicture.slice(7)
                                }
                                PostARenvoyer.push(instance);
                                PostARenvoyer.sort(function compare(a,b){return b.PostDate - a.PostDate});
                            }
                            if(PostARenvoyer.length > 0){
                                let session;
                                if(user_function.isConnected(req)){session = req.session}
                                res.render('feed',{title:'Feed',posts:PostARenvoyer, session:session})
                            }else{//Renvoie tout les posts des personnes non bannies dans le feed
                                post_function.getAllPosts_PopulatedByAuthor().then((posts)=>{
                                    let PostARenvoyer = [];
                                    for(let i=0; i<posts.length; i++){
                                        if(posts[i].PostAuthor.UserStatus != 'Banned'){
                                            let instance = {
                                                PostPicture : posts[i].PostPicture.slice(7),
                                                PostDescription : posts[i].PostDescription,
                                                PostLike : posts[i].PostLike,
                                                PostDate : posts[i].date,
                                                PostTags : posts[i].PostTags,
                                                PostAuthorId : posts[i].PostAuthor.UserId,
                                                PostAuthorStatus: posts[i].PostAuthor.UserStatus,
                                                _id: posts[i]._id,
                                                UserPicture: posts[i].PostAuthor.UserPicture.slice(7)
                                            }
                                            PostARenvoyer.push(instance);
                                        }
                                    }
                                    PostARenvoyer.sort(function compare(a,b){return a.PostDate - b.PostDate});//Renvoie les plus récent en premier
                                    let session;
                                    if(user_function.isConnected(req)){session = req.session}
                                    res.render('feed',{title:'Feed', posts:PostARenvoyer, session:session});
                                }).catch(err => {next(err)})
                            }
                        }

                    })/* NOT WORKING FOR NOW BUT IS WHAT WE NEED TO DO TO BE OPTIMAL
                    async.each(abonnements,function(abo,callback){
                        post_function.getAllPostByAuthorIdPopulated(abo).then((post_res)=>{
                            if(post_res){
                                for(let i=0; i<post_res.length; i++){
                                    posts.push(post_res[i]);
                                }
                                callback(post_res)
                            }
                        })
                    },function(err){
                        if(err){
                            console.log('there is an error');
                        }
                        console.log(posts)
                        posts.sort(function compare(a,b){return b.PostDate - a.PostDate})
                        let PostARenvoyer = [];
                        for(let i=0; i<posts.length; i++){
                            let instance = {
                                PostPicture : posts[i].PostPicture,
                                PostDescription : posts[i].PostDescription,
                                PostLike : posts[i].PostLike,
                                PostDate : posts[i].PostDate,
                                PostTags : posts[i].PostTags,
                                PostAuthorId : posts[i].PostAuthor.UserId,
                                _id: posts[i]._id
                            }
                            PostARenvoyer.push(instance);
                        }
                        if(PostARenvoyer.length > 0){
                            res.render('feed',{title:'Feed',posts:PostARenvoyer})
                        }else{
                            post_function.getAllPosts_PopulatedByAuthor().then((posts)=>{
                                posts.sort(function compare(a,b){return b.PostDate - a.PostDate});
                                let PostARenvoyer = [];
                                for(let i=0; i<posts.length; i++){
                                    let instance = {
                                        PostPicture : posts[i].PostPicture,
                                        PostDescription : posts[i].PostDescription,
                                        PostLike : posts[i].PostLike,
                                        PostDate : posts[i].PostDate,
                                        PostTags : posts[i].PostTags,
                                        PostAuthorId : posts[i].PostAuthor.UserId,
                                        _id: posts[i]._id
                                    }
                                    PostARenvoyer.push(instance);
                                }
                                console.log(PostARenvoyer);
                                res.render('feed',{title:'Feed', posts:PostARenvoyer});
                            })
                        }
                    });*/
                })
            }else{//Récupère tout les posts des personnes non bannies et les renvoie dans le template feed
                post_function.getAllPosts_PopulatedByAuthor().then((posts)=>{
                    posts.sort(function compare(a,b){return b.PostDate - a.PostDate});
                    let PostARenvoyer = [];
                    for(let i=0; i<posts.length; i++){
                        if(posts[i].PostAuthor.UserStatus != 'Banned'){
                            let instance = {
                                PostPicture : posts[i].PostPicture.slice(7),
                                PostDescription : posts[i].PostDescription,
                                PostLike : posts[i].PostLike,
                                PostDate : posts[i].date,
                                PostTags : posts[i].PostTags,
                                PostAuthorId : posts[i].PostAuthor.UserId,
                                PostAuthorStatus: posts[i].PostAuthor.UserStatus,
                                _id: posts[i]._id,
                                UserPicture: posts[i].PostAuthor.UserPicture.slice(7)
                            }
                            PostARenvoyer.push(instance);
                        }
                    }
                    res.render('feed',{title:'Feed', posts:PostARenvoyer});
                }).cacth(err => {next(err)})
            }
        }).catch(err => {next(err)})
    }else{//Comme ci-dessus si l'on est pas connecté
        post_function.getAllPosts_PopulatedByAuthor().then((posts)=>{
            posts.sort(function compare(a,b){return b.PostDate - a.PostDate});
            let PostARenvoyer = [];
            for(let i=0; i<posts.length; i++){
                if(posts[i].PostAuthor.UserStatus != 'Banned'){
                    let instance = {
                        PostPicture : posts[i].PostPicture.slice(7),
                        PostDescription : posts[i].PostDescription,
                        PostLike : posts[i].PostLike,
                        PostDate : posts[i].date,
                        PostTags : posts[i].PostTags,
                        PostAuthorId : posts[i].PostAuthor.UserId,
                        PostAuthorStatus: posts[i].PostAuthor.UserStatus,
                        _id: posts[i]._id,
                        UserPicture: posts[i].PostAuthor.UserPicture.slice(7)
                    }
                    PostARenvoyer.push(instance);
                }
            }
            res.render('feed',{title:'Feed', posts:PostARenvoyer});
        }).catch(err => {next(err)})
    }

}



//FONCTION UTILES
function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}