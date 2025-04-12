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

export default isSubscriptionValid;
