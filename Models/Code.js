const mongoose = require("mongoose");
const codeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
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
});

const Code = mongoose.model("Code", codeSchema);
module.exports = Code;
