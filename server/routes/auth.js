const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const multer = require("multer")
const authenticateToken = require('../middleware/auth')
const { registerUser, loginUser } = require('../controllers/authController'); // Import các hàm từ controller

const User = require("../models/User")

// Configuration Multer for File Upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/") // Store uploaded files in the 'uploads' folder
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) // Use the original file name
    }
})

const upload = multer({ storage })

/* USER REGISTER */
router.post("/register", upload.single('profileImage'), registerUser); // Sử dụng hàm từ controller

/* USER LOGIN */
router.post("/login", loginUser); // Sử dụng hàm từ controller

// Mã hóa mật khẩu
const hashPassword = async (password) => {
    const saltRounds = 10; // Số vòng salt
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
};

const propertiesRouter = express.Router()

propertiesRouter.post('/api/properties/create', authenticateToken, (req, res) => {
    // Logic tạo mới listing
    res.json({ message: 'Listing created successfully' });
})

module.exports = router;