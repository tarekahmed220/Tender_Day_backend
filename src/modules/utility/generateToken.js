import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  const domain =
    process.env.NODE_ENV === "production"
      ? res.req.hostname.includes("dashboard")
        ? "dashboard.tendersday.com"
        : "tendersday.com"
      : undefined;

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 3 * 24 * 60 * 60 * 1000,
    domain,
  });

  return token;
};

export default generateToken;
