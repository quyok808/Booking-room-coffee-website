const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  permissions: {
    type: [
      {
        type: String,
        enum: ["create", "update", "delete", "read"]
      }
    ],
    default: ["read"],
    required: true
  }
});

module.exports = mongoose.model("Role", roleSchema);
