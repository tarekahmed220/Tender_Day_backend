// import jwt from "jsonwebtoken";

// const generateToken = (res, userId) => {
//   const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
//     expiresIn: "3d",
//   });

//   res.cookie("token", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
//     maxAge: 3 * 24 * 60 * 60 * 1000,
//   });

//   return token;
// };

// export default generateToken;

import jwt from "jsonwebtoken";

const generateToken = (req, res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  console.log("req", req.hostname);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: 3 * 24 * 60 * 60 * 1000,
    domain:
      req.hostname === "dashboard.tendersday.com"
        ? "dashboard.tendersday.com"
        : "tendersday.com",
  });

  return token;
};

export default generateToken;
