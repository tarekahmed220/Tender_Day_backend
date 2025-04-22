// import jwt from "jsonwebtoken";

// const generateToken = (req, res, userId) => {
//   const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
//     expiresIn: "3d",
//   });

//   res.cookie("token", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "None",
//     maxAge: 3 * 24 * 60 * 60 * 1000,
//     domain:
//       req.hostname === "dashboard.tendersday.com"
//         ? "dashboard.tendersday.com"
//         : "tendersday.com",
//   });

//   return token;
// };

// export default generateToken;
import jwt from "jsonwebtoken";

const generateToken = (req, res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  // تحديد الدومين بناءً على الموقع
  let cookieDomain;
  if (req.hostname === "dashboard.tendersday.com") {
    cookieDomain = "dashboard.tendersday.com";
  } else if (
    req.hostname === "tendersday.com" ||
    req.hostname === "www.tendersday.com"
  ) {
    cookieDomain = ".tendersday.com"; // لتغطية tendersday.com و www.tendersday.com
  } else {
    cookieDomain = req.hostname; // لأي دومين آخر (اختياري)
  }

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // استخدام Lax في التطوير
    maxAge: 3 * 24 * 60 * 60 * 1000,
    domain: cookieDomain,
  });

  return token;
};

export default generateToken;
