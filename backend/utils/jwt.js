import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key"; // Make sure this matches your app

export const generateJWT = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
};

export const verifyJWT = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
