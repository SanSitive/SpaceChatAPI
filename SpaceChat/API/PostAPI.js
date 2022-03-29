
let Post = require('../models/post');




exports.APIgetPostsByAuthorId = (req,res,next) => {
    
    Post.find({'PostAuthor': req.params.id}).then(posts =>{
        if(posts){
            res.status(200).send(posts); //SUCCES
        }else{
            res.status(404) //NOT FOUND
        }
    }).catch(err =>{
        console.log(err);
        res.status(500).send(err); // INTERNAL ERROR
    })

}

exports.APIgetPostById = (req,res,next) => {
    
    Post.findById(req.params.id).then(post => {
        if(post){res.status(200).send(post)} //SUCCESS
        else{res.status(404)} //NOT FOUND
    }).catch(err => { res.status(500)})//Internal ERROR
    
}

exports.APIgetAllPostByAuthorIdPopulated = (req,res,next) => { 
    Post.find({'PostAuthor':req.params.id}).populate('PostAuthor').then(posts =>{
        if(posts){res.status(200).send(posts)}
        else{res.sendStatus(404)}
    }).catch(err => { console.log(err); res.sendStatus(500)}) //INTERNAL ERROR
    
}

exports.APIcreate = (req,res,next) => {
    if(req.body){
        const instance = new Post(req.body)
        instance.save().then( result => {
            res.sendStatus(201); //CREATE
        }).catch(err => {
            console.log(err)
            res.sendStatus(409) //CONFLICT
        })
    }else{
        res.sendStatus(400) //BAD REQUEST
    }
}
exports.APIsave = (req,res,next) => {
    if(req.body){
        const instance = req.body;
        Post.findByIdAndUpdate(instance._id, instance).then(result => {
            if(result) res.sendStatus(204); //NO CONTENT
            else res.sendStatus(404) //NOT FOUND
        }).catch(err => {
            console.log(err)
            res.sendStatus(409)
        })
    }else{
        res.sendStatus(400) //BAD REQUEST
    }
}

exports.APIdelete = (req,res,next) =>{
    Post.deleteOne({_id: req.body._id}).then((err, result) => {
        res.sendStatus(204);
    }).catch(err => { res.sendStatus(500);}); //INTERNAL ERROR
}

exports.APIgetAllPosts_PopulatedByAuthor = (req,res,next) =>{
    Post.find({}).populate('PostAuthor').then(posts => {
        if(posts){res.status(200).send(posts)} //SUCCESS
        else{res.sendStatus(404)}; //NOT FOUND
    }).catch(err => {console.log(err); res.sendStatus(500)}) //INTERNAL ERROR
}

exports.APIgetPostById_PopulatedByAuthor = (req,res,next) =>{
    Post.findOne({'_id':req.params.id}).populate('PostAuthor').then(post =>{
        if(post){res.status(200).send(post)} // SUCCESS
        else{res.sendStatus(404)} //NOT FOUND
    }).catch(err => { console.log(err); res.sendStatus(500)}) //INTERNAL ERROR
}

/*
exports.APIgetAllPostsByPostAuthorId = (req,res,next) => {
    if(req.body){   
        Post.find({'PostAuthor':req.body.id}).then(posts =>{
            if(posts){res.status(200).send(posts)}
            else{res.sendStatus(404)}
        }).catch(err => { console.log(err); res.sendStatus(500)}) //INTERNAL ERROR
    }else{ res.sendStatus(400)} //BAD REQUEST
}*/
/*
exports.APIgetAllPostByTags= (req,res,next) => {
    Post.find({'PostTags':req.params.name}).then();
}*/