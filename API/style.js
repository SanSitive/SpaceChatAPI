const Style = require('../models/style');



exports.getAllStyle = (callback) =>{
    return Style.find({},callback);
}
exports.getStyleByName = (name,callback) => {
    return Style.findOne({'StyleName' : name},callback)
}
exports.create = (name,url) => {
    let instance = {
        StyleName : name,
        StyleUrl : url
    }
    return new Style(instance);
}
exports.save = (style, callback) => {
    return style.save(callback);
}
exports.delete = (id,callback) =>{
    return Style.findByIdAndRemove(id,callback);
}
exports.update = (id,news,callback) =>{
    return Style.findByIdAndUpdate(id,news,callback);
}