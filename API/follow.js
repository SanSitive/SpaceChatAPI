
let Follow = require('../models/follow');



exports.getAllFollowBySuivant = (id,callback) =>{
    return Follow.find({'UserIdSuivant':id},callback);
}

exports.getAllFollowNotEqualSuivant = (id,callback) =>{
    return Follow.find({'UserIdSuivant':{$ne: id}},callback);
}

exports.isCurrentUserFollowing = (user_a, user_b,callback) =>{
    return Follow.findOne({'UserIdSuivant':user_a, 'UserIdSuivi':user_b},callback);
}

exports.create = (UserIdSuivant,UserIdSuivi) => {
    let instance = {
        UserIdSuivi: UserIdSuivi,
        UserIdSuivant : UserIdSuivant
    }
    return new Follow(instance);
}
exports.save = (follow, callback) => {
    return follow.save(callback);
}

exports.delete = (id,callback) =>{
    return Follow.findByIdAndRemove(id,callback);
}

exports.update = (id,news,callback) =>{
    return Follow.findByIdAndUpdate(id,news,callback);
}