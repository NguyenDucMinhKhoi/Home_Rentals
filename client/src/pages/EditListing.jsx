import "../styles/CreateListing.scss";
import Navbar from "../components/Navbar";
import { categories, types, facilities } from "../data";

import { RemoveCircleOutline, AddCircleOutline } from "@mui/icons-material";
import variables from "../styles/variables.scss";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { IoIosImages } from "react-icons/io";
import { useState, useEffect } from "react";
import { BiTrash } from "react-icons/bi";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import "../styles/EditListing.scss";

const EditListing = () => {
  const { listingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(null);
  
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  /* LOCATION */
  const [formLocation, setFormLocation] = useState({
    streetAddress: "",
    aptSuite: "",
    city: "",
    province: "",
    country: "",
  });

  const handleChangeLocation = (e) => {
    const { name, value } = e.target;
    setFormLocation({
      ...formLocation,
      [name]: value,
    });
  };

  /* BASIC COUNTS */
  const [guestCount, setGuestCount] = useState(1);
  const [bedroomCount, setBedroomCount] = useState(1);
  const [bedCount, setBedCount] = useState(1);
  const [bathroomCount, setBathroomCount] = useState(1);

  /* AMENITIES */
  const [amenities, setAmenities] = useState([]);

  const handleSelectAmenities = (facility) => {
    if (amenities.includes(facility)) {
      setAmenities((prevAmenities) =>
        prevAmenities.filter((option) => option !== facility)
      );
    } else {
      setAmenities((prev) => [...prev, facility]);
    }
  };

  /* UPLOAD, DRAG & DROP, REMOVE PHOTOS */
  const [photos, setPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);

  const handleUploadPhotos = (e) => {
    const newPhotos = e.target.files;
    setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);
  };

  const handleDragPhoto = (result) => {
    if (!result.destination) return;

    const items = Array.from(photos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPhotos(items);
  };

  const handleRemovePhoto = (indexToRemove, isExisting = false) => {
    if (isExisting) {
      setExistingPhotos((prevPhotos) =>
        prevPhotos.filter((_, index) => index !== indexToRemove)
      );
    } else {
      setPhotos((prevPhotos) =>
        prevPhotos.filter((_, index) => index !== indexToRemove)
      );
    }
  };

  /* DESCRIPTION */
  const [formDescription, setFormDescription] = useState({
    title: "",
    description: "",
    highlight: "",
    highlightDesc: "",
    price: 0,
  });

  const handleChangeDescription = (e) => {
    const { name, value } = e.target;
    setFormDescription({
      ...formDescription,
      [name]: value,
    });
  };

  const { user, token } = useSelector((state) => state);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
    }
  }, [user, token, navigate]);

  useEffect(() => {
    const getListingDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3001/properties/${listingId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setListing(data);
        setCategory(data.category);
        setType(data.type);
        setFormLocation({
          streetAddress: data.streetAddress,
          aptSuite: data.aptSuite,
          city: data.city,
          province: data.province,
          country: data.country,
        });
        setGuestCount(data.guestCount);
        setBedroomCount(data.bedroomCount);
        setBedCount(data.bedCount);
        setBathroomCount(data.bathroomCount);
        setAmenities(data.amenities);
        setExistingPhotos(data.listingPhotoPaths);
        setFormDescription({
          title: data.title,
          description: data.description,
          highlight: data.highlight,
          highlightDesc: data.highlightDesc,
          price: data.price,
        });
        setLoading(false);
      } catch (err) {
        console.log("Fetch Listing Details Failed", err.message);
        setLoading(false);
      }
    };
    getListingDetails();
  }, [listingId, token]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const listingForm = new FormData();
      listingForm.append("creator", user._id);
      listingForm.append("category", category);
      listingForm.append("type", type);
      listingForm.append("streetAddress", formLocation.streetAddress);
      listingForm.append("aptSuite", formLocation.aptSuite);
      listingForm.append("city", formLocation.city);
      listingForm.append("province", formLocation.province);
      listingForm.append("country", formLocation.country);
      listingForm.append("guestCount", guestCount);
      listingForm.append("bedroomCount", bedroomCount);
      listingForm.append("bedCount", bedCount);
      listingForm.append("bathroomCount", bathroomCount);
      listingForm.append("amenities", amenities);
      listingForm.append("title", formDescription.title);
      listingForm.append("description", formDescription.description);
      listingForm.append("highlight", formDescription.highlight);
      listingForm.append("highlightDesc", formDescription.highlightDesc);
      listingForm.append("price", formDescription.price);
      listingForm.append("existingPhotos", JSON.stringify(existingPhotos));

      /* Append new photos to the FormData object */
      photos.forEach((photo) => {
        listingForm.append("listingPhotos", photo);
      });

      /* Send a PATCH request to server */
      const response = await fetch(`http://localhost:3001/properties/${listingId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: listingForm,
      });

      if (response.ok) {
        navigate(`/properties/${listingId}`);
      } else {
        const error = await response.json();
        console.error("Failed to update listing:", error);
      }
    } catch (err) {
      console.log("Update Listing failed", err.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !token) {
    return null;
  }

  return (
    <>
      <Navbar />

      <div className="create-listing">
        <h1>Edit Your Place</h1>
        <form onSubmit={handleUpdate}>
          <div className="create-listing_step1">
            <h2>Step 1: Tell us about your place</h2>
            <hr />
            <h3>Which of these categories best describes your place?</h3>
            <div className="category-list">
              {categories?.map((item, index) => (
                <div
                  className={`category ${
                    category === item.label ? "selected" : ""
                  }`}
                  key={index}
                  onClick={() => setCategory(item.label)}
                >
                  <div className="category_icon">{item.icon}</div>
                  <p>{item.label}</p>
                </div>
              ))}
            </div>

            <h3>What type of place will guests have?</h3>
            <div className="type-list">
              {types?.map((item, index) => (
                <div
                  className={`type ${type === item.name ? "selected" : ""}`}
                  key={index}
                  onClick={() => setType(item.name)}
                >
                  <div className="type_text">
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                  </div>
                  <div className="type_icon">{item.icon}</div>
                </div>
              ))}
            </div>

            <h3>Where's your place located?</h3>
            <div className="full">
              <div className="location">
                <p>Street Address</p>
                <input
                  type="text"
                  placeholder="Street Address"
                  name="streetAddress"
                  value={formLocation.streetAddress}
                  onChange={handleChangeLocation}
                  required
                />
              </div>
            </div>

            <div className="half">
              <div className="location">
                <p>Apartement, Suite, etc. (if applicable)</p>
                <input
                  type="text"
                  placeholder="Apt, Suite, etc. (if applicable)"
                  name="aptSuite"
                  value={formLocation.aptSuite}
                  onChange={handleChangeLocation}
                  required
                />
              </div>
              <div className="location">
                <p>City</p>
                <input
                  type="text"
                  placeholder="City"
                  name="city"
                  value={formLocation.city}
                  onChange={handleChangeLocation}
                  required
                />
              </div>
            </div>

            <div className="half">
              <div className="location">
                <p>Province</p>
                <input
                  type="text"
                  placeholder="Province"
                  name="province"
                  value={formLocation.province}
                  onChange={handleChangeLocation}
                  required
                />
              </div>
              <div className="location">
                <p>Country</p>
                <input
                  type="text"
                  placeholder="Country"
                  name="country"
                  value={formLocation.country}
                  onChange={handleChangeLocation}
                  required
                />
              </div>
            </div>

            <h3>Share some basics about your place</h3>
            <div className="basics">
              <div className="basics_count">
                <p>Guests</p>
                <div className="basics_count_btn">
                  <RemoveCircleOutline
                    onClick={() => {
                      guestCount > 1 && setGuestCount(guestCount - 1);
                    }}
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                  <p>{guestCount}</p>
                  <AddCircleOutline
                    onClick={() => {
                      setGuestCount(guestCount + 1);
                    }}
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                </div>
              </div>

              <div className="basics_count">
                <p>Bedrooms</p>
                <div className="basics_count_btn">
                  <RemoveCircleOutline
                    onClick={() => {
                      bedroomCount > 1 && setBedroomCount(bedroomCount - 1);
                    }}
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                  <p>{bedroomCount}</p>
                  <AddCircleOutline
                    onClick={() => {
                      setBedroomCount(bedroomCount + 1);
                    }}
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                </div>
              </div>

              <div className="basics_count">
                <p>Beds</p>
                <div className="basics_count_btn">
                  <RemoveCircleOutline
                    onClick={() => {
                      bedCount > 1 && setBedCount(bedCount - 1);
                    }}
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                  <p>{bedCount}</p>
                  <AddCircleOutline
                    onClick={() => {
                      setBedCount(bedCount + 1);
                    }}
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                </div>
              </div>

              <div className="basics_count">
                <p>Bathrooms</p>
                <div className="basics_count_btn">
                  <RemoveCircleOutline
                    onClick={() => {
                      bathroomCount > 1 && setBathroomCount(bathroomCount - 1);
                    }}
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                  <p>{bathroomCount}</p>
                  <AddCircleOutline
                    onClick={() => {
                      setBathroomCount(bathroomCount + 1);
                    }}
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="create-listing_step2">
            <h2>Step 2: Tell us what amenities you offer</h2>
            <hr />

            <h3>What makes your place stand out?</h3>
            <div className="amenities">
              {facilities?.map((item, index) => (
                <div
                  className={`facility ${
                    amenities.includes(item.name) ? "selected" : ""
                  }`}
                  key={index}
                  onClick={() => handleSelectAmenities(item.name)}
                >
                  <div className="facility_icon">{item.icon}</div>
                  <p>{item.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="create-listing_step3">
            <h2>Step 3: Add some photos of your place</h2>
            <hr />

            <div className="photos">
              {existingPhotos.map((photo, index) => (
                <div key={index} className="photo">
                  <img 
                    src={`http://localhost:3001/${photo.replace('public', '')}`}
                    alt="existing place"
                  />
                  <button type="button" onClick={() => handleRemovePhoto(index, true)}>
                    <BiTrash />
                  </button>
                </div>
              ))}
              {photos.map((photo, index) => (
                <div key={index} className="photo">
                  <img 
                    src={URL.createObjectURL(photo)}
                    alt="new place"
                  />
                  <button type="button" onClick={() => handleRemovePhoto(index)}>
                    <BiTrash />
                  </button>
                </div>
              ))}
            </div>

            <h3>Upload new photos or keep existing ones.</h3>
            <DragDropContext onDragEnd={handleDragPhoto} isCombineEnabled={false}>
              <Droppable droppableId="photos" direction="horizontal" isDropDisabled={false}>
                {(provided) => (
                  <div className="photos" {...provided.droppableProps} ref={provided.innerRef}>
                    <input
                      id="image"
                      type="file"
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={handleUploadPhotos}
                      multiple
                    />
                    <label htmlFor="image" className="alone">
                      <div className="icon">
                        <IoIosImages />
                      </div>
                      <p>Upload new photos from your device</p>
                    </label>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          <div className="create-listing_step4">
            <h2>Step 4: Describe your place</h2>
            <hr />
            <h3>Create your title</h3>
            <input
              type="text"
              placeholder="Title"
              name="title"
              value={formDescription.title}
              onChange={handleChangeDescription}
              required
            />
            <h3>Create your description</h3>
            <textarea
              placeholder="Description"
              name="description"
              value={formDescription.description}
              onChange={handleChangeDescription}
              required
            />
            <h3>Add some highlights to your description</h3>
            <input
              type="text"
              placeholder="Highlight"
              name="highlight"
              value={formDescription.highlight}
              onChange={handleChangeDescription}
              required
            />
            <h3>What makes your place special?</h3>
            <textarea
              placeholder="Highlight Details"
              name="highlightDesc"
              value={formDescription.highlightDesc}
              onChange={handleChangeDescription}
              required
            />
            <h3>Now, set your PRICE</h3>
            <span>$</span>
            <input
              type="number"
              placeholder="Price"
              name="price"
              value={formDescription.price}
              onChange={handleChangeDescription}
              className="price"
              required
            />
          </div>
          <button type="submit">EDIT YOUR PLACE</button>
        </form>
      </div>

      <Footer />
    </>
  );
};

export default EditListing; 