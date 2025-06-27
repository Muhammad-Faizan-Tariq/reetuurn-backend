
export const testUser = (req, res) => {
  res.status(200).json({
    message: "User controller is working properly!",
    by: "Shoaib"
  });
};
