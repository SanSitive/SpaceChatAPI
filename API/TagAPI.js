
const Tag = require('../models/tag');



exports.APIgetAllTags = (req,res,next) =>{

    Tag.find({}).then( tags => {
        if(tags) res.status(200).send(tags)
        else { res.status(404).send(tags)}
    }).catch(err => { res.sendStatus(500)}) //INTERNAL ERROR
}

exports.APIgetAllTagsMatchingName = (req,res,next) =>{

    Tag.find({'TagName':{$regex : req.params.name}}).then( tags => {
        if(tags){res.status(200).send(tags)}
        else{res.status(404)}
    }).catch(err => {res.sendStatus(500)}) //INTERNAL ERROR
}
exports.APIcreate = (req,res,next) => {
    if(req.body){
        const instance = new Tag(req.body)
        instance.save().then( result => {
            res.status(201).send(result); //CREATE
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
        Tag.findByIdAndUpdate(instance._id, instance).then(result => {
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
    Tag.deleteOne({_id: req.body._id}).then((err, result) => {
        res.sendStatus(204);
    }).catch(err => { res.sendStatus(500);}); //INTERNAL ERROR
}
