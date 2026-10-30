import { useState, useEffect } from "react";
import api from "./services/api";
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
} from "lucide-react";
import "./index.css";

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
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [bookingMessage, setBookingMessage] = useState("");

  // Fetch resources from the Express API.
  const fetchResources = async () => {
    try {
      setLoading(true);
      setApiError("");

      const response = await api.get("/resources");

      setResources(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch ShareSpace resources:", error);

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

  // Filter database resources by search, category and favourites.
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

  const handleBooking = () => {
    setBookingMessage(
      "Booking requests are not connected yet. The next step is implementing login and the booking API."
    );
  };

  const resetFilters = () => {
    setActiveCategory("All items");
    setSearch("");
    setShowFavorites(false);
  };

  return (
    <div className="app-shell">
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

          <button
            className="button button-dark nav-cta"
            onClick={() =>
              document
                .getElementById("how-it-works")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Start sharing <ArrowUpRight size={16} />
          </button>

          <button
            className="icon-button mobile-menu-button"
            onClick={() => setMobileMenu((current) => !current)}
            aria-label="Toggle menu"
          >
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main>
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
                <span className="caption-label">
                  MORE THAN THINGS
                </span>
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
            <span className="stat-number">
              01<span>.</span>
            </span>
            <span className="stat-label">Find what you need</span>
          </div>

          <div className="stat-item">
            <span className="stat-number">
              02<span>.</span>
            </span>
            <span className="stat-label">Borrow with ease</span>
          </div>

          <div className="stat-item">
            <span className="stat-number">
              03<span>.</span>
            </span>
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
              <div className="eyebrow">
                THE COMMUNITY COLLECTION
              </div>

              <h2>
                Find your{" "}
                <span className="serif-text">
                  next useful thing.
                </span>
              </h2>

              <p>
                Good stuff, shared by people right around you.
              </p>
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
              onClick={() =>
                setShowFavorites((current) => !current)
              }
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
                  onClick={() =>
                    setActiveCategory(category.name)
                  }
                >
                  <Icon size={16} />
                  {category.name}
                </button>
              );
            })}
          </div>

          <div className="results-label">
            <span>
              {showFavorites
                ? "YOUR SAVED ITEMS"
                : "PICKED FOR CAMPUS"}
            </span>

            <span>
              {loading
                ? "Loading..."
                : `${filteredResources.length} items`}
            </span>
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

              <button
                className="button button-green"
                onClick={fetchResources}
              >
                Try again
              </button>
            </div>
          ) : filteredResources.length > 0 ? (
            <div className="resource-grid">
              {filteredResources.map((item) => {
                const initials = getInitials(item.ownerName);
                const isFavorite = favorites.includes(item._id);

                return (
                  <article
                    className="resource-card"
                    key={item._id}
                  >
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
                        Available
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
                          <span className="owner-avatar">
                            {initials}
                          </span>

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
                {showFavorites
                  ? "No saved items yet."
                  : "Nothing found just yet."}
              </h3>

              <p>
                {showFavorites
                  ? "Tap the heart on any resource to save it here."
                  : resources.length === 0
                    ? "Be the first to share a resource with your community."
                    : "Try another search or explore a different category."}
              </p>

              <button
                className="button button-green"
                onClick={resetFilters}
              >
                {showFavorites ? "Explore resources" : "Clear filters"}
              </button>
            </div>
          )}
        </section>

        <section className="how-section" id="how-it-works">
          <div className="how-heading">
            <div className="eyebrow">SIMPLE BY DESIGN</div>

            <h2>
              Sharing should feel{" "}
              <span className="serif-text">this easy.</span>
            </h2>

            <p>
              Less buying. More borrowing. Better campus days.
            </p>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <span className="step-number">01 / DISCOVER</span>
              <div className="step-icon">
                <Search size={24} />
              </div>
              <h3>Find your thing.</h3>
              <p>
                Search resources shared by people in your campus
                community.
              </p>
            </article>

            <article className="step-card">
              <span className="step-number">02 / REQUEST</span>
              <div className="step-icon">
                <Clock3 size={24} />
              </div>
              <h3>Make it yours.</h3>
              <p>
                Choose what you need, pick your dates, and send a
                booking request.
              </p>
            </article>

            <article className="step-card">
              <span className="step-number">03 / SHARE</span>
              <div className="step-icon">
                <Heart size={24} />
              </div>
              <h3>Pass it forward.</h3>
              <p>
                Borrow something useful or earn from the things you
                already own.
              </p>
            </article>
          </div>
        </section>

        <section className="share-banner">
          <div className="banner-decoration">✳</div>

          <div>
            <div className="eyebrow">
              HAVE SOMETHING TO SHARE?
            </div>

            <h2>
              Someone nearby might{" "}
              <span className="serif-text">need it.</span>
            </h2>

            <p>
              Turn things you don't use every day into something useful
              for someone else.
            </p>
          </div>

          <button
            className="button button-light"
            onClick={() =>
              alert(
                "Resource listing is the next feature we will connect to the backend."
              )
            }
          >
            <Plus size={18} />
            List your resource
          </button>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#">
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

        <p>A little more sharing. A little less spending.</p>

        <span className="footer-copy">
          © 2026 ShareSpace · Made for campus life.
        </span>
      </footer>

      {selectedItem && (
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

              {selectedItem.description && (
                <p>{selectedItem.description}</p>
              )}

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

              <p className="modal-disclaimer">
                Booking requests are not submitted yet. Account
                authentication and the booking API must be connected
                first.
              </p>

              {bookingMessage && (
                <p className="booking-message" role="status">
                  {bookingMessage}
                </p>
              )}

              <button
                className="button button-green modal-book"
                onClick={handleBooking}
              >
                Request to borrow <ArrowUpRight size={17} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
