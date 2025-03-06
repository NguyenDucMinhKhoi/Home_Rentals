const mongoose = require("mongoose")

const ListingSchema = new mongoose.Schema(
    {
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        category: {
            type: String,
            require: true,
        },
        type: {
            type: String,
            require: true,
        },
        streetAddress: {
            type: String,
            require: true,
        },
        aptSuite: {
            type: String,
            require: true,
        },
        city: {
            type: String,
            require: true,
        },
        province: {
            type: String,
            require: true,
        },
        country: {
            type: String,
            require: true,
        },
        guestCount: {
            type: Number,
            require: true,
        },
        bedroomCount: {
            type: Number,
            require: true,
        },
        bedCount: {
            type: Number,
            require: true,
        },
        bathroomCount: {
            type: Number,
            require: true,
        },
        amenities: {
            type: Array,
            default: [],
        },
        listingPhotoPaths: [{ type: String }], // Store photo URLs
        title: {
            type: String,
            require: true,
        },
        description: {
            type: String,
            require: true,
        },
        highlight: {
            type: String,
            require: true,
        },
        highlightDesc: {
            type: String,
            require: true,
        },
        price: {
            type: Number,
            require: true,
        }
    },
    { timestamps: true }
)

const Listing = mongoose.model("Listing", ListingSchema)
module.exports = Listing