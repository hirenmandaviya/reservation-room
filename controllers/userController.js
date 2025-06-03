const User = require("../models/User");
const Reservation = require("../models/Reservation");
const sendResponse = require("../utils/response");

exports.getUsersData = async (req, res) => {
  const { page = 1, limit = 5, username, email } = req.query;
  const filter = {};
  if (username) filter.username = new RegExp(username, "i");
  if (email) filter.email = new RegExp(email, "i");

  const users = await User.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .select("-password");

  const count = await User.countDocuments(filter);

  const data = await Promise.all(
    users.map(async (user) => {
      const reservations = await Reservation.find({ user: user._id }).populate(
        "room"
      );
      return { user, reservations };
    })
  );

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users data fetched successfully",
    data: {
      data,
      page: Number(page),
      limit: Number(limit),
      total: count,
    },
  });
};
