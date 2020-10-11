const mongoose = require("mongoose");

const clientSchema = mongoose.Schema({
  clientId: {
    type: String,
    required: true,
  },
  clientSecret: {
    type: String,
    required: true,
  },
  redirectUri: {
    type: String,
    required: true,
  },
});

const Client = mongoose.model("ResourceOwner", resourceOwnerSchema);
module.export = Client;
