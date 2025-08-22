import UserProfile from "../models/userProfile.model.js";


const ensureProfile = async (user) => {
  let profile = await UserProfile.findOne({ user: user._id });
  if (!profile) {
    profile = new UserProfile({
      user: user._id,
      firstName: "N/A",
      lastName: "N/A",
      gender: "other",
      dob: new Date("1970-01-01"),
      phones: [],
      addresses: [],
    });
    await profile.save();
  }
  return profile;
};


export const getCustomerProfile = async (user) => {
  return await ensureProfile(user);
};

export const updatePhoneNumbers = async (user, phones) => {
  let profile = await ensureProfile(user);

  let primaryCount = phones.filter((p) => p.type === "primary").length;
  if (primaryCount === 0) throw new Error("At least one primary phone required");
  if (primaryCount > 1) throw new Error("Only one phone can be primary");

  profile.phones = phones.map((p, i) => ({
    ...p,
    type: i === 0 ? "primary" : p.type || "secondary",
  }));

  profile.user = user; 
  await profile.save();
  return profile.phones;
};

export const addPhoneNumber = async (user, newPhone) => {
  let profile = await ensureProfile(user);

  if (!profile.phones || profile.phones.length === 0) {
    newPhone.type = "primary";
  } else {
    newPhone.type = "secondary";
  }

  profile.phones.push(newPhone);
  profile.user = user;
  await profile.save();
  return profile.phones;
};

export const updateCustomerAddresses = async (user, addresses) => {
  let profile = await ensureProfile(user);

  let primaryCount = addresses.filter((a) => a.isPrimary).length;
  if (primaryCount === 0) throw new Error("At least one primary address required");
  if (primaryCount > 1) throw new Error("Only one address can be primary");

  profile.addresses = addresses.map((a, i) => ({
    ...a,
    isPrimary: i === 0 ? true : a.isPrimary || false,
  }));

  profile.user = user;
  await profile.save();
  return profile.addresses;
};

export const addCustomerAddress = async (user, newAddress) => {
  let profile = await ensureProfile(user);

  if (!profile.addresses || profile.addresses.length === 0) {
    newAddress.isPrimary = true;
  } else {
    newAddress.isPrimary = false;
  }

  profile.addresses.push(newAddress);
  profile.user = user;
  await profile.save();
  return profile.addresses;
};
