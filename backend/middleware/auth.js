
import jwt from "jsonwebtoken";

export default function (req, res, next) {
  // Extract token directly from parsed incoming request cookies container
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Authorization denied. Cookies token signature missing.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token authentication integrity failed." });
  }
}
