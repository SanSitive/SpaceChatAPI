let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let FollowSchema = new Schema(
    {
        UserIdSuivi : {type: Schema.Types.ObjectId, ref:'User' ,required: true},
        UserIdSuivant : {type: Schema.Types.ObjectId, ref:'User' ,required: true}
    }
);



//Export
module.exports = mongoose.model('Follow',FollowSchema);