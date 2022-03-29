
const Tag = require('../models/tag');



exports.getAllTags = (callback) =>{
    return Tag.find({},callback);
}
exports.getAllTagsMatchingName = (name,callback) =>{
    return Tag.find({'TagName':{$regex : name}},callback);
}
exports.create = (name) => {
    let instance = {
        TagName : name
    }
    return new Tag(instance);
}
exports.save = (tag, callback) => {
    return tag.save(callback);
}
exports.delete = (id,callback) =>{
    return Tag.findByIdAndRemove(id,callback);
}
exports.update = (id,news,callback) =>{
    return Tag.findByIdAndUpdate(id,news,callback);
}