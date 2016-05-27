var mongoose = require('mongoose'),
    Schema = mongoose.Schema
    
var Score = new Schema({
		scores:Number,
		playerID:[String]
});    
    
module.exports = mongoose.model('scores', Score);