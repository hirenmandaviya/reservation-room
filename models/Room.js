const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: String,
  roomType: String,
  pricePerNight: Number
});

module.exports = mongoose.model('Room', roomSchema);
