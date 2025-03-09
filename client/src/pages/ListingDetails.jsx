import { useEffect, useState } from "react";
import "../styles/ListingDetails.scss";
import { useParams } from "react-router-dom";
import { facilities } from "../data";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const ListingDetails = () => {
  const [loading, setLoading] = useState(true);
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: 'selection'
    }
  ]);

  const getListingDetails = async () => {
    console.log("Fetching listing details for ID:", listingId);
    try {
      const response = await fetch(
        `http://localhost:3001/properties/${listingId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Fetched data:", data);
      setListing(data);
      setLoading(false);
    } catch (err) {
      console.log("Fetch Listing Details Failed", err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getListingDetails();
  }, []);

  /* SUBMIT BOOKING */
  const customerId = useSelector((state) => state?.user?._id);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const { startDate, endDate } = range[0];
    if (!startDate || !endDate) return;

    const dayCount = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1; // Calculate the number of days
    try {
      const bookingForm = {
        customerId,
        listingId,
        hostId: listing.creator._id,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalPrice: listing.price * dayCount,
      };

      const response = await fetch("http://localhost:3001/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingForm),
      });

      if (response.ok) {
        navigate(`/${customerId}/trips`);
      }
    } catch (err) {
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
          {listing.listingPhotoPaths?.map((item) => (
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
            src={`http://localhost:3001/${listing.creator?.profileImagePaths?.replace(
              "public",
              ""
            )}`}
            alt="Profile"
          />
          <h3>
            Hosted by {listing.creator?.firstName} {listing.creator?.lastName}
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
              <DateRange
                editableDateInputs={true}
                onChange={item => setRange([item.selection])}
                moveRangeOnFirstSelection={false}
                ranges={range}
              />
              <h2>Total price: ${listing.price * ((range[0].endDate - range[0].startDate) / (1000 * 60 * 60 * 24) + 1)}</h2>

              <button className="button" type="submit" onClick={handleSubmit}>
                BOOKING
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ListingDetails;
