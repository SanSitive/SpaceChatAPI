
let Comment = require('../models/comment');



exports.getCommentByParentPostId = (id,callback) =>{
    return Comment.find({'CommentPostId':id}).populate('CommentAuthorId').exec(callback);
}

exports.create = (postid,authorid,content) => {
    let instance = {
        CommentPostId : postid,
        CommentAuthorId: authorid,
        CommentContent : content
    }
    return new Comment(instance);
}
exports.save = (comment, callback) => {
    return comment.save(callback);
}

exports.update = (id,news,callback) =>{
    return Comment.findByIdAndUpdate(id,news,callback);
}

exports.delete = (id,callback) =>{
    return Comment.findByIdAndRemove(id,callback);
}
