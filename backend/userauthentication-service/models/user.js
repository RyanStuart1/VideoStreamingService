const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
});

// Check if the model is already registered
const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = UserModel;
