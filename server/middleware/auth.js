const jwt = require('jsonwebtoken');

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
    // Lấy token từ header Authorization
    const token = req.headers['authorization']?.split(' ')[1]; // Lấy token từ header

    if (!token) {
        return res.sendStatus(401); // Không có token, trả về Unauthorized
    }

    // Xác thực token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Token không hợp lệ, trả về Forbidden
        }
        req.user = user; // Lưu thông tin người dùng vào request
        next(); // Tiếp tục đến middleware hoặc route tiếp theo
    });
};

module.exports = authenticateToken;
