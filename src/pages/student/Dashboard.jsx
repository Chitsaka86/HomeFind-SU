import { useEffect, useState } from "react";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  HomeModernIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { fetchProperties } from "../../services/propertyServices";
import { fetchStudentDashboard } from "../../services/studentDashboardService";
import MyBookings from "./MyBookings";
import SavedProperties from "./SavedProperties";
import StudentProfile from "./StudentProfile";
import PropertyDetails from "./PropertyDetails";

const C = {
  bg: "#F5F5F0",
  surface: "#FFFFFF",
  border: "#E0E0D8",
  borderMid: "#CCCCCC",
  text: "#1A1A1A",
  textSec: "#6B6B65",
  textTer: "#9B9B95",
  blue: "#185FA5",
  blueTint: "#E6F1FB",
  blueBorder: "#B5D4F4",
  green: "#3B6D11",
  greenTint: "#EAF3DE",
  greenBorder: "#A0C878",
  warning: "#BA7517",
  warnTint: "#FAEEDA",
  warnBorder: "#ECC07A",
  danger: "#E24B4A",
  dangerTint: "#FCEBEB",
  star: "#EF9F27",
};

const Badge = ({ variant = "success", children }) => {
  const styles = {
    success: { background: C.greenTint, color: C.green, border: `1px solid ${C.greenBorder}` },
    warning: { background: C.warnTint, color: C.warning, border: `1px solid ${C.warnBorder}` },
    info: { background: C.blueTint, color: C.blue, border: `1px solid ${C.blueBorder}` },
    neutral: { background: "#F0F0E8", color: C.textSec, border: `1px solid ${C.border}` },
  };

  return (
    <span
      style={{
        ...styles[variant],
        fontSize: 10,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 9999,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
};

const SEARCH_RESULT_LIMIT = 6;

async function searchLocations(query, signal) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=${SEARCH_RESULT_LIMIT}&q=${encodeURIComponent(query)}`,
    {
      signal,
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Unable to load location suggestions.");
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

const Stars = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <span style={{ color: C.star, fontSize: 13, letterSpacing: 1 }}>
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(empty)}
    </span>
  );
};

const Navbar = ({ activePage, setPage, userName }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "bookings", label: "My bookings" },
    { id: "saved", label: "Saved" },
    { id: "profile", label: "Profile" },
  ];

  return (
    <nav
      style={{
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        padding: "0 24px",
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: C.blue,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HomeIcon style={{ width: 16, height: 16, color: "#fff" }} />
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>HomeFind SU</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              background: activePage === item.id ? C.blueTint : "transparent",
              color: activePage === item.id ? C.blue : C.textSec,
              border: "none",
              borderRadius: 6,
              padding: "5px 12px",
              fontSize: 13,
              fontWeight: activePage === item.id ? 600 : 400,
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: C.blueTint,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: C.blue,
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {userName.split(" ").map((word) => word[0]).join("").slice(0, 2)}
      </div>
    </nav>
  );
};

const FilterSidebar = ({ filters, setFilters }) => {
  const amenityList = ["WiFi", "24hr water", "Caretaker", "Parking", "CCTV", "Backup power", "Laundry area", "Balcony", "Furnished rooms", "Elevator", "Gym", "Swimming pool"];

  const toggle = (key, value) =>
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: currentFilters[key].includes(value)
        ? currentFilters[key].filter((item) => item !== value)
        : [...currentFilters[key], value],
    }));

  return (
    <aside
      style={{
        width: 180,
        flexShrink: 0,
        borderRight: `1px solid ${C.border}`,
        padding: "16px 14px",
        background: "#FAFAF8",
      }}
    >
      <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: "0 0 14px" }}>Filters</p>

      <p style={{ fontSize: 10, color: C.textSec, margin: "0 0 6px" }}>Price range (KSh)</p>
      <input
        type="range"
        min={5000}
        max={100000}
        step={500}
        value={filters.maxPrice}
        onChange={(event) => setFilters((currentFilters) => ({ ...currentFilters, maxPrice: +event.target.value }))}
        style={{ width: "100%", accentColor: C.blue, marginBottom: 4 }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 10, color: C.textTer }}>5k</span>
        <span style={{ fontSize: 10, color: C.blue, fontWeight: 600 }}>
          {(filters.maxPrice / 1000).toFixed(0)}k
        </span>
        <span style={{ fontSize: 10, color: C.textTer }}>100k</span>
      </div>

      <p style={{ fontSize: 10, color: C.textSec, margin: "0 0 8px" }}>Amenities</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
        {amenityList.map((amenity) => (
          <label
            key={amenity}
            style={{
              fontSize: 11,
              color: C.text,
              display: "flex",
              alignItems: "center",
              gap: 7,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: 13,
                height: 13,
                borderRadius: 3,
                flexShrink: 0,
                border: `1.5px solid ${filters.amenities.includes(amenity) ? C.blue : C.borderMid}`,
                background: filters.amenities.includes(amenity) ? C.blueTint : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => toggle("amenities", amenity)}
            >
              {filters.amenities.includes(amenity) && (
                <span style={{ fontSize: 8, color: C.blue, fontWeight: 900 }}>✓</span>
              )}
            </span>
            {amenity}
          </label>
        ))}
      </div>

      <p style={{ fontSize: 10, color: C.textSec, margin: "0 0 8px" }}>Status</p>
      {["Available", "Booked"].map((status) => (
        <label
          key={status}
          style={{
            fontSize: 11,
            color: C.text,
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 6,
            cursor: "pointer",
          }}
        >
          <span
            style={{
              width: 13,
              height: 13,
              borderRadius: "50%",
              flexShrink: 0,
              border: `1.5px solid ${filters.status.includes(status) ? C.green : C.borderMid}`,
              background: filters.status.includes(status) ? C.greenTint : "#fff",
            }}
            onClick={() => toggle("status", status)}
          />
          {status}
        </label>
      ))}
    </aside>
  );
};

const PropertyCard = ({ property, onView }) => (
  <div
    style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      transition: "box-shadow 0.18s",
    }}
    onMouseEnter={(event) => (event.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)")}
    onMouseLeave={(event) => (event.currentTarget.style.boxShadow = "none")}
  >
    <div
      style={{
        height: 110,
        background: "linear-gradient(135deg, #E6F1FB 0%, #D0E8F8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 36,
        position: "relative",
      }}
    >
      <HomeModernIcon style={{ width: 34, height: 34, color: C.blue }} />
      <div style={{ position: "absolute", bottom: 8, right: 8 }}>
        <Badge variant={property.status === "Available" ? "success" : "warning"}>{property.status}</Badge>
      </div>
    </div>

    <div style={{ padding: "10px 12px", flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontSize: 12, fontWeight: 700, margin: "0 0 3px", color: C.text }}>{property.title}</p>
      <p style={{ fontSize: 11, color: C.textSec, margin: "0 0 4px" }}>
        <MapPinIcon style={{ width: 12, height: 12, display: "inline-block", marginRight: 4, verticalAlign: "-2px" }} />
        {property.location} · {property.distance} km
      </p>
      <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>
        KSh {property.price.toLocaleString()}
        <span style={{ fontSize: 10, fontWeight: 400, color: C.textSec }}>/mo</span>
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
        <Stars rating={property.rating} />
        <span style={{ fontSize: 10, color: C.textSec }}>{property.rating} ({property.reviews})</span>
      </div>
      <button
        onClick={() => onView(property)}
        style={{
          marginTop: "auto",
          background: C.text,
          color: "#fff",
          border: "none",
          borderRadius: 7,
          padding: "7px 0",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          width: "100%",
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(event) => (event.currentTarget.style.opacity = "0.85")}
        onMouseLeave={(event) => (event.currentTarget.style.opacity = "1")}
      >
        View details
      </button>
    </div>
  </div>
);

const DashboardPage = ({ onView, properties, loading, error }) => {
  const [search, setSearch] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [filters, setFilters] = useState({ maxPrice: 100000, amenities: [], status: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState("");
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const searchQuery = search.trim();
  const searchLocationQuery = searchQuery.toLowerCase().split(",")[0].trim();

  const filteredProperties = properties.filter((property) => {
    if (
      search &&
      !property.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !property.location.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!searchLocationQuery ||
        (!property.title.toLowerCase().includes(searchLocationQuery) &&
          !property.location.toLowerCase().includes(searchLocationQuery)))
    ) {
      return false;
    }

    if (maxPriceInput && property.price > Number(maxPriceInput)) {
      return false;
    }

    if (property.price > filters.maxPrice) {
      return false;
    }

    if (filters.amenities.length > 0 && !filters.amenities.every((amenity) => property.amenities.includes(amenity))) {
      return false;
    }

    if (filters.status.length > 0 && !filters.status.includes(property.status)) {
      return false;
    }

    return true;
  });

  useEffect(() => {
    if (!showSuggestions || searchQuery.length < 2) {
      setLocationSuggestions([]);
      setSuggestionsError("");
      setSuggestionsLoading(false);
      setActiveSuggestionIndex(-1);
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setSuggestionsLoading(true);
        setSuggestionsError("");

        const suggestions = await searchLocations(searchQuery, controller.signal);
        if (!controller.signal.aborted) {
          setLocationSuggestions(
            suggestions.map((item) => ({
              label: item.display_name,
              latitude: item.lat,
              longitude: item.lon,
            }))
          );
          setActiveSuggestionIndex(suggestions.length > 0 ? 0 : -1);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setLocationSuggestions([]);
          setSuggestionsError(error instanceof Error ? error.message : "Unable to load location suggestions.");
          setActiveSuggestionIndex(-1);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSuggestionsLoading(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery, showSuggestions]);

  useEffect(() => {
    if (locationSuggestions.length === 0) {
      setActiveSuggestionIndex(-1);
      return;
    }

    setActiveSuggestionIndex((currentIndex) => {
      if (currentIndex < 0) {
        return 0;
      }

      return Math.min(currentIndex, locationSuggestions.length - 1);
    });
  }, [locationSuggestions]);

  const commitSuggestion = (suggestion) => {
    setSearch(suggestion.label);
    setShowSuggestions(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div
        style={{
          background: "#F5F5F0",
          borderBottom: `1px solid ${C.border}`,
          padding: "10px 20px",
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: 2,
            minWidth: 160,
            position: "relative",
            display: "flex",
            alignItems: "center",
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "0 10px",
            height: 36,
            background: "#fff",
            gap: 7,
          }}
        >
          <MapPinIcon style={{ width: 14, height: 14, color: C.textTer, flexShrink: 0 }} />
          <input
            placeholder="Location (e.g. Kilimani)"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setSuggestionsError("");
              setActiveSuggestionIndex(-1);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              window.setTimeout(() => setShowSuggestions(false), 150);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                setShowSuggestions(false);
                return;
              }

              if (!showSuggestions || locationSuggestions.length === 0) {
                return;
              }

              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveSuggestionIndex((currentIndex) =>
                  currentIndex < 0 ? 0 : (currentIndex + 1) % locationSuggestions.length
                );
                return;
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveSuggestionIndex((currentIndex) =>
                  currentIndex <= 0 ? locationSuggestions.length - 1 : currentIndex - 1
                );
                return;
              }

              if (event.key === "Enter" && activeSuggestionIndex >= 0) {
                event.preventDefault();
                const suggestion = locationSuggestions[activeSuggestionIndex];
                if (suggestion) {
                  commitSuggestion(suggestion);
                }
              }
            }}
            style={{
              border: "none",
              outline: "none",
              fontSize: 12,
              flex: 1,
              background: "transparent",
              fontFamily: "inherit",
              color: C.text,
            }}
          />
          {showSuggestions && searchQuery.length >= 2 && (locationSuggestions.length > 0 || suggestionsLoading || suggestionsError) && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                right: 0,
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                boxShadow: "0 16px 36px rgba(0,0,0,0.12)",
                zIndex: 20,
                overflow: "hidden",
              }}
            >
              {suggestionsLoading ? (
                <div style={{ padding: "10px 12px", fontSize: 12, color: C.textSec }}>Searching locations...</div>
              ) : suggestionsError ? (
                <div style={{ padding: "10px 12px", fontSize: 12, color: C.warning }}>{suggestionsError}</div>
              ) : (
                locationSuggestions.map((prediction, index) => (
                  <button
                    key={`${prediction.label}-${prediction.latitude}-${prediction.longitude}`}
                    type="button"
                    onMouseEnter={() => setActiveSuggestionIndex(index)}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      commitSuggestion(prediction);
                    }}
                    style={{
                      width: "100%",
                      border: "none",
                      background: activeSuggestionIndex === index ? C.blueTint : "#fff",
                      padding: "10px 12px",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    <MapPinIcon style={{ width: 14, height: 14, color: C.textSec, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: C.text }}>{prediction.label}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 120,
            display: "flex",
            alignItems: "center",
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "0 10px",
            height: 36,
            background: "#fff",
            gap: 7,
          }}
        >
          <span style={{ color: C.textTer, fontSize: 13 }}>KSh</span>
          <input
            placeholder="Max price"
            type="number"
            value={maxPriceInput}
            onChange={(event) => setMaxPriceInput(event.target.value)}
            style={{
              border: "none",
              outline: "none",
              fontSize: 12,
              flex: 1,
              background: "transparent",
              fontFamily: "inherit",
              color: C.text,
            }}
          />
        </div>
        <button
          style={{
            background: C.text,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            height: 36,
            padding: "0 20px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(event) => (event.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(event) => (event.currentTarget.style.opacity = "1")}
        >
          Search
        </button>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        <FilterSidebar filters={filters} setFilters={setFilters} />
        <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontSize: 13, color: C.textSec, margin: 0 }}>
              <strong style={{ color: C.text }}>{loading ? 0 : filteredProperties.length}</strong> properties found
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: C.textSec }}>
              <ArrowPathIcon style={{ width: 40, height: 40, marginBottom: 12, color: C.textSec, animation: "spin 1s linear infinite" }} />
              <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: C.text }}>Loading properties</p>
              <p style={{ fontSize: 12, margin: 0 }}>Fetching listings from the database.</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: C.textSec }}>
              <ExclamationTriangleIcon style={{ width: 40, height: 40, marginBottom: 12, color: C.warning }} />
              <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: C.text }}>Could not load properties</p>
              <p style={{ fontSize: 12, margin: 0 }}>{error}</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: C.textSec }}>
              <MagnifyingGlassIcon style={{ width: 40, height: 40, marginBottom: 12, color: C.textSec }} />
              <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: C.text }}>No properties found</p>
              <p style={{ fontSize: 12, margin: 0 }}>Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 14,
              }}
            >
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} onView={onView} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function StudentDashboard() {
  const [page, setPage] = useState("dashboard");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentData, setStudentData] = useState({ student: null, bookings: [], savedProperties: [] });
  const [studentLoading, setStudentLoading] = useState(true);
  const [studentError, setStudentError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadProperties = async () => {
      try {
        setLoading(true);
        setError("");
        const items = await fetchProperties();
        if (isActive) {
          setProperties(items);
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load properties.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadProperties();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadStudentDashboard = async () => {
      try {
        setStudentLoading(true);
        setStudentError("");
        const data = await fetchStudentDashboard();
        if (isActive) {
          setStudentData({
            student: data.student || null,
            bookings: Array.isArray(data.bookings) ? data.bookings : [],
            savedProperties: Array.isArray(data.savedProperties) ? data.savedProperties : [],
          });
        }
      } catch (loadError) {
        if (isActive) {
          setStudentError(loadError instanceof Error ? loadError.message : "Unable to load student dashboard data.");
        }
      } finally {
        if (isActive) {
          setStudentLoading(false);
        }
      }
    };

    loadStudentDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  const currentStudentName = studentData.student?.fullName || "Student";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "'Inter', system-ui, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar activePage={page} setPage={setPage} userName={currentStudentName} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {page === "dashboard" && (
          <DashboardPage onView={(property) => setSelectedProperty(property)} properties={properties} loading={loading} error={error} />
        )}
        {page === "bookings" && <MyBookings bookings={studentData.bookings} loading={studentLoading} error={studentError} />}
        {page === "saved" && <SavedProperties onView={(property) => setSelectedProperty(property)} savedProperties={studentData.savedProperties} loading={studentLoading} error={studentError} />}
        {page === "profile" && <StudentProfile setPage={setPage} student={studentData.student} loading={studentLoading} error={studentError} />}
      </div>

      {selectedProperty && <PropertyDetails property={selectedProperty} onClose={() => setSelectedProperty(null)} />}
    </div>
  );
}
