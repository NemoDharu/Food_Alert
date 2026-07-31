var mongoose = require('mongoose');
var Schema = mongoose.Schema;

bankinfoSchema = new Schema( {
	
	name: string,
    position: string,
    unique_id: number,
    level: "junior" | "mid" | "senior",
    _id: mongodb.ObjectId
	
}),
Bankinfo = mongoose.model('user_bank_details', bankinfoSchema);

module.exports = Bankinfo;