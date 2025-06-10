const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Hàm đăng ký
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Kiểm tra email đã tồn tại
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Kiểm tra nếu là email admin
        const isAdminEmail = email === "admin@dreamnest.com"; // Email admin mặc định

        // Tạo user mới
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: isAdminEmail ? "admin" : "user" // Gán role dựa vào email
        });

        // Lưu user
        const savedUser = await newUser.save();

        // Tạo token
        const token = jwt.sign(
            { id: savedUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(201).json({
            user: {
                _id: savedUser._id,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                email: savedUser.email,
                role: savedUser.role
            },
            token
        });
    } catch (err) {
        res.status(500).json({ message: "Error creating user", error: err.message });
    }
};

// Hàm đăng nhập
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra user tồn tại
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Kiểm tra mật khẩu
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Tạo token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (err) {
        res.status(500).json({ message: "Error logging in", error: err.message });
    }
};

module.exports = { register, login };
