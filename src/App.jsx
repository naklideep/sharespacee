import { useState, useEffect } from "react";
import api from "./services/api";
import Messenger from "./components/Messenger";
import AdminDashboard from "./components/AdminDashboard";
import ClassicTheme from "./ClassicTheme";
import {
  Search,
  BookOpen,
  Laptop,
  Camera,
  Dumbbell,
  Gamepad2,
  Plus,
  ArrowUpRight,
  MapPin,
  Heart,
  SlidersHorizontal,
  Menu,
  X,
  Clock3,
  ShieldCheck,
  Sparkles,
  UserRound,
  LogOut,
  LockKeyhole,
  CalendarDays,
  ClipboardList,
  Check,
  Ban,
  RefreshCw,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Bell,
  CheckCheck,
  MessageCircle,
} from "lucide-react";
const categories = [
  { name: "All items", icon: Sparkles },
  { name: "Books", icon: BookOpen },
  { name: "Electronics", icon: Laptop },
  { name: "Photography", icon: Camera },
  { name: "Sports", icon: Dumbbell },
  { name: "Gaming", icon: Gamepad2 },
  { name: "Lab Equipment", icon: ShieldCheck },
  { name: "Stationery", icon: BookOpen },
  { name: "Other", icon: Sparkles },
];

const placeholderImage =
  "https://placehold.co/900x600/f0eee8/315b45?text=ShareSpace";

function toLocalDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTomorrowDateInput() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toLocalDateInput(date);
}

const emptyAuthForm = {
  name: "",
  email: "",
  password: "",
  college: "",
  role: "student",
};

const emptyResourceForm = {
  title: "",
  description: "",
  category: "Books",
  pricePerDay: "",
  imageUrl: "",
  location: "",
};

function getInitials(name = "Community Member") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function App() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [activeCategory, setActiveCategory] = useState("All items");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sharespace_favorites")) || [];
    } catch {
      return [];
    }
  });
  const [showFavorites, setShowFavorites] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingStartDate, setBookingStartDate] = useState(() =>
    toLocalDateInput(new Date())
  );
  const [bookingEndDate, setBookingEndDate] = useState(() =>
    getTomorrowDateInput()
  );
  const [bookingLoading, setBookingLoading] = useState(false);

  const [showBookingDashboard, setShowBookingDashboard] = useState(false);
  const [bookingDashboardTab, setBookingDashboardTab] = useState("mine");
  const [myBookings, setMyBookings] = useState([]);
  const [receivedBookings, setReceivedBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingActionId, setBookingActionId] = useState("");
  const [bookingsError, setBookingsError] = useState("");
  const [bookingsNotice, setBookingsNotice] = useState("");

  // Persistent server-backed notifications.
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");

  // Authentication state
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("sharespace_user");
      const token = localStorage.getItem("sharespace_token");

      return savedUser && token ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [authMode, setAuthMode] = useState("login");
  const [showAuth, setShowAuth] = useState(false);
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Resource listing state
  const [showListing, setShowListing] = useState(false);
  const [resourceForm, setResourceForm] = useState(emptyResourceForm);
  const [listingError, setListingError] = useState("");
  const [listingMessage, setListingMessage] = useState("");
  const [listingLoading, setListingLoading] = useState(false);
  const [showMyListings, setShowMyListings] = useState(false);
  const [myListings, setMyListings] = useState([]);
  const [myListingsLoading, setMyListingsLoading] = useState(false);
  const [myListingsError, setMyListingsError] = useState("");
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [deletingResourceId, setDeletingResourceId] = useState(null);

  // Messenger state
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showMessenger, setShowMessenger] = useState(false);
  const [initialChatBookingId, setInitialChatBookingId] = useState(null);

  const openMessenger = (bookingId = null) => {
    if (!user) {
      openAuth("login");
      return;
    }
    setInitialChatBookingId(bookingId);
    setShowMessenger(true);
    setShowBookingDashboard(false);
    setShowNotifications(false);
    setShowListing(false);
    setShowMyListings(false);
    setSelectedItem(null);
    setShowAuth(false);
    setMobileMenu(false);
  };

const fetchResources = async () => {
  try {
    setLoading(true);
    setApiError("");

    console.log("Fetching resources from backend...");

    const response = await api.get("/resources");

    console.log("API response:", response.data);
    console.log("Resources:", response.data.data);

    setResources(response.data.data || []);
  } catch (error) {
    console.error("API Error:", error.message);
    console.error("Response:", error.response?.data);

    setApiError(
      error.response?.data?.message ||
        "Unable to load resources. Check that your backend is running."
    );
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchResources();
}, []);

  const fetchMyListings = async () => {
    if (!user) return;
    setMyListingsLoading(true);
    setMyListingsError("");
    try {
      const response = await api.get("/resources/mine");
      setMyListings(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch your listings:", error);
      setMyListingsError(
        error.response?.data?.message || "Unable to load your listings. Please try again."
      );
    } finally {
      setMyListingsLoading(false);
    }
  };

  const openMyListings = async () => {
    if (!user) {
      openAuth("login");
      return;
    }
    setShowMyListings(true);
    setShowBookingDashboard(false);
    setShowListing(false);
    setShowAuth(false);
    setSelectedItem(null);
    setMobileMenu(false);
    await fetchMyListings();
    window.setTimeout(() => {
      document.getElementById("my-listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleToggleAvailability = async (item) => {
    setMyListingsError("");
    try {
      await api.patch(`/resources/${item._id}/availability`);
      await Promise.all([fetchMyListings(), fetchResources()]);
    } catch (error) {
      console.error("Availability update failed:", error);
      setMyListingsError(error.response?.data?.message || "Unable to update availability.");
    }
  };

  const handleDeleteListing = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? This action cannot be undone.`)) return;
    setDeletingResourceId(item._id);
    setMyListingsError("");
    try {
      await api.delete(`/resources/${item._id}`);
      await Promise.all([fetchMyListings(), fetchResources()]);
    } catch (error) {
      console.error("Listing deletion failed:", error);
      setMyListingsError(error.response?.data?.message || "Unable to delete this listing.");
    } finally {
      setDeletingResourceId(null);
    }
  };

  const openEditListing = (item) => {
    setEditingResourceId(item._id);
    setResourceForm({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "Books",
      pricePerDay: String(item.pricePerDay ?? ""),
      imageUrl: item.imageUrl || "",
      location: item.location || "",
    });
    setListingError("");
    setListingMessage("");
    setShowMyListings(false);
    setShowListing(true);
  };

  const fetchNotifications = async (showSpinner = false) => {
    if (!localStorage.getItem("sharespace_token")) {
      setNotifications([]);
      setUnreadNotificationCount(0);
      return;
    }
    if (showSpinner) setNotificationsLoading(true);
    try {
      const response = await api.get("/notification");
      setNotifications(response.data.data || []);
      setUnreadNotificationCount(Number(response.data.unreadCount || 0));
      setNotificationsError("");
    } catch (error) {
      console.error("Fetch notifications failed:", error);
      if (showSpinner) {
        setNotificationsError(error.response?.data?.message || "Unable to load notifications.");
      }
    } finally {
      if (showSpinner) setNotificationsLoading(false);
    }
  };

  const toggleNotifications = async () => {
    if (!user) {
      openAuth("login");
      return;
    }
    const opening = !showNotifications;
    setShowNotifications(opening);
    if (opening) await fetchNotifications(true);
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((current) => current.map((item) =>
        item._id === notificationId ? { ...item, isRead: true } : item
      ));
      setUnreadNotificationCount((count) => Math.max(0, count - 1));
    } catch (error) {
      console.error("Mark notification read failed:", error);
      setNotificationsError(error.response?.data?.message || "Unable to update notification.");
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadNotificationCount(0);
    } catch (error) {
      console.error("Mark all notifications read failed:", error);
      setNotificationsError(error.response?.data?.message || "Unable to update notifications.");
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadNotificationCount(0);
      setShowNotifications(false);
      return undefined;
    }
    fetchNotifications();
    // Poll for server-side booking activity while signed in.
    const intervalId = window.setInterval(() => fetchNotifications(), 15000);
    return () => window.clearInterval(intervalId);
  }, [user]);

  // Persist favourites locally.
  useEffect(() => {
    localStorage.setItem(
      "sharespace_favorites",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  // Filter resources.
  const filteredResources = resources.filter((item) => {
    const searchTerm = search.trim().toLowerCase();

    const matchesCategory =
      activeCategory === "All items" ||
      item.category === activeCategory;

    const matchesSearch =
      !searchTerm ||
      item.title?.toLowerCase().includes(searchTerm) ||
      item.category?.toLowerCase().includes(searchTerm) ||
      item.location?.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      item.ownerName?.toLowerCase().includes(searchTerm);

    const matchesFavorites =
      !showFavorites || favorites.includes(item._id);

    return matchesCategory && matchesSearch && matchesFavorites;
  });

  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id]
    );
  };

  const openItem = (item) => {
    setSelectedItem(item);
    setBookingMessage("");
  };

  const resetFilters = () => {
    setActiveCategory("All items");
    setSearch("");
    setShowFavorites(false);
  };

  // Open the authentication modal.
  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setAuthForm(emptyAuthForm);
    setAuthError("");
    setAuthMessage("");
    setShowAuth(true);
    setShowListing(false);
  };

  // Register or log in.
  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    setAuthError("");
    setAuthMessage("");
    setAuthLoading(true);

    try {
      const endpoint =
        authMode === "register" ? "/auth/register" : "/auth/login";

      const payload =
        authMode === "register"
          ? {
              name: authForm.name.trim(),
             email: authForm.email.trim(),
    password: authForm.password,
    role: authForm.role,
              college: authForm.college.trim(),
              role: authForm.role,
            }
          : {
              email: authForm.email.trim(),
              password: authForm.password,
              role: authForm.role,
            };

      const response = await api.post(endpoint, payload);

      const { token, data } = response.data;

      if (!token || !data) {
        throw new Error("The server did not return an account and token.");
      }

      localStorage.setItem("sharespace_token", token);
      localStorage.setItem("sharespace_user", JSON.stringify(data));

      setUser(data);
      setShowAuth(false);
      setAuthForm(emptyAuthForm);
      setAuthError("");
      setAuthMessage("");

      // Refresh data after authentication.
      await fetchResources();
    } catch (error) {
      console.error("Authentication failed:", error);

      setAuthError(
        error.response?.data?.message ||
          error.message ||
          "Authentication failed. Please try again."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sharespace_token");
    localStorage.removeItem("sharespace_user");

    setUser(null);
    setShowListing(false);
    setShowMyListings(false);
    setMyListings([]);
    setEditingResourceId(null);
    setSelectedItem(null);
    setBookingMessage("");
  };

  // Listing requires an authenticated user.
  const openListing = () => {
    if (!user) {
      openAuth("login");
      return;
    }

    setListingError("");
    setListingMessage("");
    setEditingResourceId(null);
    setResourceForm(emptyResourceForm);
    setShowMyListings(false);
    setShowListing(true);
  };

  const handleResourceSubmit = async (event) => {
    event.preventDefault();

    setListingError("");
    setListingMessage("");
    setListingLoading(true);

    try {
      const payload = {
        ...resourceForm,
        title: resourceForm.title.trim(),
        description: resourceForm.description.trim(),
        location: resourceForm.location.trim(),
        imageUrl: resourceForm.imageUrl.trim(),
        pricePerDay: Number(resourceForm.pricePerDay),
        ownerName: user.name,
      };

      const response = editingResourceId
        ? await api.patch(`/resources/${editingResourceId}`, payload)
        : await api.post("/resources", payload);

      setListingMessage(
        response.data.message ||
          (editingResourceId ? "Resource updated successfully!" : "Resource listed successfully!")
      );
      setResourceForm(emptyResourceForm);
      setEditingResourceId(null);
      await Promise.all([fetchResources(), fetchMyListings()]);

      window.setTimeout(() => {
        setShowListing(false);
        setListingMessage("");
      }, 1000);
    } catch (error) {
      console.error("Resource listing failed:", error);

      setListingError(
        error.response?.data?.message ||
          "Unable to list your resource. Please try again."
      );
    } finally {
      setListingLoading(false);
    }
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    setBookingsError("");

    try {
      const results = await Promise.allSettled([
        api.get("/bookings/mine"),
        api.get("/bookings/received"),
      ]);

      const mineResult = results[0];
      const receivedResult = results[1];

      setMyBookings(
        mineResult.status === "fulfilled" ? mineResult.value.data.data || [] : []
      );
      setReceivedBookings(
        receivedResult.status === "fulfilled"
          ? receivedResult.value.data.data || []
          : []
      );

      if (mineResult.status === "rejected" && receivedResult.status === "rejected") {
        setBookingsError(
          mineResult.reason?.response?.data?.message ||
            "Unable to load bookings. Please sign in again and retry."
        );
      } else if (receivedResult.status === "rejected") {
        setBookingsError(
          receivedResult.reason?.response?.data?.message ||
            "Your bookings loaded, but received requests could not be loaded."
        );
      }
    } catch (error) {
      console.error("Fetch bookings failed:", error);
      setBookingsError("Unable to load bookings. Please try again.");
    } finally {
      setBookingsLoading(false);
    }
  };

  const openBookingDashboard = async (tab = "mine") => {
    if (!user) {
      openAuth("login");
      return;
    }

    setBookingDashboardTab(tab);
    setBookingsNotice("");
    setBookingsError("");
    setShowBookingDashboard(true);
    await fetchBookings();
  };

  const updateBookingStatus = async (bookingId, status) => {
    setBookingActionId(bookingId);
    setBookingsError("");
    setBookingsNotice("");

    try {
      const response = await api.patch(`/bookings/${bookingId}/status`, { status });
      setBookingsNotice(
        response.data.message ||
          `Booking ${status === "approved" ? "approved" : "rejected"} successfully.`
      );
      await fetchBookings();
    } catch (error) {
      console.error("Update booking status failed:", error);
      setBookingsError(
        error.response?.data?.message ||
          "Unable to update this booking. Please try again."
      );
    } finally {
      setBookingActionId("");
    }
  };

  const cancelBooking = async (bookingId) => {
    setBookingActionId(bookingId);
    setBookingsError("");
    setBookingsNotice("");

    try {
      const response = await api.patch(`/bookings/${bookingId}/cancel`);
      setBookingsNotice(response.data.message || "Booking cancelled successfully.");
      await fetchBookings();
    } catch (error) {
      console.error("Cancel booking failed:", error);
      setBookingsError(
        error.response?.data?.message ||
          "Unable to cancel this booking. Please try again."
      );
    } finally {
      setBookingActionId("");
    }
  };

  const handleBooking = async () => {
    if (!user) {
      openAuth("login");
      return;
    }

    if (!selectedItem?._id) {
      setBookingMessage("Please select a resource first.");
      return;
    }

    if (!bookingStartDate || !bookingEndDate) {
      setBookingMessage("Choose both a start date and an end date.");
      return;
    }

    if (bookingEndDate <= bookingStartDate) {
      setBookingMessage("The end date must be after the start date.");
      return;
    }

    if (bookingStartDate < toLocalDateInput(new Date())) {
      setBookingMessage("The start date cannot be in the past.");
      return;
    }

    setBookingLoading(true);
    setBookingMessage("");

    try {
      const response = await api.post("/bookings", {
        resourceId: selectedItem._id,
        startDate: bookingStartDate,
        endDate: bookingEndDate,
      });

      setBookingMessage(
        response.data.message || "Booking request submitted successfully."
      );
      fetchBookings().catch((error) =>
        console.error("Background booking refresh failed:", error)
      );
    } catch (error) {
      console.error("Create booking failed:", error);
      setBookingMessage(
        error.response?.data?.message ||
          "Unable to submit your booking request. Please try again."
      );
    } finally {
      setBookingLoading(false);
    }
  };

return (
  <div className="app-shell">
    <ClassicTheme />
      <style>{`
        .notification-nav-button { position:relative; }
        .notification-count-badge { display:inline-flex; align-items:center; justify-content:center; min-width:18px; height:18px; padding:0 5px; border-radius:999px; background:#9b352e; color:#fff; font-size:10px; font-weight:800; line-height:1; }
        .notification-panel { position:fixed; z-index:1200; top:82px; right:clamp(12px,3vw,40px); width:min(420px,calc(100vw - 24px)); max-height:min(72vh,620px); overflow:hidden; display:flex; flex-direction:column; background:#fffdf7; border:1px solid #d8cfbd; border-radius:8px; box-shadow:0 18px 60px rgb(25 30 22 / 22%); color:#243a2d; }
        .notification-panel-header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:17px 18px; border-bottom:1px solid #e6dece; }
        .notification-panel-header h3 { margin:0; font-family:Georgia,serif; font-size:23px; }
        .notification-panel-header p { margin:4px 0 0; color:#777363; font-size:12px; }
        .notification-panel-actions { display:flex; gap:7px; }
        .notification-panel-actions button { display:inline-flex; align-items:center; gap:5px; border:1px solid #d8cfbd; border-radius:4px; padding:7px 9px; background:#f8f5ed; color:#243a2d; font:inherit; font-size:11px; cursor:pointer; }
        .notification-list { overflow-y:auto; padding:8px; }
        .notification-item { display:flex; align-items:flex-start; gap:10px; padding:13px 11px; border-bottom:1px solid #eee6d7; border-radius:4px; }
        .notification-item:last-child { border-bottom:0; }
        .notification-item.unread { background:#f2f5ed; }
        .notification-dot { flex:0 0 8px; width:8px; height:8px; margin-top:6px; border-radius:50%; background:#9b352e; }
        .notification-dot.read { background:transparent; border:1px solid #cfc7b7; }
        .notification-copy { flex:1; min-width:0; }
        .notification-copy strong { display:block; margin-bottom:4px; font-size:13px; }
        .notification-copy p { margin:0; color:#69695d; font-size:12px; line-height:1.5; overflow-wrap:anywhere; }
        .notification-copy time { display:block; margin-top:6px; color:#8a8475; font-size:10px; }
        .notification-read-button { border:0; background:transparent; color:#315b45; cursor:pointer; padding:5px; }
        .notification-empty { padding:32px 18px; text-align:center; color:#777363; font-size:13px; }
        @media(max-width:650px) { .notification-panel { top:72px; right:12px; } .notification-nav-button { padding:8px !important; font-size:0 !important; gap:4px !important; } .notification-nav-button svg { width:17px; } }
        .nav-dashboard-button { display:inline-flex; align-items:center; gap:7px; padding:9px 12px; border:1px solid #d8cfbd; border-radius:5px; background:#f8f5ed; color:#243a2d; font:inherit; font-size:13px; cursor:pointer; }
        .nav-dashboard-button:hover,.nav-dashboard-active { background:#243a2d; color:#fffdf6; }
        .my-listings-section { scroll-margin-top:25px; padding:55px clamp(20px,5vw,80px) 65px; background:#f7f3e9; border-bottom:1px solid #ded5c4; }
        .my-listings-heading { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; margin-bottom:28px; }
        .my-listings-heading h2 { margin:8px 0; color:#243a2d; font-family:Georgia,serif; font-size:clamp(32px,4vw,46px); }
        .my-listings-heading p,.my-listings-empty p { color:#777363; line-height:1.6; }
        .my-listings-actions { display:flex; flex-wrap:wrap; gap:10px; }
        .my-listings-summary { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:15px; margin:25px 0; }
        .my-listings-summary > div { display:flex; flex-direction:column; gap:8px; padding:18px; background:#fffdf7; border:1px solid #e3dac8; border-radius:6px; }
        .my-listings-summary span { color:#777363; font-size:13px; }
        .my-listings-summary strong { color:#243a2d; font-family:Georgia,serif; font-size:30px; }
        .my-listings-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:22px; }
        .my-listing-card { min-width:0; overflow:hidden; background:#fffdf7; border:1px solid #e0d7c5; border-radius:7px; box-shadow:0 5px 18px rgb(49 39 20 / 5%); }
        .my-listing-image-wrap { position:relative; height:190px; overflow:hidden; background:#eae4d6; }
        .my-listing-image-wrap img { width:100%; height:100%; display:block; object-fit:cover; }
        .my-listing-status { position:absolute; top:12px; left:12px; padding:6px 10px; border-radius:3px; background:#fffdf7; font-size:11px; font-weight:700; }
        .my-listing-status.available { color:#28583a; } .my-listing-status.unavailable { color:#8c3830; }
        .my-listing-body { padding:18px; }
        .my-listing-category { color:#826a42; font-size:11px; font-weight:700; letter-spacing:.09em; text-transform:uppercase; }
        .my-listing-body h3 { margin:8px 0; color:#243a2d; font-family:Georgia,serif; font-size:21px; overflow-wrap:anywhere; }
        .my-listing-description { min-height:42px; color:#777363; font-size:13px; line-height:1.6; overflow-wrap:anywhere; }
        .my-listing-meta { display:flex; align-items:center; justify-content:space-between; gap:10px; margin:16px 0; padding-top:13px; border-top:1px solid #eee6d7; }
        .my-listing-meta span { display:flex; align-items:center; gap:5px; color:#777363; font-size:12px; min-width:0; overflow-wrap:anywhere; }
        .my-listing-meta strong { flex-shrink:0; color:#243a2d; font-size:18px; } .my-listing-meta small { margin-left:3px; color:#777363; font-size:11px; font-weight:400; }
        .my-listing-controls { display:flex; flex-wrap:wrap; gap:7px; } .my-listing-controls button { display:inline-flex; align-items:center; justify-content:center; gap:5px; padding:8px 10px; font-size:12px; }
        .my-delete-button { color:#983e35 !important; border-color:#dfc3bd !important; } .my-delete-button:hover { background:#983e35 !important; color:white !important; }
        .my-listings-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:50px 20px; text-align:center; background:#fffdf7; border:1px dashed #d8cfbd; border-radius:7px; }
        .my-listings-empty h3 { margin:0; color:#243a2d; font-family:Georgia,serif; font-size:25px; }
        .my-listings-back { display:flex; justify-content:center; margin-top:30px; }
        .my-spin { animation:my-listings-spin .9s linear infinite; } @keyframes my-listings-spin { to { transform:rotate(360deg); } }
        @media(max-width:1000px) { .my-listings-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media(max-width:650px) { .my-listings-heading { align-items:flex-start; flex-direction:column; } .my-listings-grid { grid-template-columns:1fr; } .my-listings-summary { gap:8px; } .my-listings-summary > div { padding:12px; } .my-listings-summary strong { font-size:24px; } .my-listing-controls button { flex:1; } }
      `}</style>

    <div className="announcement">
        <Sparkles size={14} />
        <span>
          The smarter way to share on campus.
          <a href="#explore">
            {" "}
            Discover ShareSpace <ArrowUpRight size={13} />
          </a>
        </span>
      </div>

      <header className="navbar">
        <a className="brand" href="#" aria-label="ShareSpace home">
          <span className="brand-mark">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span>
            share<span className="brand-light">space</span>
          </span>
        </a>

        <nav className={`nav-links ${mobileMenu ? "nav-open" : ""}`}>
          <a
            className="nav-active"
            href="#explore"
            onClick={() => setMobileMenu(false)}
          >
            Explore
          </a>
          {user && (
            <button
              type="button"
              className={`nav-dashboard-button ${showMyListings ? "nav-dashboard-active" : ""}`}
              onClick={openMyListings}
            >
              <BookOpen size={15} /> My Listings
            </button>
          )}
          <a
            href="#how-it-works"
            onClick={() => setMobileMenu(false)}
          >
            How it works
          </a>
          <a
            href="#community"
            onClick={() => setMobileMenu(false)}
          >
            Community
          </a>
        </nav>

        <div className="nav-actions">
          <button
            className={`icon-button favorite-nav ${
              showFavorites ? "favorite-active" : ""
            }`}
            onClick={() => {
              setShowFavorites((current) => !current);
              document
                .getElementById("explore")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            aria-label="Show favourites"
            title="Favourites"
          >
            <Heart
              size={19}
              fill={showFavorites ? "currentColor" : "none"}
            />
            {favorites.length > 0 && (
              <span className="favorite-count">
                {favorites.length}
              </span>
            )}
          </button>

          {user ? (
            <div className="auth-nav-user">
              <span className="auth-user-avatar">
                {getInitials(user.name)}
              </span>
              <span className="auth-user-name">{user.name}</span>
              <button
                className="button button-outline notification-nav-button"
                onClick={toggleNotifications}
                title="Notifications"
                aria-label={`Notifications, ${unreadNotificationCount} unread`}
                aria-expanded={showNotifications}
              >
                <Bell size={16} />
                Notifications
                {unreadNotificationCount > 0 && (
                  <span className="notification-count-badge">{unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}</span>
                )}
              </button>
              <button
                type="button"
                className="button button-outline"
                onClick={() => openMessenger()}
                title="Open Messenger"
              >
                <MessageCircle size={15} />
                Messages
              </button>
              {user.role === "admin" && (
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setShowAdminDashboard(true)}
                  title="Open Admin Dashboard"
                >
                  <ShieldCheck size={15} />
                  Admin
                </button>
              )}
              <button
                className="button button-outline"
                onClick={() => openBookingDashboard("mine")}
                title="View your bookings and requests"
              >
                <ClipboardList size={15} />
                Bookings
              </button>
              <button
                className="button button-outline auth-logout"
                onClick={handleLogout}
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          ) : (
            <>
              <button
                className="button button-outline auth-login-button"
                onClick={() => openAuth("login")}
              >
                <UserRound size={16} />
                Login
              </button>
              <button
                className="button button-dark nav-cta"
                onClick={() => openAuth("register")}
              >
                Join ShareSpace <ArrowUpRight size={16} />
              </button>
            </>
          )}

          <button
            className="icon-button mobile-menu-button"
            onClick={() => setMobileMenu((current) => !current)}
            aria-label="Toggle menu"
          >
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {showNotifications && user && (
        <>
          <button className="notification-dismiss-layer" aria-label="Close notifications" onClick={() => setShowNotifications(false)} style={{ position: "fixed", inset: 0, zIndex: 1199, border: 0, background: "transparent", cursor: "default" }} />
          <section className="notification-panel" role="dialog" aria-label="Notifications" onClick={(event) => event.stopPropagation()}>
            <div className="notification-panel-header">
              <div>
                <h3>Notifications</h3>
                <p>{unreadNotificationCount} unread · Latest 50</p>
              </div>
              <div className="notification-panel-actions">
                <button onClick={markAllNotificationsRead} disabled={unreadNotificationCount === 0} title="Mark all as read"><CheckCheck size={14} /> Read all</button>
                <button onClick={() => setShowNotifications(false)} aria-label="Close notifications"><X size={15} /></button>
              </div>
            </div>
            {notificationsError && <p className="auth-error" style={{ margin: "10px 14px" }} role="alert">{notificationsError}</p>}
            <div className="notification-list">
              {notificationsLoading ? (
                <div className="notification-empty">Loading notifications…</div>
              ) : notifications.length === 0 ? (
                <div className="notification-empty"><Bell size={25} style={{ marginBottom: 8 }} /><div>You’re all caught up. New booking updates will appear here.</div></div>
              ) : notifications.map((notification) => (
                <article className={`notification-item ${notification.isRead ? "" : "unread"}`} key={notification._id}>
                  <span className={`notification-dot ${notification.isRead ? "read" : ""}`} />
                  <div className="notification-copy">
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                    <time dateTime={notification.createdAt}>{new Date(notification.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</time>
                  </div>
                  {!notification.isRead && <button className="notification-read-button" title="Mark as read" aria-label="Mark notification as read" onClick={() => markNotificationRead(notification._id)}><Check size={16} /></button>}
                </article>
              ))}
            </div>
          </section>
        </>
      )}


      <main>
        {showMyListings && user && (
          <section className="my-listings-section" id="my-listings">
            <div className="my-listings-heading">
              <div>
                <div className="eyebrow">YOUR SHARESPACE INVENTORY</div>
                <h2>My <span className="serif-text">listings.</span></h2>
                <p>Manage the resources you have shared with your community.</p>
              </div>
              <div className="my-listings-actions">
                <button className="button button-outline" onClick={fetchMyListings} disabled={myListingsLoading}>
                  <RefreshCw size={16} className={myListingsLoading ? "my-spin" : ""} /> Refresh
                </button>
                <button className="button button-green" onClick={openListing}><Plus size={16} /> Add resource</button>
              </div>
            </div>

            <div className="my-listings-summary">
              <div><span>Total listings</span><strong>{myListings.length}</strong></div>
              <div><span>Available</span><strong>{myListings.filter((item) => item.isAvailable !== false).length}</strong></div>
              <div><span>Unavailable</span><strong>{myListings.filter((item) => item.isAvailable === false).length}</strong></div>
            </div>

            {myListingsError && <p className="auth-error" role="alert">{myListingsError}</p>}
            {myListingsLoading ? (
              <div className="my-listings-empty"><RefreshCw size={24} className="my-spin" /><p>Loading your listings...</p></div>
            ) : myListings.length === 0 ? (
              <div className="my-listings-empty">
                <BookOpen size={32} />
                <h3>Nothing listed yet.</h3>
                <p>Share something useful with your campus community.</p>
                <button className="button button-green" onClick={openListing}><Plus size={16} /> List your first resource</button>
              </div>
            ) : (
              <div className="my-listings-grid">
                {myListings.map((item) => (
                  <article className="my-listing-card" key={item._id}>
                    <div className="my-listing-image-wrap">
                      <img
                        src={item.imageUrl || placeholderImage}
                        alt={item.title || "Resource"}
                        onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = placeholderImage; }}
                      />
                      <span className={`my-listing-status ${item.isAvailable === false ? "unavailable" : "available"}`}>
                        {item.isAvailable === false ? "Unavailable" : "Available"}
                      </span>
                    </div>
                    <div className="my-listing-body">
                      <span className="my-listing-category">{item.category}</span>
                      <h3>{item.title}</h3>
                      <p className="my-listing-description">{item.description || "No description provided."}</p>
                      <div className="my-listing-meta">
                        <span><MapPin size={14} /> {item.location || "Location not specified"}</span>
                        <strong>₹{Number(item.pricePerDay || 0).toLocaleString("en-IN")}<small>/day</small></strong>
                      </div>
                      <div className="my-listing-controls">
                        <button className="button button-outline" onClick={() => openEditListing(item)}><Pencil size={14} /> Edit</button>
                        <button className="button button-outline" onClick={() => handleToggleAvailability(item)} disabled={deletingResourceId === item._id}>
                          {item.isAvailable === false ? <Eye size={14} /> : <EyeOff size={14} />}
                          {item.isAvailable === false ? "Make available" : "Pause"}
                        </button>
                        <button className="button button-outline my-delete-button" onClick={() => handleDeleteListing(item)} disabled={deletingResourceId === item._id}>
                          <Trash2 size={14} /> {deletingResourceId === item._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <div className="my-listings-back">
              <button className="button button-outline" onClick={() => { setShowMyListings(false); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }}>
                Back to Explore <ArrowUpRight size={15} />
              </button>
            </div>
          </section>
        )}
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" />
              YOUR CAMPUS, CONNECTED
            </div>

            <h1>
              Good things
              <br />
              are <span className="serif-text">better shared.</span>
            </h1>

            <p className="hero-description">
              Borrow what you need. Lend what you don't.
              <br className="desktop-break" />
              Meet your campus community along the way.
            </p>

            <div className="hero-actions">
              <a className="button button-green" href="#explore">
                Explore resources <ArrowUpRight size={17} />
              </a>
              <a className="text-link" href="#how-it-works">
                How it works <span>→</span>
              </a>
            </div>

            <div className="hero-proof">
              <div className="avatar-stack">
                <span className="proof-avatar avatar-one">A</span>
                <span className="proof-avatar avatar-two">P</span>
                <span className="proof-avatar avatar-three">R</span>
                <span className="proof-avatar avatar-four">N</span>
              </div>
              <div className="proof-copy">
                <strong>A community that shares.</strong>
                <span>Made for students, by students.</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-main">
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=90"
                alt="Students walking through a university campus"
              />
              <div className="image-shade" />
              <div className="hero-image-caption">
                <span className="caption-label">MORE THAN THINGS</span>
                <strong>
                  It's about showing up
                  <br />
                  for each other.
                </strong>
              </div>
              <div className="floating-note">
                <span className="floating-note-icon">
                  <ShieldCheck size={20} />
                </span>
                <span>
                  <strong>Campus community</strong>
                  <small>Share with people nearby</small>
                </span>
              </div>
            </div>
            <div className="hero-sticker">
              <span>SHARE</span>
              <span className="sticker-star">✳</span>
              <span>REPEAT</span>
            </div>
          </div>
        </section>

        <section className="stats-strip" id="community">
          <div className="stat-item">
            <span className="stat-number">01<span>.</span></span>
            <span className="stat-label">Find what you need</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">02<span>.</span></span>
            <span className="stat-label">Borrow with ease</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">03<span>.</span></span>
            <span className="stat-label">Make sharing count</span>
          </div>
          <div className="stats-note">
            <span className="stats-note-dot" />
            Built around your campus life
          </div>
        </section>

        <section className="explore-section" id="explore">
          <div className="section-heading">
            <div>
              <div className="eyebrow">THE COMMUNITY COLLECTION</div>
              <h2>
                Find your <span className="serif-text">next useful thing.</span>
              </h2>
              <p>Good stuff, shared by people right around you.</p>
            </div>
            <button
              className="button button-outline"
              onClick={resetFilters}
            >
              View all items <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="search-row">
            <div className="search-box">
              <Search size={20} />
              <input
                type="search"
                placeholder="Search books, gadgets, sports gear..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search resources"
              />
              {search && (
                <button
                  className="clear-search"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              className={`filter-button ${
                showFavorites ? "filter-active" : ""
              }`}
              onClick={() => setShowFavorites((current) => !current)}
            >
              <SlidersHorizontal size={17} />
              {showFavorites ? "Favourites" : "Saved items"}
            </button>
          </div>

          <div className="category-row">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.name}
                  className={`category-pill ${
                    activeCategory === category.name
                      ? "category-selected"
                      : ""
                  }`}
                  onClick={() => setActiveCategory(category.name)}
                >
                  <Icon size={16} />
                  {category.name}
                </button>
              );
            })}
          </div>

          <div className="results-label">
            <span>{showFavorites ? "YOUR SAVED ITEMS" : "PICKED FOR CAMPUS"}</span>
            <span>{loading ? "Loading..." : `${filteredResources.length} items`}</span>
          </div>

          {loading ? (
            <div className="empty-state">
              <Sparkles size={28} />
              <h3>Finding useful things...</h3>
              <p>Loading resources from the ShareSpace community.</p>
            </div>
          ) : apiError ? (
            <div className="empty-state">
              <X size={28} />
              <h3>Couldn't load resources.</h3>
              <p>{apiError}</p>
              <button className="button button-green" onClick={fetchResources}>
                Try again
              </button>
            </div>
          ) : filteredResources.length > 0 ? (
            <div className="resource-grid">
              {filteredResources.map((item) => {
                const initials = getInitials(item.ownerName);
                const isFavorite = favorites.includes(item._id);

                return (
                  <article className="resource-card" key={item._id}>
                    <button
                      className={`card-favorite ${
                        isFavorite ? "is-favorite" : ""
                      }`}
                      onClick={() => toggleFavorite(item._id)}
                      aria-label={
                        isFavorite
                          ? `Remove ${item.title} from favourites`
                          : `Save ${item.title} to favourites`
                      }
                    >
                      <Heart
                        size={18}
                        fill={isFavorite ? "currentColor" : "none"}
                      />
                    </button>

                    <button
                      className="resource-image"
                      style={{ backgroundColor: "#e8e6e1" }}
                      onClick={() => openItem(item)}
                      aria-label={`View ${item.title}`}
                    >
                      <img
                        src={item.imageUrl || placeholderImage}
                        alt={item.title}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = placeholderImage;
                        }}
                      />
                      <span className="available-badge">
                        <span />
                        {item.isAvailable === false ? "Unavailable" : "Available"}
                      </span>
                      <span className="image-arrow">
                        <ArrowUpRight size={19} />
                      </span>
                    </button>

                    <div className="resource-info">
                      <div className="resource-meta">
                        <span>{item.category}</span>
                      </div>
                      <button
                        className="resource-title"
                        onClick={() => openItem(item)}
                      >
                        {item.title}
                      </button>
                      <div className="resource-location">
                        <MapPin size={13} />
                        {item.location}
                      </div>
                      <div className="resource-footer">
                        <div className="owner-info">
                          <span className="owner-avatar">{initials}</span>
                          <span>{item.ownerName}</span>
                        </div>
                        <div className="resource-price">
                          <strong>
                            ₹{Number(item.pricePerDay || 0).toLocaleString("en-IN")}
                          </strong>
                          <span>/ day</span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={28} />
              <h3>
                {showFavorites ? "No saved items yet." : "Nothing found just yet."}
              </h3>
              <p>
                {showFavorites
                  ? "Tap the heart on any resource to save it here."
                  : resources.length === 0
                    ? "Be the first to share a resource with your community."
                    : "Try another search or explore a different category."}
              </p>
              <button className="button button-green" onClick={resetFilters}>
                {showFavorites ? "Explore resources" : "Clear filters"}
              </button>
            </div>
          )}
        </section>

        <section className="how-section" id="how-it-works">
          <div className="how-heading">
            <div className="eyebrow">SIMPLE BY DESIGN</div>
            <h2>
              Sharing should feel <span className="serif-text">this easy.</span>
            </h2>
            <p>Less buying. More borrowing. Better campus days.</p>
          </div>
          <div className="steps-grid">
            <article className="step-card">
              <span className="step-number">01 / DISCOVER</span>
              <div className="step-icon"><Search size={24} /></div>
              <h3>Find your thing.</h3>
              <p>Search resources shared by people in your campus community.</p>
            </article>
            <article className="step-card">
              <span className="step-number">02 / REQUEST</span>
              <div className="step-icon"><Clock3 size={24} /></div>
              <h3>Make it yours.</h3>
              <p>Choose what you need, pick your dates, and send a booking request.</p>
            </article>
            <article className="step-card">
              <span className="step-number">03 / SHARE</span>
              <div className="step-icon"><Heart size={24} /></div>
              <h3>Pass it forward.</h3>
              <p>Borrow something useful or earn from the things you already own.</p>
            </article>
          </div>
        </section>

        <section className="share-banner">
          <div className="banner-decoration">✳</div>
          <div>
            <div className="eyebrow">HAVE SOMETHING TO SHARE?</div>
            <h2>
              Someone nearby might <span className="serif-text">need it.</span>
            </h2>
            <p>
              Turn things you don't use every day into something useful for someone else.
            </p>
          </div>
          <button className="button button-light" onClick={openListing}>
            <Plus size={18} />
            List your resource
          </button>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#">
          <span className="brand-mark">
            <span /><span /><span /><span />
          </span>
          <span>share<span className="brand-light">space</span></span>
        </a>
        <p>A little more sharing. A little less spending.</p>
        <span className="footer-copy">© 2026 ShareSpace · Made for campus life.</span>
      </footer>

      {/* Login / Register Modal */}
      {showAuth && (
        <div
          className="modal-backdrop"
          onClick={() => setShowAuth(false)}
          role="presentation"
        >
          <div
            className="item-modal auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowAuth(false)}
              aria-label="Close authentication"
            >
              <X size={21} />
            </button>

            <div className="auth-modal-content">
              <div className="auth-heading-icon"><LockKeyhole size={24} /></div>
              <div className="eyebrow">WELCOME TO SHARESPACE</div>
              <h2 id="auth-title">
                {authMode === "register" ? "Create your account." : "Welcome back."}
              </h2>
              <p>
                {authMode === "register"
                  ? "Join your campus community and start sharing."
                  : "Sign in to continue sharing with your community."}
              </p>

              <div className="auth-tabs">
                <button
                  type="button"
                  className={authMode === "login" ? "auth-tab active" : "auth-tab"}
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                    setAuthMessage("");
                  }}
                >
                  Login
                </button>
               <button
  type="button"
  className={authMode === "register" ? "auth-tab active" : "auth-tab"}
  onClick={() => {
    setAuthMode("register");
    setAuthError("");
    setAuthMessage("");
    setAuthForm((prev) => ({
      ...prev,
      role: "student",
    }));
  }}
>
  Register
</button>
              </div>

              <form className="auth-form" onSubmit={handleAuthSubmit}>
{authMode === "login" && (
  <label>
    Login as
    <select
      value={authForm.role}
      onChange={(event) =>
        setAuthForm({
          ...authForm,
          role: event.target.value,
        })
      }
    >
      <option value="student">Student</option>
      <option value="admin">Admin</option>
    </select>
  </label>
)}
                {authMode === "register" && (
                  <>
                    <label>
                      Full name
                      <input
                        required
                        autoComplete="name"
                        value={authForm.name}
                        onChange={(event) =>
                          setAuthForm({ ...authForm, name: event.target.value })
                        }
                        placeholder="Your full name"
                      />
                    </label>
                    <label>
                      College
                      <input
                        required
                        autoComplete="organization"
                        value={authForm.college}
                        onChange={(event) =>
                          setAuthForm({ ...authForm, college: event.target.value })
                        }
                        placeholder="Your college"
                      />
                    </label>
                    <label>
                      I am a
                      <select
                        value={authForm.role}
                        onChange={(event) =>
                          setAuthForm({ ...authForm, role: event.target.value })
                        }
                      >
<option value="student">Student</option>
<option value="admin">Admin</option>
                      </select>
                    </label>
                  </>
                )}

                <label>
                  Email address
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={authForm.email}
                    onChange={(event) =>
                      setAuthForm({ ...authForm, email: event.target.value })
                    }
                    placeholder="you@example.com"
                  />
                </label>

                <label>
                  Password
                  <input
                    type="password"
                    required
                    minLength={authMode === "register" ? 8 : 1}
                    autoComplete={
                      authMode === "register" ? "new-password" : "current-password"
                    }
                    value={authForm.password}
                    onChange={(event) =>
                      setAuthForm({ ...authForm, password: event.target.value })
                    }
                    placeholder={
                      authMode === "register"
                        ? "At least 8 characters"
                        : "Your password"
                    }
                  />
                </label>

                {authError && <p className="auth-error" role="alert">{authError}</p>}
                {authMessage && <p className="auth-success" role="status">{authMessage}</p>}

                <button
                  className="button button-green auth-submit"
                  type="submit"
                  disabled={authLoading}
                >
                  {authLoading
                    ? "Please wait..."
                    : authMode === "register"
                      ? "Create account"
                      : "Login"}
                  {!authLoading && <ArrowUpRight size={17} />}
                </button>
              </form>

              <p className="auth-switch-copy">
                {authMode === "register"
                  ? "Already have an account?"
                  : "New to ShareSpace?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "register" ? "login" : "register");
                    setAuthError("");
                    setAuthMessage("");
                  }}
                >
                  {authMode === "register" ? "Login" : "Create an account"}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* List a Resource Modal */}
      {showListing && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!listingLoading) {
              setShowListing(false);
              setEditingResourceId(null);
              setResourceForm(emptyResourceForm);
            }
          }}
          role="presentation"
        >
          <div
            className="item-modal listing-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="listing-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => {
                setShowListing(false);
                setEditingResourceId(null);
                setResourceForm(emptyResourceForm);
              }}
              aria-label="Close listing form"
              disabled={listingLoading}
            >
              <X size={21} />
            </button>

            <div className="auth-modal-content">
              <div className="eyebrow">GIVE YOUR THINGS A SECOND LIFE</div>
              <h2 id="listing-title">{editingResourceId ? "Edit your resource." : "List a resource."}</h2>
              <p>Make something you own useful to someone nearby.</p>

              <form className="auth-form" onSubmit={handleResourceSubmit}>
                <label>
                  Resource title
                  <input
                    required
                    maxLength={120}
                    value={resourceForm.title}
                    onChange={(event) =>
                      setResourceForm({ ...resourceForm, title: event.target.value })
                    }
                    placeholder="e.g. Scientific Calculator"
                  />
                </label>

                <label>
                  Description
                  <textarea
                    required
                    rows={3}
                    maxLength={2000}
                    value={resourceForm.description}
                    onChange={(event) =>
                      setResourceForm({
                        ...resourceForm,
                        description: event.target.value,
                      })
                    }
                    placeholder="Describe the condition and details..."
                  />
                </label>

                <label>
                  Category
                  <select
                    required
                    value={resourceForm.category}
                    onChange={(event) =>
                      setResourceForm({ ...resourceForm, category: event.target.value })
                    }
                  >
                    {categories
                      .filter((category) => category.name !== "All items")
                      .map((category) => (
                        <option key={category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </label>

                <label>
                  Price per day (₹)
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={resourceForm.pricePerDay}
                    onChange={(event) =>
                      setResourceForm({
                        ...resourceForm,
                        pricePerDay: event.target.value,
                      })
                    }
                    placeholder="e.g. 50"
                  />
                </label>

                <label>
                  Pickup location
                  <input
                    required
                    maxLength={200}
                    value={resourceForm.location}
                    onChange={(event) =>
                      setResourceForm({ ...resourceForm, location: event.target.value })
                    }
                    placeholder="e.g. College library"
                  />
                </label>

                <label>
                  Image URL (optional)
                  <input
                    type="url"
                    value={resourceForm.imageUrl}
                    onChange={(event) =>
                      setResourceForm({ ...resourceForm, imageUrl: event.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </label>

                {listingError && (
                  <p className="auth-error" role="alert">{listingError}</p>
                )}
                {listingMessage && (
                  <p className="auth-success" role="status">{listingMessage}</p>
                )}

                <button
                  className="button button-green auth-submit"
                  type="submit"
                  disabled={listingLoading}
                >
                  {listingLoading
                    ? editingResourceId ? "Saving changes..." : "Publishing..."
                    : editingResourceId ? "Save changes" : "Publish resource"}
                  {!listingLoading && (editingResourceId ? <Check size={17} /> : <Plus size={17} />)}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Booking dashboard */}
      {showBookingDashboard && (
        <div
          className="modal-backdrop"
          onClick={() => setShowBookingDashboard(false)}
          role="presentation"
        >
          <div
            className="item-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bookings-title"
            onClick={(event) => event.stopPropagation()}
            style={{ width: "min(920px, 94vw)", maxHeight: "88vh", overflowY: "auto" }}
          >
            <button
              className="modal-close"
              onClick={() => setShowBookingDashboard(false)}
              aria-label="Close bookings"
            >
              <X size={21} />
            </button>

            <div className="modal-body">
              <div className="eyebrow">YOUR SHARESPACE ACTIVITY</div>
              <h2 id="bookings-title">Bookings & requests.</h2>
              <p>Track items you want to borrow and manage requests for your own resources.</p>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "20px 0" }}>
                <button
                  className={`button ${bookingDashboardTab === "mine" ? "button-green" : "button-outline"}`}
                  onClick={() => setBookingDashboardTab("mine")}
                >
                  <ClipboardList size={16} /> My bookings ({myBookings.length})
                </button>
                <button
                  className={`button ${bookingDashboardTab === "received" ? "button-green" : "button-outline"}`}
                  onClick={() => setBookingDashboardTab("received")}
                >
                  <UserRound size={16} /> Received requests ({receivedBookings.length})
                </button>
                <button
                  className="button button-outline"
                  onClick={fetchBookings}
                  disabled={bookingsLoading}
                >
                  <RefreshCw size={15} /> Refresh
                </button>
              </div>

              {bookingsError && <p className="auth-error" role="alert">{bookingsError}</p>}
              {bookingsNotice && <p className="auth-success" role="status">{bookingsNotice}</p>}

              {bookingsLoading ? (
                <div className="empty-state">
                  <Clock3 size={25} />
                  <h3>Loading bookings...</h3>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {(bookingDashboardTab === "mine" ? myBookings : receivedBookings).length === 0 ? (
                    <div className="empty-state">
                      <ClipboardList size={28} />
                      <h3>
                        {bookingDashboardTab === "mine" ? "No bookings yet." : "No requests received yet."}
                      </h3>
                      <p>
                        {bookingDashboardTab === "mine"
                          ? "When you request to borrow a resource, it will appear here."
                          : "Booking requests for resources you own will appear here."}
                      </p>
                    </div>
                  ) : (
                    (bookingDashboardTab === "mine" ? myBookings : receivedBookings).map((booking) => {
                      const resource = booking.resource || {};
                      const borrower = booking.borrower || {};
                      const owner = booking.owner || {};
                      const status = booking.status || "pending";
                      const busy = bookingActionId === booking._id;

                      return (
                        <article
                          key={booking._id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(0, 1fr) auto",
                            gap: "14px",
                            alignItems: "center",
                            padding: "16px",
                            border: "1px solid #e5e1d8",
                            borderRadius: "14px",
                            background: "#fffefa",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                              <strong>{resource.title || "Resource"}</strong>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "4px 8px",
                                  borderRadius: "999px",
                                  fontSize: "0.75rem",
                                  textTransform: "capitalize",
                                  background:
                                    status === "approved" ? "#e4f3e7" :
                                    status === "rejected" ? "#f9e5e2" :
                                    status === "cancelled" ? "#eceae5" :
                                    status === "completed" ? "#e7e8f8" : "#f7efd9",
                                  color:
                                    status === "approved" ? "#23653a" :
                                    status === "rejected" ? "#9b3327" :
                                    status === "cancelled" ? "#5f5d56" :
                                    status === "completed" ? "#373a7d" : "#795c13",
                                }}
                              >
                                {status}
                              </span>
                            </div>
                            <p style={{ margin: "7px 0", fontSize: "0.9rem" }}>
                              <CalendarDays size={14} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                              {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : "—"}
                              {" → "}
                              {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : "—"}
                            </p>
                            <p style={{ margin: "4px 0", fontSize: "0.9rem" }}>
                              {bookingDashboardTab === "mine"
                                ? `Owner: ${owner.name || resource.ownerName || "Resource owner"}`
                                : `Requested by: ${borrower.name || borrower.email || "Community member"}`}
                              {" · "}
                              Total: <strong>₹{Number(booking.totalPrice || 0).toLocaleString("en-IN")}</strong>
                            </p>
                            {resource.location && (
                              <p style={{ margin: "4px 0", color: "#77756c", fontSize: "0.85rem" }}>
                                <MapPin size={13} style={{ display: "inline", verticalAlign: "middle" }} /> {resource.location}
                              </p>
                            )}
                          </div>

                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                            {bookingDashboardTab === "received" && status === "pending" && (
                              <>
                                <button
                                  className="button button-green"
                                  disabled={busy}
                                  onClick={() => updateBookingStatus(booking._id, "approved")}
                                >
                                  <Check size={15} /> {busy ? "Saving..." : "Approve"}
                                </button>
                                <button
                                  className="button button-outline"
                                  disabled={busy}
                                  onClick={() => updateBookingStatus(booking._id, "rejected")}
                                >
                                  <Ban size={15} /> Reject
                                </button>
                              </>
                            )}
                            {bookingDashboardTab === "mine" && status === "pending" && (
                              <button
                                className="button button-outline"
                                disabled={busy}
                                onClick={() => cancelBooking(booking._id)}
                              >
                                <Ban size={15} /> {busy ? "Cancelling..." : "Cancel"}
                              </button>
                            )}
                            {status === "approved" && (
                              <button
                                type="button"
                                className="button button-outline"
                                onClick={() => openMessenger(booking._id)}
                              >
                                <MessageCircle size={15} /> Chat
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resource details modal */}
      {selectedItem && !showAuth && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedItem(null)}
          role="presentation"
        >
          <div
            className="item-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedItem(null)}
              aria-label="Close details"
            >
              <X size={21} />
            </button>

            <img
              className="modal-image"
              src={selectedItem.imageUrl || placeholderImage}
              alt={selectedItem.title}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = placeholderImage;
              }}
            />

            <div className="modal-body">
              <div className="resource-meta">
                <span>{selectedItem.category}</span>
              </div>
              <h2 id="modal-title">{selectedItem.title}</h2>
              <p className="modal-location">
                <MapPin size={15} />
                {selectedItem.location}
              </p>

              {selectedItem.description && <p>{selectedItem.description}</p>}

              <div className="modal-owner">
                <span className="owner-avatar">
                  {getInitials(selectedItem.ownerName)}
                </span>
                <div>
                  <strong>{selectedItem.ownerName}</strong>
                  <span>Community member</span>
                </div>
              </div>

              <div className="modal-price">
                <strong>
                  ₹{Number(selectedItem.pricePerDay || 0).toLocaleString("en-IN")}
                </strong>
                <span>per day</span>
              </div>

              <div
                className="booking-date-fields"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "12px",
                  margin: "18px 0",
                }}
              >
                <label style={{ display: "grid", gap: "6px", fontSize: "0.9rem" }}>
                  <span>Start date</span>
                  <input
                    type="date"
                    min={toLocalDateInput(new Date())}
                    value={bookingStartDate}
                    onChange={(event) => {
                      setBookingStartDate(event.target.value);
                      setBookingMessage("");
                    }}
                    style={{
                      width: "100%",
                      padding: "11px",
                      border: "1px solid #d8d5cd",
                      borderRadius: "10px",
                      background: "#fff",
                      color: "#24251f",
                    }}
                  />
                </label>
                <label style={{ display: "grid", gap: "6px", fontSize: "0.9rem" }}>
                  <span>End date</span>
                  <input
                    type="date"
                    min={bookingStartDate || toLocalDateInput(new Date())}
                    value={bookingEndDate}
                    onChange={(event) => {
                      setBookingEndDate(event.target.value);
                      setBookingMessage("");
                    }}
                    style={{
                      width: "100%",
                      padding: "11px",
                      border: "1px solid #d8d5cd",
                      borderRadius: "10px",
                      background: "#fff",
                      color: "#24251f",
                    }}
                  />
                </label>
              </div>

              {bookingStartDate && bookingEndDate && bookingEndDate > bookingStartDate && (
                <p style={{ margin: "0 0 14px", fontSize: "0.9rem" }}>
                  Estimated total:{" "}
                  <strong>
                    ₹{(
                      Math.round(
                        (new Date(`${bookingEndDate}T00:00:00`) -
                          new Date(`${bookingStartDate}T00:00:00`)) /
                          (1000 * 60 * 60 * 24)
                      ) * Number(selectedItem.pricePerDay || 0)
                    ).toLocaleString("en-IN")}
                  </strong>
                </p>
              )}

              {bookingMessage && (
                <p className="booking-message" role="status">
                  {bookingMessage}
                </p>
              )}

              <button
                className="button button-green modal-book"
                onClick={handleBooking}
                disabled={selectedItem.isAvailable === false || bookingLoading}
              >
                {bookingLoading
                  ? "Submitting request..."
                  : selectedItem.isAvailable === false
                    ? "Currently unavailable"
                    : "Request to borrow"}
                {!bookingLoading && <ArrowUpRight size={17} />}
              </button>
            </div>
          </div>
        </div>
      )}
      {showAdminDashboard && user?.role === "admin" && (
        <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
      )}
      {showMessenger && user && (
        <Messenger
          user={user}
          initialBookingId={initialChatBookingId}
          onClose={() => {
            setShowMessenger(false);
            setInitialChatBookingId(null);
          }}
        />
      )}
    </div>
  );
}

export default App;