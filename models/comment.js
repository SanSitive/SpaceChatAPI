let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const {DateTime} = require('luxon');

let CommentSchema = new Schema(
    {
        CommentPostId : {type: Schema.Types.ObjectId ,ref: 'Post', required: true},
        CommentAuthorId:{type: Schema.Types.ObjectId, ref:'User', required:true},
        CommentContent : {type: String, required: true, minLength:1, maxLength:500},
        CommentLike : {type: Number, default: 0},
        CommentParent : {type: Schema.Types.ObjectId},
        CommentDate : {type: Date, default: Date.now}
    }
);

//Virtual date for comment
CommentSchema.virtual('date').get(function(){
    return DateTime.fromJSDate(this.CommentDate).toLocaleString(DateTime.DATETIME_MED);
})


//Export
module.exports = mongoose.model('Comment',CommentSchema);