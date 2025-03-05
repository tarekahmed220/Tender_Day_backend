import userModel from "../../../db/models/user.model.js";
import catchError from "../../middleware/handleError.js";

const getAllClients = catchError(async (req, res, next) => {
  const users = await userModel.find({ isDeleted: false }).select("-password");
  res.status(200).json(users);
});

export { getAllClients };
