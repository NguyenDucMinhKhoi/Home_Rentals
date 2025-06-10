const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware xác thực token
const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({ message: "No authentication token, access denied" });
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(verified.id).select("-password");
        
        if (!user) {
            return res.status(401).json({ message: "Token verification failed, authorization denied" });
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token verification failed, authorization denied" });
    }
};

// Middleware kiểm tra quyền admin
const adminAuth = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin privileges required." });
        }
        next();
    } catch (err) {
        res.status(500).json({ message: "Error checking admin privileges", error: err.message });
    }
};

module.exports = { auth, adminAuth }; 