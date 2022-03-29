let Comment = require('../models/comment');


exports.APIgetCommentByParentPostId = (req,res,next) =>{
    
    Comment.find({'CommentPostId':req.params.parent_id}).populate('CommentAuthorId').then( comments =>{
        if(comments){
            res.status(200).send(comments)
        }else{
            res.status(404)
        }
    }).catch(err => { console.log(err);
         res.status(500).send(err)}) //INTERNAL ERROR
}

exports.APIgetCommentById = (req,res,next) =>{
    
    Comment.findById(req.params.id).populate('CommentAuthorId').then( comment =>{
        if(comment){res.status(200).send(comment)}
        else{res.status(404).send(comment)}
    }).catch(err => { res.status(500)}) //INTERNAL ERROR
}

exports.APIcreate = (req,res,next) => {
    if(req.body){
        const instance = new Comment(req.body)
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
        Comment.findByIdAndUpdate(instance._id, instance).then(result => {
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
    Comment.deleteOne({_id: req.body._id}).then((err, result) => {
        res.sendStatus(204);
    }).catch(err => { res.sendStatus(500);}); //INTERNAL ERROR
}