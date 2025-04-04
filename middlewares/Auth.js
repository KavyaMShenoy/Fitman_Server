const jwt = require("jsonwebtoken");
require("dotenv").config();

const Auth = (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Unauthorized: No token provided.",
                success: false
            });
        }

        const token = authHeader.replace("Bearer ", "").trim();

        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    message: err.name === "TokenExpiredError"
                        ? "Unauthorized: Token has expired."
                        : "Unauthorized: Invalid token.",
                    success: false,
                });
            }

            req.user = {
                id: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };

            next();
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};

module.exports = Auth;