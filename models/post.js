let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let User = require('./user');
const {DateTime} = require('luxon');
const { nextTick } = require('async');

let PostSchema = new Schema(
    {
        PostAuthor : {type: Schema.Types.ObjectId, ref: 'User', required: true},
        PostPicture : {type: String, required: false},
        PostDescription : {type: String, required: true, minLength:1, maxLength: 1500},
        PostLike : {type: Number, default: 0},
        PostDate : {type : Date, default: Date.now},
        PostTags : [{type: Schema.Types.ObjectId, ref:'Tag'}]
    }
);

//Virtual date for post
PostSchema.virtual('date').get(function(){
    return DateTime.fromJSDate(this.PostDate).toLocaleString(DateTime.DATETIME_MED);
})

//Virtual url for post
PostSchema.virtual('url').get(function(){
    return '/home/user/'+this.PostAuthor.UserId+'/post/'+this_id;

});


//Export
module.exports  = mongoose.model('Post', PostSchema);

