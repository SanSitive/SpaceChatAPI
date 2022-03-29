
let mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');

const user_function = require('../API/user');
const post_function = require('../API/post');

const tag_function = require('../API/tag');




//GET (Users may find people who they already follow)
// But : Charger une page contenant que des utilisateurs non suivies par l'utilisateur
exports.search_get = function(req,res,next){
    post_function.getAllPosts_PopulatedByAuthor().then((posts)=>{
        posts.sort(function compare(a,b){return b.PostDate - a.PostDate});
        let PostARenvoyer = [];
        for(let i=0; i<posts.length; i++){
            //ne sélectionne que les utilisateurs non bannis
            if(posts[i].PostAuthor.UserStatus != 'Banned'){
                let instance = {
                    PostPicture : posts[i].PostPicture.slice(7),
                    PostDescription : posts[i].PostDescription,
                    PostLike : posts[i].PostLike,
                    PostDate : posts[i].PostDate,
                    PostTags : posts[i].PostTags,
                    PostAuthorId : posts[i].PostAuthor.UserId,
                    PostAuthorStatus: posts[i].PostAuthor.UserStatus,
                    _id: posts[i]._id
                }
                PostARenvoyer.push(instance);
            }
        }
        //mélange la séquence
        shuffle(PostARenvoyer);
        let session;
        if(user_function.isConnected(req)){session = req.session}
        res.render('search',{title:'Search', posts:PostARenvoyer, session:session});
    }).catch(err => {next(err)})
}


//PAS ENCORE IMPLEMENTEE
// GET request for send Search form.
exports.search_post = function(req,res,next){
    // Validate and sanitize fields.
    body('tag',).trim().escape();
    tag_function.getAllTagsMatchingName.then((tags)=>{
        if(tags){
            post_function.getAllPostByTags(tags[0])
        }else{
            res.status(404);
            res.send('There is no posts matching thoses tags')
        }
    })
    res.send('PAS ENCORE IMPLEMENTE : PAGE SEARCH ENVOIE');
};

// GET request for Search page
//Currently not working 
/* 
exports.search_get = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user)=>{
            if(user){
                follow_function.getAllFollowNotEqualSuivant(user._id).then((non_abonnements_res) =>{
                    let non_abonnements = [];
                    for(let i =0; i< non_abonnements_res.length; i++){
                        non_abonnements.push(non_abonnements_res[i].UserIdSuivi);
                    }
                    let posts = [];
                    async.eachSeries(non_abonnements,function(non_abo,callback){
                        post_function.getAllPostByAuthorIdPopulated(non_abo).then((post_res)=>{
                            if(post_res){
                                for(let i=0; i<post_res.length; i++){
                                    posts.push(post_res[i]);
                                }
                                callback(post_res)
                            }
                        })
                    console.log(non_abonnements_res)
                    console.log('entre deux')
                    console.log(posts)
                    },function(err){
                        if(err){
                            console.log('there is an error');
                        }
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
                        if(posts.length > 0){
                            res.render('search',{title:'Search',posts:PostARenvoyer})
                        }else{
                            //Si la personne est abonnée à tous les comptes
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
                                res.render('search',{title:'Search', posts:PostARenvoyer});
                            })
                        }
                    })
                })
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
                    res.render('search',{title:'Search', posts:PostARenvoyer});
                })
            }
        })
    }else{
        //Générique random posts
        post_function.getAllPosts_PopulatedByAuthor().then((posts)=>{
            shuffle(posts);
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
            res.render('search',{title:'Search', posts:PostARenvoyer});
        })
    }
};*/


//FONCTIONS UTILES
function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}