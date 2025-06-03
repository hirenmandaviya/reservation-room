const Room = require("../models/Room");
const sendResponse = require("../utils/response");

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Rooms fetched successfully",
      data: rooms,
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Something went wrong",
    });
  }
};
