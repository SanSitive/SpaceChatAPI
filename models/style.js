let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let StyleSchema = new Schema(
    {
        StyleName : {type: String, required: true},
        StyleUrl : {type: String, required: true}
    }
);

//Export
module.exports = mongoose.model('Style',StyleSchema);