const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv').config()
const cors = require('cors')

const authRoutes = require('./routes/auth')

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

/* ROUTES */
app.use('/auth', authRoutes)

/* MONGOOSE SETUP */
const PORT = 3000;
mongoose 
    .connect(process.env.MONGO_URL, {
        dbName: "Dream_Nest"
    }) 
    .then(() => {
        app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
    })
    .catch((err) => console.error(`❌ MongoDB Connection Error: ${err.message}`));
