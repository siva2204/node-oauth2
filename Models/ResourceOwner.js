const mongoose = require("mongoose");

const resourceOwnerSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const ResourceOwner = mongoose.model("ResourceOwner", resourceOwnerSchema);
module.exports = ResourceOwner;
