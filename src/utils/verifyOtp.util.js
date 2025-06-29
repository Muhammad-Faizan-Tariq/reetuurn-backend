const verifyOtp = (userOtpObj, enteredOtp) => {
  if (
    !userOtpObj ||
    !userOtpObj.code ||
    !userOtpObj.expiry ||
    userOtpObj.code !== enteredOtp ||
    new Date(userOtpObj.expiry) < new Date()
  ) {
    return false;
  }
  return true;
};

export default verifyOtp;
