// App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import CreateListing from "./pages/CreateListing";
import ListingDetails from "./pages/ListingDetails";
import TripList from "./pages/TripList";
import WishList from "./pages/WishList";
import PropertyList from "./pages/PropertyList";
import ReservationList from "./pages/ReservationList";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import ChatWidget from "./components/ChatWidget";
import AdminDashboard from "./pages/AdminDashboard";
import EditListing from "./pages/EditListing";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/properties/:listingId" element={<ListingDetails />} />
        <Route path="/properties/category/:category" element={<CategoryPage />} />
        <Route path="/properties/search/:search" element={<SearchPage />} />
        <Route path="/edit-listing/:listingId" element={<EditListing />} />
        <Route path="/:userId/trips" element={<TripList />} />
        <Route path="/:userId/wishList" element={<WishList />} />
        <Route path="/:userId/properties" element={<PropertyList />} />
        <Route path="/:userId/reservations" element={<ReservationList />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/properties/edit/:listingId" element={<EditListing />} />
      </Routes>

      {/* ← widget chat sẽ hiện trên mọi trang */}
      <ChatWidget />
    </BrowserRouter>
  );
}

export default App;
