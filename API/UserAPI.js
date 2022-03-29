let User = require ('../models/user');


exports.APIgetById = (req, res ,next ) =>{

     User.findById(req.params.id).then(user =>{
         if(user){ res.status(200).send(user)}
         else{ res.status(404).send(user);}
     }).catch(err => {res.sendStatus(500)});//INTERNAL ERROR
}

exports.APIgetByIdentify = (req,res,next) =>{

    User.findOne({'UserId': req.params.id}).then( user =>{
        if(user){ res.status(200).send(user)}
         else{ res.status(404).send(user);}
    }).catch(err => {res.sendStatus(500)});//INTERNAL ERROR
}

exports.APIconnection = (req,res,next) =>{

    User.findOne({'UserId' : req.params.id}).populate('UserMode').then(user =>{
        if(user){ res.status(200).send(user)}
        else{ res.status(404).send(user);}
    }).catch(err => {res.sendStatus(500)});//INTERNAL ERROR
}

exports.APIcreate = (req,res,next) => {
    if(req.body){
        console.log(req.body)
        const instance = new User(req.body)
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
        User.findByIdAndUpdate(instance._id, instance).then(result => {
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
    User.deleteOne({_id: req.body._id}).then((err, result) => {
        res.sendStatus(204);
    }).catch(err => { res.sendStatus(500);}); //INTERNAL ERROR
}


exports.APIgetAllUserBanned = (req,res,next) =>{
    User.find({'UserStatus': 'Banned'}, '_id UserId UserPseudo UserEmail UserStatus UserPicture UserBiography').then(users =>{
        res.status(200).send(users);
    }).catch(err => { res.sendStatus(500)}) //INTERNAL ERROR

}