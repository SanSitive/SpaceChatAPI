let User = require ('../models/user');


exports.getUserById = (id,callback) =>{
    return User.findById(id,callback);
}
exports.getUserByIdentify = (user_id, callback) =>{
    return User.findOne({'UserId': user_id},callback);
}

exports.connection = (user_id,callback) =>{
    return User.findOne({'UserId' : user_id}).populate('UserMode').exec(callback);
}

exports.create = (id,pseudo,password,email) => {
    let instance = {
        UserId : id,
        UserPseudo : pseudo,
        UserPassword : password,
        UserEmail : email
    }
    return new User(instance);
}

exports.save = (user, callback) => {
    return user.save(callback);
}

exports.updateById = (id, news, callback) => {
    return User.findByIdAndUpdate(id,news,callback);
}

exports.delete = (id,callback) =>{
    return User.findByIdAndRemove(id,callback);
}

exports.isConnected = (req) =>{
    if(req.session){
        if(req.session.user_id){
            return true;
        }
    }
    return false;
}

exports.getAllUserBanned = (callback) =>{
    return User.find({'UserStatus': 'Banned'}, '_id UserId UserPseudo UserEmail UserStatus UserPicture UserBiography',callback);
}
