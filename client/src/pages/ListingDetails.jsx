import { useEffect, useState } from "react";
import "../styles/ListingDetails.scss";
import { useNavigate, useParams } from "react-router-dom";
import { facilities } from "../data";
import { Close } from "@mui/icons-material";

import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import Footer from "../components/Footer"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ListingDetails = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit"); // credit, paypal, or bank

  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const customerId = useSelector((state) => state?.user?._id);
  const navigate = useNavigate();

  const getListingDetails = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/properties/${listingId}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();
      console.log(data);
      setListing(data);
      setLoading(false);
    } catch (err) {
      console.log("Fetch Listing Details Failed", err.message);
    }
  };

  useEffect(() => {
    getListingDetails();
  }, []);

  console.log(listing)

  /* BOOKING CALENDAR */
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const handleSelect = (dates) => {
    const [start, end] = dates;
    
    if (start && end && start > end) {
      setError("End date must be after start date");
      return;
    }

    setDateRange([
      {
        startDate: start,
        endDate: end,
        key: "selection",
      },
    ]);
    setError(null);
  };

  // Calculate start and end dates
  const start = new Date(dateRange[0].startDate);
  const end = new Date(dateRange[0].endDate);

  // Calculate the difference in days
  const dayCount = Math.round((end - start) / (1000 * 60 * 60 * 24)); // Ensure this is a positive number

  const handleBookingClick = () => {
    if (!customerId) {
      setError("Please login to book this property");
      return;
    }

    if (!dateRange[0].startDate || !dateRange[0].endDate) {
      setError("Please select both start and end dates");
      return;
    }

    const start = new Date(dateRange[0].startDate);
    const end = new Date(dateRange[0].endDate);
    
    if (start > end) {
      setError("End date must be after start date");
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    try {
      const bookingForm = {
        customerId,
        listingId,
        hostId: listing.creator._id,
        startDate: dateRange[0].startDate.toDateString(),
        endDate: dateRange[0].endDate.toDateString(),
        totalPrice: listing.price * dayCount,
        paymentMethod
      }

      const response = await fetch("http://localhost:3001/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingForm)
      })

      const data = await response.json();

      if (response.ok) {
        setShowPaymentModal(false);
        setBookingSuccess(true);
        setTimeout(() => {
          navigate(`/${customerId}/trips`);
        }, 2000);
      } else {
        setError(data.message || "Failed to create booking");
      }
    } catch (err) {
      setError("Failed to create booking. Please try again.");
      console.log("Submit Booking Failed.", err.message);
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      
      <div className="listing-details">
        <div className="title">
          <h1>{listing.title}</h1>
          <div></div>
        </div>

        <div className="photos">
          {listing?.listingPhotoPaths?.map((item) => (
            <img
              key={item}
              src={`http://localhost:3001/${item.replace("public", "")}`}
              alt="listing photo"
            />
          ))}
        </div>

        <h2>
          {listing.type} in {listing.city}, {listing.province},{" "}
          {listing.country}
        </h2>
        <p>
          {listing.guestCount} guests - {listing.bedroomCount} bedroom(s) -{" "}
          {listing.bedCount} bed(s) - {listing.bathroomCount} bathroom(s)
        </p>
        <hr />

        <div className="profile">
          <img
            src={listing?.creator?.profileImagePath ? `http://localhost:3001/${listing.creator.profileImagePath.replace("public", "")}` : "http://localhost:3001/uploads/zai.png"}
            alt="profile"
          />
          <h3>
            Hosted by {listing?.creator?.firstName} {listing?.creator?.lastName}
          </h3>
        </div>
        <hr />

        <h3>Description</h3>
        <p>{listing.description}</p>
        <hr />

        <h3>{listing.highlight}</h3>
        <p>{listing.highlightDesc}</p>
        <hr />

        <div className="booking">
          <div>
            <h2>What this place offers?</h2>
            <div className="amenities">
              {listing.amenities[0].split(",").map((item, index) => (
                <div className="facility" key={index}>
                  <div className="facility_icon">
                    {
                      facilities.find((facility) => facility.name === item)
                        ?.icon
                    }
                  </div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2>How long do you want to stay?</h2>
            <div className="date-range-calendar">
              <DatePicker
                selected={dateRange[0].startDate}
                onChange={handleSelect}
                startDate={dateRange[0].startDate}
                endDate={dateRange[0].endDate}
                selectsRange
                inline
                minDate={new Date()}
              />
              <div className="price-info">
                {dayCount > 1 ? (
                  <h2>
                    ${listing.price} x {dayCount} nights
                  </h2>
                ) : (
                  <h2>
                    ${listing.price} x {dayCount} night
                  </h2>
                )}
                <h2>Total price: ${listing.price * dayCount}</h2>
              </div>
              <div className="date-info">
                <p>Start Date: {dateRange[0].startDate ? dateRange[0].startDate.toDateString() : "Not selected"}</p>
                <p>End Date: {dateRange[0].endDate ? dateRange[0].endDate.toDateString() : "Not selected"}</p>
              </div>
              {error && <p className="error-message">{error}</p>}
              {bookingSuccess && <p className="success-message">Booking successful! Redirecting...</p>}
              <button 
                className="button" 
                type="submit" 
                onClick={handleBookingClick}
                disabled={!customerId || !dateRange[0].startDate || !dateRange[0].endDate}
              >
                {!customerId ? "LOGIN TO BOOK" : "BOOKING"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="payment-modal">
          <div className="payment-modal-content">
            <div className="payment-modal-header">
              <h2>Payment Details</h2>
              <button 
                className="close-button"
                onClick={() => setShowPaymentModal(false)}
              >
                <Close />
              </button>
            </div>
            
            <div className="payment-summary">
              <h3>Booking Summary</h3>
              <p>Property: {listing.title}</p>
              <p>Check-in: {dateRange[0].startDate.toDateString()}</p>
              <p>Check-out: {dateRange[0].endDate.toDateString()}</p>
              <p>Total: ${listing.price * dayCount}</p>
            </div>

            <div className="payment-methods">
              <h3>Select Payment Method</h3>
              <div className="payment-options">
                <label>
                  <input
                    type="radio"
                    value="credit"
                    checked={paymentMethod === "credit"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Credit Card
                </label>
                <label>
                  <input
                    type="radio"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  PayPal
                </label>
                <label>
                  <input
                    type="radio"
                    value="bank"
                    checked={paymentMethod === "bank"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Bank Transfer
                </label>
              </div>
            </div>

            <button 
              className="payment-button"
              onClick={handlePaymentSubmit}
            >
              Confirm Payment
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default ListingDetails;