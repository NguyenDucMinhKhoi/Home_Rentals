const Listing = require("../models/Listing");

// Hàm tạo listing
const createListing = async (req, res) => {
    try {
        const {
            category,
            type,
            streetAddress,
            aptSuite,
            city,
            province,
            country,
            guestCount,
            bedroomCount,
            bedCount,
            bathroomCount,
            amenities,
            title,
            description,
            highlight,
            highlightDesc,
            price,
        } = req.body;

        const listingPhotos = req.files;

        if (!listingPhotos || listingPhotos.length === 0) {
            return res.status(400).send("No listing photos uploaded.");
        }

        const listingPhotoPaths = listingPhotos.map((file) => file.path);

        const newListing = new Listing({
            creator: req.user.id,
            category,
            type,
            streetAddress,
            aptSuite,
            city,
            province,
            country,
            guestCount,
            bedroomCount,
            bedCount,
            bathroomCount,
            amenities,
            listingPhotoPaths,
            title,
            description,
            highlight,
            highlightDesc,
            price,
        });

        await newListing.save();

        res.status(200).json(newListing);
    } catch (err) {
        res.status(409).json({ message: "Fail to create Listing", error: err.message });
        console.log(err);
    }
};

// Hàm lấy danh sách listing theo category
const getListingsByCategory = async (req, res) => {
    const qCategory = req.query.category;

    try {
        let listings;
        if (qCategory) {
            listings = await Listing.find({ category: qCategory }).populate("creator");
        } else {
            listings = await Listing.find().populate("creator");
        }

        res.status(200).json(listings);
    } catch (err) {
        res.status(404).json({ message: "Fail to fetch listings", error: err.message });
        console.log(err);
    }
};

// Hàm tìm kiếm listing
const searchListings = async (req, res) => {
    const { search } = req.params;

    try {
        let listings = [];

        if (search === "all") {
            listings = await Listing.find().populate("creator");
        } else {
            listings = await Listing.find({
                $or: [
                    { category: { $regex: search, $options: "i" } },
                    { title: { $regex: search, $options: "i" } },
                ],
            }).populate("creator");
        }

        res.status(200).json(listings);
    } catch (err) {
        res.status(404).json({ message: "Fail to fetch listings", error: err.message });
        console.log(err);
    }
};

// Hàm lấy chi tiết listing
const getListingDetails = async (req, res) => {
    try {
        const { listingId } = req.params;
        const listing = await Listing.findById(listingId).populate("creator");
        res.status(202).json(listing);
    } catch (err) {
        res.status(404).json({ message: "Listing cannot be found!", error: err.message });
    }
};

// Hàm cập nhật listing
const updateListing = async (req, res) => {
    try {
        const { listingId } = req.params;
        const updatedData = req.body;
        const listingPhotos = req.files;

        if (listingPhotos && listingPhotos.length > 0) {
            updatedData.listingPhotoPaths = listingPhotos.map((file) => file.path);
        }

        const updatedListing = await Listing.findByIdAndUpdate(
            listingId,
            { $set: updatedData },
            { new: true, runValidators: true }
        );

        if (!updatedListing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        res.status(200).json(updatedListing);
    } catch (err) {
        res.status(500).json({ message: "Fail to update listing", error: err.message });
        console.log(err);
    }
};

// Hàm xóa listing
const deleteListing = async (req, res) => {
    try {
        const { listingId } = req.params;
        const deletedListing = await Listing.findByIdAndDelete(listingId);

        if (!deletedListing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        res.status(200).json({ message: "Listing deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Fail to delete listing", error: err.message });
        console.log(err);
    }
};

module.exports = {
    createListing,
    getListingsByCategory,
    searchListings,
    getListingDetails,
    updateListing,
    deleteListing
};
