const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('../models/Room');
const connectDB = require('../config/db');

dotenv.config();

const seedRooms = async () => {
  await connectDB();

  const rooms = [
    { roomNumber: '101', roomType: 'Single', pricePerNight: 80 },
    { roomNumber: '102', roomType: 'Double', pricePerNight: 120 },
    { roomNumber: '103', roomType: 'Suite', pricePerNight: 200 },
    { roomNumber: '104', roomType: 'Deluxe', pricePerNight: 250 }
  ];

  try {
    await Room.deleteMany(); // clear existing data
    const inserted = await Room.insertMany(rooms);
    console.log('Rooms seeded:', inserted);
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedRooms();
