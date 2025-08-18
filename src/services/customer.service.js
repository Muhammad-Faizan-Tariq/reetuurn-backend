import UserProfile from "../models/userProfile.model.js";
// import AuthUser from "../models/authuser.model.js";

export const getCustomerProfile = async (user) => {
  const profile = await UserProfile.findOne({ user: user._id });

  if (!profile) throw new Error("Profile not found");

  return {
    accountDetails: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: user.email,
      phones: profile.phones,
      dob: profile.dob,
    },
    addresses: profile.addresses,
    preferences: {
      gender: profile.gender,
    },
  };
};

export const updatePhoneNumbers = async (user, phones) => {
  const profile = await UserProfile.findOne({ user: user._id });


  if (!phones.some((p) => p.type === "primary")) {
    throw new Error("At least one primary phone required");
  }

  profile.phones = phones;
  await profile.save();
  return profile.phones;
};

export const updateAddresses = async (user, addresses) => {
  const profile = await UserProfile.findOne({ user: user._id });

  if (!addresses.some((a) => a.isPrimary)) {
    throw new Error("At least one primary address required");
  }

  profile.addresses = addresses;
  await profile.save();
  return profile.addresses;
};

export const addNewAddress = async (user, newAddress) => {
  const profile = await UserProfile.findOne({ user: user._id });

  if (profile.addresses.length === 0) {
    newAddress.isPrimary = true;
  }

  profile.addresses.push(newAddress);
  await profile.save();
  return profile.addresses;
};

export const verifyPhoneNumber = async (user, phoneNumber, otp) => {

  const profile = await UserProfile.findOne({ user: user._id });
  const phone = profile.phones.find((p) => p.number === phoneNumber);

  if (!phone) throw new Error("Phone number not found");


  phone.isVerified = true;
  await profile.save();

  return {
    number: phone.number,
    type: phone.type,
    isVerified: true,
  };
};
