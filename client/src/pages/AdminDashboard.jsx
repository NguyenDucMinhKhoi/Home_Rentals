import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/AdminDashboard.scss";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const navigate = useNavigate();

  console.log("AdminDashboard - user from Redux:", user);
  console.log("AdminDashboard - user role from Redux:", user?.role);

  const [isUserLoaded, setIsUserLoaded] = useState(false);

  useEffect(() => {
    if (user !== null) {
      if (user.role !== "admin") {
        console.log('AdminDashboard - User is not admin, redirecting to /');
        navigate("/");
      } else {
        console.log('AdminDashboard - User is admin, fetching data...');
        fetchData(token);
      }
      setIsUserLoaded(true);
    } else if (isUserLoaded) {
      console.log('AdminDashboard - User is null after load, redirecting to /login');
      navigate("/login"); 
    }
  }, [user, activeTab, isUserLoaded, token]);

  const fetchData = async (current_token) => {
    try {
      setLoading(true);
      setError(null);

      if (!current_token) {
        setError("Authentication token not found. Please log in.");
        setUsers([]);
        setListings([]);
        setBookings([]);
        setLoading(false);
        navigate("/login");
        return;
      }
      
      let response;
      let data;

      switch (activeTab) {
        case "users":
          response = await fetch("http://localhost:3001/admin/users", {
            headers: {
              Authorization: `Bearer ${current_token}`,
            },
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Unknown error fetching users" }));
            setUsers([]);
            throw new Error(errorData.message || "Failed to fetch users");
          }
          data = await response.json();
          setUsers(Array.isArray(data) ? data : []);
          break;
          
        case "listings":
          response = await fetch("http://localhost:3001/admin/listings", {
            headers: {
              Authorization: `Bearer ${current_token}`,
            },
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Unknown error fetching listings" }));
            setListings([]);
            throw new Error(errorData.message || "Failed to fetch listings");
          }
          data = await response.json();
          setListings(Array.isArray(data) ? data : []);
          break;
          
        case "bookings":
          response = await fetch("http://localhost:3001/admin/bookings", {
            headers: {
              Authorization: `Bearer ${current_token}`,
            },
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Unknown error fetching bookings" }));
            setBookings([]);
            throw new Error(errorData.message || "Failed to fetch bookings");
          }
          data = await response.json();
          setBookings(Array.isArray(data) ? data : []);
          break;
        default:
          setLoading(false);
          setUsers([]);
          setListings([]);
          setBookings([]);
          return;
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      setUsers([]);
      setListings([]);
      setBookings([]);
      setError(error.message || "Failed to fetch data. Please try again.");
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    try {
      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }
      const response = await fetch(`http://localhost:3001/admin/${type}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchData(token);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || "Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      setError("Failed to delete item");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }
      const response = await fetch(`http://localhost:3001/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        fetchData(token);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || "Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      setError("Failed to update role");
    }
  };

  if (!isUserLoaded && user === null) return <div>Loading user data...</div>;
  if (loading) return <div>Loading dashboard data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <Navbar />
      <div className="admin-dashboard">
        <div className="tabs">
          <button
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
          <button
            className={activeTab === "listings" ? "active" : ""}
            onClick={() => setActiveTab("listings")}
          >
            Listings
          </button>
          <button
            className={activeTab === "bookings" ? "active" : ""}
            onClick={() => setActiveTab("bookings")}
          >
            Bookings
          </button>
        </div>

        <div className="content">
          {activeTab === "users" && (
            <div className="users-list">
              <h2>Users</h2>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {console.log("Users state before map:", users)}
                  {Array.isArray(users) &&
                    users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          {user.firstName} {user.lastName}
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user._id, e.target.value)
                            }
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(user._id, "users")}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "listings" && (
            <div className="listings-list">
              <h2>Listings</h2>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {console.log("Listings state before map:", listings)}
                  {Array.isArray(listings) &&
                    listings.map((listing) => (
                      <tr key={listing._id}>
                        <td>{listing.title}</td>
                        <td>{listing.category}</td>
                        <td>${listing.price}</td>
                        <td>
                          <Link 
                            to={`/edit-listing/${listing._id}`}
                            className="edit-btn"
                          >
                            Edit
                          </Link>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(listing._id, "listings")}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="bookings-list">
              <h2>Bookings</h2>
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Host</th>
                    <th>Property</th>
                    <th>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {console.log("Bookings state before map:", bookings)}
                  {Array.isArray(bookings) &&
                    bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td>
                          {booking.customerId.firstName}{" "}
                          {booking.customerId.lastName}
                        </td>
                        <td>
                          {booking.hostId.firstName} {booking.hostId.lastName}
                        </td>
                        <td>{booking.listingId.title}</td>
                        <td>${booking.totalPrice}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
