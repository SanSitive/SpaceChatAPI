
let Post = require('../models/post');




exports.getPostByAuthorId = (id,callback) => {
    return Post.find({'PostAuthor': id}, callback);
}
exports.getPostById = (id,callback) => {
    return Post.findById(id,callback);
}
exports.getAllPostsByPostAuthorId = (id,callback) => {
    return Post.find({'PostAuthor':id},callback);
}
exports.getAllPostByAuthorIdPopulated = (id,callback) => {
    return Post.find({'PostAuthor':id}).populate('PostAuthor').exec(callback);
}
exports.getAllPostByTags= (name,callback) => {
    return Post.find({'PostTags':name},callback);
}

exports.create = (PostDescription,PostAuthor,PostTags,PostPicture) => {
    let instance = {
        PostDescription: PostDescription,
        PostAuthor: PostAuthor,
        PostTags: PostTags,
        PostPicture: PostPicture
    }
    return new Post(instance);
}
exports.save = (post, callback) => {
    return post.save(callback);
}
exports.update = (id,news , callback) => {
    return Post.findByIdAndUpdate(id,news,callback);
}

exports.delete = (id,callback) => {
    return Post.findByIdAndRemove(id,callback);
}
exports.getAllPosts_PopulatedByAuthor = (callback) =>{
    return Post.find({}).populate('PostAuthor').exec(callback);
}

exports.getPostById_PopulatedByAuthor = (id,callback) =>{
    return Post.findOne({'_id':id}).populate('PostAuthor').exec(callback);
    //return Post.find({'_id':id},callback);
}
