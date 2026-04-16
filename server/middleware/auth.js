import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  // const token = req.headers.authorization;
  const header = req.headers.authorization;
const token = header.split(" ")[1]; // 🔥 THIS LINE IS MUST
console.log("token:",token);
  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded; // 🔥 now we have userId
    next();
  } catch (err) {
    console.log("error:",err);
    return res.status(401).json({ message: "Invalid token" });
  }
};