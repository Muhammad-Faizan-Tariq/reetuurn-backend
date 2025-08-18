import AuthUser from "../models/authuser.model.js";

export const changePassword = async (user, currentPassword, newPassword) => {
  const user = await AuthUser.findById(user._id);
  if (!user) {
    throw new Error("User not found");
  }

  await user.changePassword(currentPassword, newPassword);
  return { success: true };
};
