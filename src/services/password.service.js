import AuthUser from "../models/authuser.model.js";

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await AuthUser.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  await user.changePassword(currentPassword, newPassword);
  return { success: true };
};
