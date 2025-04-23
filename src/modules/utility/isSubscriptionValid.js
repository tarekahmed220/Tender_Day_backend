const isSubscriptionValid = (user) => {
  if (user.role === "admin") return true;
  if (!user.subscriptionStatus || user.subscriptionStatus !== "active")
    return false;
  if (
    user.subscriptionExpiryDate &&
    new Date() > new Date(user.subscriptionExpiryDate)
  )
    return false;
  return true;
};

export const isUserSubscribedToCountry = (user, tender) => {
  if (!user.subscriptionCountries) return false;

  return user.subscriptionCountries.some(
    (countryId) => countryId.toString() === tender.country._id.toString()
  );
};

export default isSubscriptionValid;
