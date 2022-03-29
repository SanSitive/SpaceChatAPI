const Style = require('../models/style');



exports.APIgetAllStyles = (req,res,next) =>{
    Style.find({}).then(styles => {
        if(styles){res.status(200).send(styles)}
        else{res.sendStatus(404)}
    }).catch(err => {console.log(err); res.sendStatus(500)}) //INTERNAL ERROR
}

exports.APIgetStyleByName = (req,res,next) => {
    Style.findOne({'StyleName' : req.params.name}).then(style => {
        if(style){res.status(200).send(style)}
        else{res.sendStatus(404)}
    }).catch(err => {console.log(err); res.sendStatus(500)})
}

exports.APIcreate = (req,res,next) => {
    if(req.body){
        console.log(req.body)
        const instance = new Style(req.body)
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
        Style.findByIdAndUpdate(instance._id, instance).then(result => {
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
    Style.deleteOne({_id: req.body._id}).then((err, result) => {
        res.sendStatus(204);
    }).catch(err => { res.sendStatus(500);}); //INTERNAL ERROR
}
