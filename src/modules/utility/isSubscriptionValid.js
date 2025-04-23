const isSubscriptionValid = async (user) => {
  if (user.role === "admin") return true;

  if (!user.subscriptionStatus || user.subscriptionStatus !== "active") {
    return false;
  }

  const now = new Date();

  let isAnySubscriptionValid = false;

  for (let subscription of user.subscriptions) {
    if (subscription.expiryDate && new Date(subscription.expiryDate) < now) {
      user.subscriptionStatus = "expired";
    } else {
      isAnySubscriptionValid = true;
    }
  }

  if (isAnySubscriptionValid) {
    return true;
  } else {
    await user.save();
    return false;
  }
};

export const isUserSubscribedToCountry = (user, tender) => {
  if (!user.subscriptionCountries) return false;

  return user.subscriptionCountries.some(
    (countryId) => countryId.toString() === tender.country._id.toString()
  );
};

export default isSubscriptionValid;
