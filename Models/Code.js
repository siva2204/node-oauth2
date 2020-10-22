const mongoose = require('mongoose');
const codeSchema = new mongoose.Schema({
	code: {
		type: String,
		required: true,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'ResourceOwner',
		required: true,
	},
	clientId: {
		type: String,
		required: true,
	},
	scope: {
		type: String,
	},
	state: {
		type: String,
	},
	redirectUri: {
		type: String,
	},
	nonce: {
		type: String,
	},
	date: {
		type: Number,
		default: Date.now(),
	},
});

const Code = mongoose.model('Code', codeSchema);
module.exports = Code;
