let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let TagSchema = new Schema(
    {
        TagName : {type: String, required: true}
    }
);

//Export
module.exports = mongoose.model('Tag',TagSchema);