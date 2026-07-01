import { useEffect, useMemo, useState } from "react";
import {
  UserCircleIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  CurrencyDollarIcon,
  HomeModernIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  HandRaisedIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import AddProperty from "./AddProperty";
import EditProperty from "./EditProperty";
import PropertyRequests from "./PropertyRequests";
import { Badge, C } from "./landlordTheme";
import { deleteProperty, fetchLandlordDashboard } from "../../services/landlordDashboardService";

function StatCard({ label, value, icon, tone = "text" }) {
  const colors = {
    text: { bg: C.blueTint, color: C.blue },
    warning: { bg: C.warnTint, color: C.warning },
    green: { bg: C.greenTint, color: C.green },
  };

  return (
    <div style={{ 
      background: C.surface, 
      border: `1px solid ${C.border}`, 
      borderRadius: 12, 
      padding: 16,
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: colors[tone]?.bg || C.blueTint,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: colors[tone]?.color || C.blue,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: "0 0 2px", fontSize: 11, color: C.textSec }}>{label}</p>
        <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{
      textAlign: "center",
      padding: "40px 20px",
      color: C.textSec,
    }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: C.blueTint,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 12px",
        color: C.blue,
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: "0 0 4px" }}>{title}</h3>
      <p style={{ fontSize: 12, margin: "0 0 16px", color: C.textSec }}>{description}</p>
      {action}
    </div>
  );
}

function LandlordDashboard() {
  const [page, setPage] = useState("dashboard");
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [landlord, setLandlord] = useState(null);
  const [stats, setStats] = useState({ totalProperties: 0, pendingApprovals: 0, confirmedBookings: 0 });
  const [editingProperty, setEditingProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({ fullName: "", phone: "", email: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const reloadDashboard = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (!userData.email) {
        setError("No email found. Please log in again.");
        return;
      }
      const data = await fetchLandlordDashboard(userData.email);
      setLandlord(data.landlord);
      setStats(data.stats);
      setRecentListings(data.recentListings);
      setProperties(data.properties);
      setBookings(data.bookings);
    } catch (error) {
      console.error('Error reloading dashboard:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('Loading landlord dashboard for:', userData.email);
        
        if (!userData.email) {
          setError("No email found. Please log in again.");
          setLoading(false);
          return;
        }
        
        const data = await fetchLandlordDashboard(userData.email);

        if (!isMounted) {
          return;
        }

        setLandlord(data.landlord);
        setStats(data.stats);
        setRecentListings(data.recentListings);
        setProperties(data.properties);
        setBookings(data.bookings);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        console.error('Error loading dashboard:', loadError);
        setError(loadError instanceof Error ? loadError.message : "Unable to load landlord dashboard data right now.");
        setLandlord(null);
        setStats({ totalProperties: 0, pendingApprovals: 0, confirmedBookings: 0 });
        setRecentListings([]);
        setProperties([]);
        setBookings([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveNew = async (form) => {
    await reloadDashboard();
    setPage("listings");
  };

  const handleSaveEdit = form => {
    setProperties(current => current.map(property => (property.id === form.id ? { ...property, ...form } : property)));
  };

  
  const handleDelete = async (id) => {
    
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }
    
    setDeletingId(id);
    try {
      console.log(`Deleting property ${id}...`);
      
      
      await deleteProperty(id);
      
      
      setProperties(current => current.filter(property => property.id !== id));
      setEditingProperty(null);
      setPage("listings");
      
      
      alert('Property deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting property:', error);
      alert(error.message || 'Failed to delete property. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBookingUpdate = (id, status) => {
    setBookings(current => current.map(booking => (booking.id === id ? { ...booking, status } : booking)));
  };

  
  const openEditProfile = () => {
    if (landlord) {
      setEditProfileData({
        fullName: landlord.fullName || "",
        phone: landlord.phone || "",
        email: landlord.email || "",
      });
      setShowEditProfile(true);
      setProfileError("");
      setProfileSuccess(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess(false);

    try {
  
      setLandlord(prev => ({
        ...prev,
        fullName: editProfileData.fullName,
        phone: editProfileData.phone,
      }));
      
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.name = editProfileData.fullName;
      localStorage.setItem('user', JSON.stringify(userData));

      setProfileSuccess(true);
      setTimeout(() => {
        setShowEditProfile(false);
        setProfileSuccess(false);
      }, 1500);
    } catch (err) {
      setProfileError(err.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || property.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalProperties = stats.totalProperties;
  const pendingProperties = stats.pendingApprovals;
  const confirmedBookings = stats.confirmedBookings;
  const availableProperties = totalProperties - pendingProperties - confirmedBookings;

  const profileInitials = useMemo(() => {
    if (landlord?.fullName) {
      return landlord.fullName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
    }
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.name) {
      return userData.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
    }
    return "LM";
  }, [landlord]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "Inter, system-ui, Arial, sans-serif" }}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={brandIconStyle}>
            <HomeIcon style={{ width: 16, height: 16, color: "#fff" }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>HomeFind SU</div>
            <Badge variant="warning">Landlord</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <nav style={{ ...navStyle, marginRight: 6 }}>
            {[
              ["dashboard", "Dashboard"],
              ["listings", "Listings"],
              ["requests", "Requests"],
              ["add", "+ Add"],
              ["profile", "Profile"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() => {
                  setEditingProperty(null);
                  setPage(value);
                }}
                style={navButtonStyle(page === value, value === "add")}
              >
                {label}
              </button>
            ))}
          </nav>

          <div style={avatarStyle}>
            {profileInitials}
          </div>
        </div>
      </header>

      <main style={{ padding: "20px 28px", maxWidth: 1200, margin: "0 auto" }}>
        {loading ? (
          <section style={panelStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 30 }}>
              <div style={{ 
                width: 24, 
                height: 24, 
                border: `2px solid ${C.border}`,
                borderTop: `2px solid ${C.blue}`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginRight: 10,
              }} />
              <p style={{ margin: 0, color: C.textSec, fontSize: 12 }}>Loading dashboard...</p>
            </div>
          </section>
        ) : null}

        {error ? (
          <section style={{ ...panelStyle, borderColor: C.danger }}>
            <div style={{ textAlign: "center", padding: 16 }}>
              <p style={{ margin: 0, color: C.danger, fontWeight: 600, fontSize: 13 }}>{error}</p>
              <button 
                onClick={() => {
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
                style={{ 
                  marginTop: 10, 
                  padding: "6px 20px", 
                  background: C.blue, 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: 5, 
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                Go to Login
              </button>
            </div>
          </section>
        ) : null}

        {!loading && !error && page === "dashboard" ? (
          <div style={{ display: "grid", gap: 18 }}>
            {/* Welcome Message */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: C.blueTint,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: C.blue,
                }}>
                  <HandRaisedIcon style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <h1 style={{ 
                    margin: 0, 
                    fontSize: 18, 
                    fontWeight: 700, 
                    color: C.text 
                  }}>
                    Welcome back, {landlord?.fullName || "Landlord"}!
                  </h1>
                  <p style={{ 
                    margin: "2px 0 0", 
                    fontSize: 12, 
                    color: C.textSec 
                  }}>
                    Here's what's happening with your properties today
                  </p>
                </div>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <span style={{
                  background: C.blueTint,
                  color: C.blue,
                  padding: "3px 10px",
                  borderRadius: 9999,
                  fontSize: 10,
                  fontWeight: 600,
                }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              <StatCard 
                label="Total Properties" 
                value={totalProperties} 
                icon={<BuildingOffice2Icon style={{ width: 20, height: 20 }} />}
                tone="text"
              />
              <StatCard 
                label="Pending Approvals" 
                value={pendingProperties} 
                icon={<ClipboardDocumentListIcon style={{ width: 20, height: 20 }} />}
                tone="warning"
              />
              <StatCard 
                label="Confirmed Bookings" 
                value={confirmedBookings} 
                icon={<HomeModernIcon style={{ width: 20, height: 20 }} />}
                tone="green"
              />
              <StatCard 
                label="Available Properties" 
                value={availableProperties} 
                icon={<BuildingOffice2Icon style={{ width: 20, height: 20 }} />}
                tone="text"
              />
            </div>

            {/* Status Distribution */}
            <div style={panelStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text }}>Property Status</h3>
                <span style={{ fontSize: 10, color: C.textSec }}>{totalProperties} total</span>
              </div>
              <div style={{ display: "flex", gap: 3, height: 6, borderRadius: 3, overflow: "hidden", background: C.border }}>
                {totalProperties > 0 && (
                  <>
                    <div style={{ 
                      flex: pendingProperties / totalProperties, 
                      background: C.warning,
                      borderRadius: pendingProperties > 0 ? "3px 0 0 3px" : "0",
                    }} />
                    <div style={{ 
                      flex: confirmedBookings / totalProperties, 
                      background: C.green,
                    }} />
                    <div style={{ 
                      flex: availableProperties / totalProperties, 
                      background: C.blue,
                      borderRadius: availableProperties > 0 ? "0 3px 3px 0" : "0",
                    }} />
                  </>
                )}
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.warning }} />
                  <span style={{ fontSize: 10, color: C.textSec }}>Pending ({pendingProperties})</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
                  <span style={{ fontSize: 10, color: C.textSec }}>Booked ({confirmedBookings})</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.blue }} />
                  <span style={{ fontSize: 10, color: C.textSec }}>Available ({availableProperties})</span>
                </div>
              </div>
            </div>

            {/* Recent Listings */}
            <section style={panelStyle}>
              <div style={sectionHeaderStyle}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#000000' }}>Recent listings</h2>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: '#000000' }}>Your most recent property listings</p>
                </div>
                <button type="button" onClick={() => setPage("listings")} style={linkButtonStyle}>View all →</button>
              </div>
              {recentListings.length > 0 ? (
                <div style={{ display: "grid", gap: 8 }}>
                  {recentListings.map(property => (
                    <div key={property.id} style={rowStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          background: C.blueTint,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: C.blue,
                          flexShrink: 0,
                        }}>
                          <BuildingOffice2Icon style={{ width: 16, height: 16 }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 12, color: '#000000' }}>{property.title}</div>
                          <div style={{ color: '#000000', fontSize: 10 }}>
                            <MapPinIcon style={{ width: 10, height: 10, display: "inline", marginRight: 3 }} />
                            {property.location} · KSh {Number(property.price).toLocaleString()}/mo
                          </div>
                        </div>
                      </div>
                      <Badge variant={property.status === "pending" ? "pending" : property.status === "booked" ? "info" : "success"}>
                        {property.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={<BuildingOffice2Icon style={{ width: 24, height: 24 }} />}
                  title="No listings yet"
                  description="Start by adding your first property listing."
                  action={
                    <button 
                      onClick={() => setPage("add")} 
                      style={{
                        padding: "6px 16px",
                        background: C.text,
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    >
                      + Add Property
                    </button>
                  }
                />
              )}
            </section>

            {/* Recent Activity */}
            <section style={panelStyle}>
              <div style={sectionHeaderStyle}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#000000' }}>Recent Activity</h2>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: '#000000' }}>Latest updates on your properties</p>
                </div>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {properties.length > 0 ? (
                  properties.slice(0, 3).map((property, index) => (
                    <div key={index} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      background: "#FAFAF8",
                      borderRadius: 8,
                      border: `1px solid ${C.border}`,
                    }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: property.status === "pending" ? C.warnTint : C.greenTint,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: property.status === "pending" ? C.warning : C.green,
                      }}>
                        {property.status === "pending" ? (
                          <ClockIcon style={{ width: 16, height: 16 }} />
                        ) : (
                          <CheckCircleIcon style={{ width: 16, height: 16 }} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 12, color: '#000000' }}>{property.title}</div>
                        <div style={{ fontSize: 10, color: '#000000' }}>
                          {property.status === "pending" 
                            ? "Submitted for approval" 
                            : property.status === "booked" 
                            ? "Booking confirmed" 
                            : "Property active"}
                        </div>
                      </div>
                      <span style={{ fontSize: 9, color: '#000000' }}>
                        {new Date(property.created_at || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#000000', textAlign: "center", padding: "16px 0", fontSize: 12 }}>
                    No recent activity
                  </p>
                )}
              </div>
            </section>
          </div>
        ) : null}

        {!loading && !error && page === "listings" ? (
          <section style={panelStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>My listings</h2>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: C.textSec }}>Review, edit, or delete your properties</p>
              </div>
              <button type="button" onClick={() => setPage("add")} style={primaryActionButton}>
                <PlusIcon style={{ width: 14, height: 14, marginRight: 4 }} />
                Add property
              </button>
            </div>

            {/* Search and Filter */}
            <div style={{
              display: "flex",
              gap: 8,
              marginBottom: 12,
              flexWrap: "wrap",
            }}>
              <div style={{
                flex: 1,
                minWidth: 160,
                display: "flex",
                alignItems: "center",
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                padding: "0 10px",
                background: "#fff",
              }}>
                <MagnifyingGlassIcon style={{ width: 14, height: 14, color: C.textTer }} />
                <input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    padding: "8px 10px",
                    fontSize: 11,
                    width: "100%",
                    background: "transparent",
                  }}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  fontSize: 11,
                  background: "#fff",
                  outline: "none",
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="available">Available</option>
                <option value="booked">Booked</option>
              </select>
            </div>

            {filteredProperties.length > 0 ? (
              <div style={{ display: "grid", gap: 8 }}>
                {filteredProperties.map(property => {
                  const firstImage = property.images && property.images.length > 0 
                    ? property.images[0].url 
                    : null;
                  
                  const isValidImage = firstImage && (
                    firstImage.startsWith('data:image/') || 
                    firstImage.startsWith('http://') || 
                    firstImage.startsWith('https://')
                  );
                  
                  return (
                    <div key={property.id} style={listingCardStyle}>
                      <div style={listingTopRowStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 60,
                            height: 60,
                            borderRadius: 6,
                            background: isValidImage 
                              ? `url(${firstImage}) center/cover no-repeat` 
                              : "linear-gradient(135deg, #E6F1FB 0%, #D0E8F8 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            overflow: 'hidden',
                          }}>
                            {!isValidImage && <BuildingOffice2Icon style={{ width: 24, height: 24, color: C.blue }} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 12 }}>{property.title}</div>
                            <div style={{ color: C.textSec, fontSize: 10 }}>
                              {property.location} · {property.type}
                            </div>
                          </div>
                        </div>
                        <Badge variant={property.status === "pending" ? "pending" : property.status === "booked" ? "info" : "success"}>
                          {property.status}
                        </Badge>
                      </div>

                      <div style={listingBottomRowStyle}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>
                          KSh {Number(property.price).toLocaleString()}
                          <span style={{ fontSize: 10, fontWeight: 400, color: C.textSec }}>/mo</span>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button 
                            type="button" 
                            onClick={() => setEditingProperty(property)} 
                            style={ghostButtonStyle}
                          >
                            Edit
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleDelete(property.id)} 
                            style={dangerGhostButtonStyle}
                            disabled={deletingId === property.id}
                          >
                            {deletingId === property.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState 
                icon={<BuildingOffice2Icon style={{ width: 24, height: 24 }} />}
                title="No properties listed"
                description="Click the button above to add your first property listing."
                action={null}
              />
            )}
          </section>
        ) : null}

        {page === "requests" ? <PropertyRequests bookings={bookings} onUpdate={handleBookingUpdate} /> : null}

        {page === "add" ? <AddProperty onSave={handleSaveNew} onCancel={() => setPage("dashboard")} /> : null}

        {page === "profile" ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "20px 0" }}>
            <div style={{ width: "100%", maxWidth: 400 }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "24px 20px 20px", textAlign: "center", borderBottom: `1px solid ${C.border}`, background: "#FAFAF8" }}>
                  <div style={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: "50%", 
                    background: C.warnTint, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    margin: "0 auto 12px", 
                    fontSize: 22, 
                    fontWeight: 700, 
                    color: C.warning 
                  }}>
                    {profileInitials}
                  </div>
                  
                  {loading ? (
                    <>
                      <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 2px", color: C.text }}>Loading profile</p>
                      <p style={{ fontSize: 11, color: C.textSec, margin: "0 0 10px" }}>Fetching landlord information</p>
                    </>
                  ) : error ? (
                    <>
                      <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 2px", color: C.text }}>Could not load profile</p>
                      <p style={{ fontSize: 11, color: C.textSec, margin: "0 0 10px" }}>{error}</p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 2px", color: C.text }}>
                        {landlord?.fullName || "Landlord"}
                      </p>
                      <p style={{ fontSize: 11, color: C.textSec, margin: "0 0 2px" }}>
                        {landlord?.email || "No email on record"}
                      </p>
                      {landlord?.phone && (
                        <p style={{ fontSize: 11, color: C.textSec, margin: "0 0 12px" }}>
                           {landlord.phone}
                        </p>
                      )}
                    </>
                  )}
                  <Badge variant="warning">Landlord</Badge>
                </div>

                <div style={{ padding: "6px 0" }}>
                  {[
                    { icon: <UserCircleIcon style={{ width: 18, height: 18 }} />, label: "Personal info", action: openEditProfile },
                    { icon: <HomeIcon style={{ width: 18, height: 18 }} />, label: "My listings", action: () => setPage("listings") },
                    { icon: <ClipboardDocumentListIcon style={{ width: 18, height: 18 }} />, label: "Property requests", action: () => setPage("requests") },
                    { icon: <BellIcon style={{ width: 18, height: 18 }} />, label: "Notifications", action: null },
                  ].map((item, index) => (
                    <button
                      key={index}
                      onClick={item.action}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 20px",
                        background: "none",
                        border: "none",
                        borderBottom: index < 3 ? `1px solid ${C.border}` : "none",
                        textAlign: "left",
                        transition: "background 0.15s",
                        cursor: item.action ? "pointer" : "default",
                      }}
                      onMouseEnter={(e) => {
                        if (item.action) e.currentTarget.style.background = C.blueTint;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ color: C.textSec }}>{item.icon}</span>
                        <span style={{ fontSize: 12, color: C.text }}>{item.label}</span>
                      </div>
                      {item.action && (
                        <span style={{ color: C.textTer, fontSize: 16 }}>→</span>
                      )}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => {
                    localStorage.removeItem('user');
                    window.location.href = '/';
                  }}
                  style={{ 
                    width: "100%", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 10, 
                    padding: "10px 20px", 
                    background: "none", 
                    border: "none",
                    borderTop: `1px solid ${C.border}`,
                    transition: "background 0.15s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = C.dangerTint}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ color: C.danger }}>
                    <ArrowRightOnRectangleIcon style={{ width: 18, height: 18 }} />
                  </span>
                  <span style={{ fontSize: 12, color: C.danger, fontWeight: 600 }}>Sign out</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={headerStyle}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>Edit Profile</h2>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: C.textSec }}>Update your personal information</p>
              </div>
              <button type="button" onClick={() => setShowEditProfile(false)} style={closeButtonStyle}>
                <XMarkIcon style={{ width: 20, height: 20 }} />
              </button>
            </div>

            {profileSuccess && (
              <div style={{
                margin: "12px 20px 0",
                padding: "10px 14px",
                background: C.greenTint,
                border: `1px solid ${C.greenBorder}`,
                borderRadius: 6,
                color: C.green,
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                Profile updated successfully!
              </div>
            )}

            {profileError && (
              <div style={{
                margin: "12px 20px 0",
                padding: "10px 14px",
                background: C.dangerTint,
                border: `1px solid ${C.danger}`,
                borderRadius: 6,
                color: C.danger,
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                {profileError}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} style={{ padding: 16, display: "grid", gap: 14 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={editProfileData.fullName}
                  onChange={(e) => setEditProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                  style={inputStyle}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={editProfileData.email}
                  style={{ ...inputStyle, background: "#f5f5f5", color: C.textSec, cursor: "not-allowed" }}
                  disabled
                />
                <p style={{ fontSize: 9, color: C.textTer, marginTop: 2 }}>Email cannot be changed</p>
              </div>

              <div>
                <label style={labelStyle}>Phone Number</label>
                <input
                  type="tel"
                  value={editProfileData.phone}
                  onChange={(e) => setEditProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  style={inputStyle}
                  placeholder="Enter your phone number"
                />
              </div>

              <div style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                paddingTop: 12,
                borderTop: `1px solid ${C.border}`,
              }}>
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  style={secondaryButtonStyle}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={primaryButtonStyle}
                  disabled={profileSaving}
                >
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingProperty ? (
        <EditProperty
          property={editingProperty}
          onSave={handleSaveEdit}
          onClose={() => setEditingProperty(null)}
          onDelete={handleDelete}
        />
      ) : null}
    </div>
  );
}

export default LandlordDashboard;

const headerStyle = {
  background: C.surface,
  borderBottom: `1px solid ${C.border}`,
  position: "sticky",
  top: 0,
  zIndex: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "10px 24px",
  flexWrap: "wrap",
};

const brandIconStyle = {
  width: 30,
  height: 30,
  borderRadius: 8,
  background: C.blue,
  color: "#fff",
  display: "grid",
  placeItems: "center",
  fontWeight: 700,
};

const navStyle = {
  display: "flex",
  gap: 2,
  flexWrap: "wrap",
  justifyContent: "center",
};

const navButtonStyle = (active, emphasized = false) => ({
  border: "none",
  borderRadius: 5,
  padding: "4px 10px",
  background: emphasized ? C.text : active ? C.blueTint : "transparent",
  color: emphasized ? "#fff" : active ? C.blue : C.textSec,
  fontWeight: active || emphasized ? 600 : 500,
  fontSize: 10,
  transition: "all 0.15s",
});

const avatarStyle = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  background: C.warnTint,
  color: C.warning,
  display: "grid",
  placeItems: "center",
  fontWeight: 700,
  flexShrink: 0,
  fontSize: 11,
};

const panelStyle = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: 16,
};

const rowStyle = {
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  flexWrap: "wrap",
  background: "#FAFAF8",
  transition: "box-shadow 0.15s",
};

const sectionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  marginBottom: 12,
  flexWrap: "wrap",
};

const listingCardStyle = {
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: 12,
  display: "grid",
  gap: 8,
  background: "#FAFAF8",
  transition: "box-shadow 0.15s",
};

const listingTopRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  flexWrap: "wrap",
};

const listingBottomRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  flexWrap: "wrap",
};

const primaryActionButton = {
  border: "none",
  borderRadius: 6,
  padding: "6px 14px",
  background: C.text,
  color: "#fff",
  fontWeight: 600,
  fontSize: 11,
  display: "flex",
  alignItems: "center",
  transition: "opacity 0.15s",
};

const linkButtonStyle = {
  border: "none",
  background: "transparent",
  color: C.blue,
  fontWeight: 600,
  fontSize: 11,
  padding: "4px 8px",
  transition: "opacity 0.15s",
};

const ghostButtonStyle = {
  border: `1px solid ${C.border}`,
  borderRadius: 5,
  padding: "4px 12px",
  background: "#fff",
  color: C.text,
  fontSize: 10,
  fontWeight: 500,
  transition: "all 0.15s",
};

const dangerGhostButtonStyle = {
  border: `1px solid ${C.danger}`,
  borderRadius: 5,
  padding: "4px 12px",
  background: "#fff",
  color: C.danger,
  fontSize: 10,
  fontWeight: 500,
  transition: "all 0.15s",
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  zIndex: 1000,
  display: "grid",
  placeItems: "center",
  padding: 16,
};

const modalStyle = {
  width: "100%",
  maxWidth: 420,
  maxHeight: "90vh",
  overflowY: "auto",
  background: C.surface,
  borderRadius: 12,
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
};

const closeButtonStyle = {
  border: "none",
  background: "transparent",
  color: C.textSec,
  cursor: "pointer",
  padding: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const labelStyle = {
  display: "block",
  marginBottom: 4,
  fontSize: 11,
  fontWeight: 600,
  color: C.text,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${C.borderMid}`,
  borderRadius: 6,
  padding: "8px 12px",
  fontSize: 12,
  fontFamily: "inherit",
  color: C.text,
  background: "#fff",
  transition: "border-color 0.15s",
  outline: "none",
};

const primaryButtonStyle = {
  padding: "8px 20px",
  border: "none",
  borderRadius: 6,
  background: C.text,
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 11,
  transition: "opacity 0.15s",
};

const secondaryButtonStyle = {
  padding: "8px 16px",
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  background: "#fff",
  color: C.text,
  cursor: "pointer",
  fontWeight: 500,
  fontSize: 11,
  transition: "all 0.15s",
};