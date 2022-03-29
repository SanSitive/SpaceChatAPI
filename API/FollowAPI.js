
let Follow = require('../models/follow');



exports.APIgetAllFollowBySuivant = (req,res,next) =>{
    Follow.find({'UserIdSuivant': req.params.id}).then( follows => {
        if(follows){ res.status(200).send(follows)}
        else{
            res.sendStatus(404)
        }
    }).catch(err => { console.log(err); res.sendStatus(500)})
}

exports.APIgetAllFollowNotEqualSuivant = (req,res,next) =>{
    Follow.find({'UserIdSuivant':{$ne: req.params.id}}).then(follows => {
        if(follows){ res.status(200).send(follows)}
        else{
            res.sendStatus(404)
        }
    }).catch(err => { console.log(err); res.sendStatus(500)})
}

exports.APIisCurrentUserFollowing = (req,res,next) =>{
    if(req.body){
        Follow.findOne({'UserIdSuivant':req.body.user_a, 'UserIdSuivi':req.body.user_b}).then(follow => {
            if(follow){res.status(200).send(follow)}
            else{res.sendStatus(404)}
        }).catch(err => {console.log(err); res.sendStatus(500)}) //INTERNAL ERROR

    }else{
        res.sendStatus(400) //BAD REQUEST
    }
}

exports.APIcreate = (req,res,next) => {
    if(req.body){
        console.log(req.body)
        const instance = new Follow(req.body)
        instance.save().then( result => {
            res.sendStatus(201) //CREATE
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
        Follow.findByIdAndUpdate(instance._id, instance).then(result => {
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
    Follow.deleteOne({_id: req.body._id}).then((err, result) => {
        res.sendStatus(204);
    }).catch(err => { res.sendStatus(500);}); //INTERNAL ERROR
}

