const Reservation = require("../models/Reservation");
const Room = require("../models/Room");
const sendResponse = require("../utils/response");

const ROOM_GUEST_CAPACITY = {
  Single: 1,
  Double: 2,
  Suite: 4,
  Deluxe: 3,
};

exports.createReservation = async (req, res) => {
  const { roomId, checkInDate, checkOutDate, numberOfGuests } = req.body;

  if (!roomId || !checkInDate || !checkOutDate || !numberOfGuests) {
    const missingFields = !roomId
      ? "roomId"
      : !checkInDate
      ? "checkInDate"
      : !checkOutDate
      ? "checkOutDate"
      : !numberOfGuests
      ? "numberOfGuests"
      : null;
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: `Missing required field: ${missingFields}`,
    });
  }

  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Room not found",
      });
    }

    // Guest limit validation
    const maxGuests = ROOM_GUEST_CAPACITY[room.roomType];
    if (numberOfGuests > maxGuests) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: `A ${room.roomType} room allows maximum ${maxGuests} guest(s)`,
      });
    }

    // Check for overlapping reservations for the same room
    const conflict = await Reservation.findOne({
      room: roomId,
      status: "active", // only consider active reservations
      $or: [
        {
          checkInDate: { $lt: new Date(checkOutDate) },
          checkOutDate: { $gt: new Date(checkInDate) },
        },
      ],
    });

    if (conflict) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Room is already booked for the selected dates",
      });
    }

    const days =
      (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24);
    const totalPrice = days * room.pricePerNight;

    const reservation = await Reservation.create({
      user: req.user._id,
      room: roomId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalPrice,
    });

    return sendResponse(res, {
      statusCode: 201,
      message: "Reservation created successfully",
      data: reservation,
    });
  } catch (err) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to create reservation",
      data: err.message,
    });
  }
};

exports.getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({
      user: req.user._id,
    }).populate("room");
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Reservations fetched successfully",
      data: reservations,
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Something went wrong",
    });
  }
};

exports.cancelReservation = async (req, res) => {
  const { id } = req.params;
  try {
    const reservation = await Reservation.findById(id);

    console.log(reservation, req.user._id.toString());

    if (
      !reservation ||
      reservation.user.toString() !== req.user._id.toString()
    ) {
      return sendResponse(res, {
        success: false,
        message: "Reservation not found",
      });
    }

    console.log(reservation.status);

    if (reservation.status === "cancelled")
      return sendResponse(res, {
        success: false,
        message: "Reservation already cancelled",
      });

    const now = new Date();
    const diff = (new Date(reservation.checkInDate) - now) / (1000 * 60 * 60);
    if (diff < 2)
      return sendResponse(res, {
        success: false,
        message: "Cannot cancel reservation within 2 hours of check-in",
      });

    reservation.status = "cancelled";
    await reservation.save();

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Reservation cancelled successfully",
      data: reservation,
    });
  } catch (error) {
    return sendResponse(res, {
      success: false,
      message: "Reservation not found",
    });
  }
};
