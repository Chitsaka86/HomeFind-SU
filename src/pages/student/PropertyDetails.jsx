import { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  BuildingOffice2Icon,
  HomeModernIcon,
  MapPinIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import PropertyMap from "../../components/maps/PropertyMap.jsx";
import { Badge, C, Stars } from "./studentUi.jsx";

export default function PropertyDetails({ property, onClose }) {
  const [bookingType, setBookingType] = useState("viewing");
  const [selectedDate, setSelectedDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [time, setTime] = useState("10:00");
  const [note, setNote] = useState("");
  const [booked, setBooked] = useState(false);

  const propertyImages = Array.isArray(property.images) ? property.images : [];
  const thumbnailImages = propertyImages.slice(0, 4);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  useEffect(() => {
    setActiveImageIndex(0);
  }, [property.property_id, property.id]);

  useEffect(() => {
    if (selectedDate) {
      const parsedDate = new Date(`${selectedDate}T00:00:00`);
      if (!Number.isNaN(parsedDate.getTime())) {
        setCalendarMonth(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1));
      }
    }
  }, [selectedDate]);

  const calendarYear = calendarMonth.getFullYear();
  const calendarIndex = calendarMonth.getMonth();
  const daysInMonth = new Date(calendarYear, calendarIndex + 1, 0).getDate();
  const firstWeekday = new Date(calendarYear, calendarIndex, 1).getDay();
  const leadingDays = Array.from({ length: firstWeekday }, (_, index) => ({
    date: new Date(calendarYear, calendarIndex, index - firstWeekday + 1),
    inMonth: false,
  }));
  const monthDays = Array.from({ length: daysInMonth }, (_, index) => ({
    date: new Date(calendarYear, calendarIndex, index + 1),
    inMonth: true,
  }));
  const totalCells = Math.ceil((leadingDays.length + monthDays.length) / 7) * 7;
  const trailingDays = Array.from({ length: totalCells - leadingDays.length - monthDays.length }, (_, index) => ({
    date: new Date(calendarYear, calendarIndex + 1, index + 1),
    inMonth: false,
  }));
  const calendarCells = [...leadingDays, ...monthDays, ...trailingDays];

  const formatCalendarDate = (date) =>
    new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);

  const isSelectedDay = (date) => {
    if (!selectedDate) return false;
    return date.toISOString().split("T")[0] === selectedDate;
  };

  const isPastDay = (date) => date < todayStart;

  if (!property) {
    return null;
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="hide-scrollbar" style={{ background: C.surface, borderRadius: 14, width: "100%", maxWidth: 860, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSec, lineHeight: 1 }}>
            <ArrowLeftIcon style={{ width: 18, height: 18 }} />
          </button>
          <span style={{ fontSize: 13, color: C.textSec }}>Search results</span>
          <span style={{ fontSize: 13, color: C.textTer }}>›</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{property.title}</span>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: C.textSec }}>
            <XMarkIcon style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 0 }}>
          <div className="hide-scrollbar" style={{ flex: 3, padding: 20, borderRight: `1px solid ${C.border}`, overflowY: "auto" }}>
            <div style={{ height: 240, borderRadius: 10, overflow: "hidden", background: "linear-gradient(135deg,#E6F1FB,#C8DFF5)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
              {propertyImages[activeImageIndex]?.url ? (
                <img
                  src={propertyImages[activeImageIndex].url}
                  alt={propertyImages[activeImageIndex].caption || property.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <HomeModernIcon style={{ width: 60, height: 60, color: C.blue }} />
              )}
            </div>
            {thumbnailImages.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 6, marginBottom: 16 }}>
                {thumbnailImages.map((image, index) => (
                  <button
                    key={`${image.url}-${index}`}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    style={{
                      height: 54,
                      borderRadius: 6,
                      overflow: "hidden",
                      border: index === activeImageIndex ? `2px solid ${C.blue}` : `1px solid ${C.border}`,
                      background: index === activeImageIndex ? C.blueTint : "#F0F0E8",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.caption || `${property.title} ${index + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </button>
                ))}
              </div>
            ) : null}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <p style={{ fontSize: 17, fontWeight: 700, margin: "0 0 3px", color: C.text }}>{property.title}</p>
                <p style={{ fontSize: 12, color: C.textSec, margin: 0 }}>
                  <MapPinIcon style={{ width: 12, height: 12, display: "inline-block", marginRight: 4, verticalAlign: "-2px" }} />
                  {property.location} · {property.distance} km from Strathmore
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 17, fontWeight: 700, margin: 0, color: C.text }}>KSh {property.price.toLocaleString()}</p>
                <p style={{ fontSize: 10, color: C.textSec, margin: 0 }}>per month</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Stars rating={property.rating} />
              <span style={{ fontSize: 12, color: C.textSec }}>{property.rating} · {property.reviews} reviews</span>
              <Badge variant={property.status === "Available" ? "success" : "warning"}>{property.status}</Badge>
            </div>
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 8px", color: C.text }}>Location</p>
              <PropertyMap latitude={property.latitude} longitude={property.longitude} label={property.title} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 8px", color: C.text }}>Amenities</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {property.amenities.map((amenity) => (
                <span key={amenity} style={{ fontSize: 11, padding: "3px 10px", background: "#F0F0E8", borderRadius: 9999, color: C.text, border: `1px solid ${C.border}` }}>{amenity}</span>
              ))}
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 4px", color: C.text }}>House rules</p>
            <p style={{ fontSize: 11, color: C.textSec, margin: "0 0 14px", lineHeight: 1.6 }}>{property.rules}</p>
            <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 8px", color: C.text }}>Landlord</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.warnTint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: C.warning, flexShrink: 0 }}>
                {property.landlord.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: C.text }}>{property.landlord.name}</p>
                <p style={{ fontSize: 11, color: C.textSec, margin: 0 }}>{property.landlord.listings} listings · Verified landlord</p>
              </div>
              <span style={{ marginLeft: "auto", color: C.green, fontSize: 16 }}>✓</span>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 8px", color: C.text }}>Reviews</p>
            {property.reviewList.map((review, index) => (
              <div key={index} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.blueTint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: C.blue }}>
                    {review.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{review.name}</span>
                  <span style={{ fontSize: 10, color: C.textTer }}>{review.date}</span>
                  <Stars rating={review.rating} />
                </div>
                <p style={{ fontSize: 11, color: C.textSec, margin: 0 }}>{review.comment}</p>
              </div>
            ))}
          </div>

          <div className="hide-scrollbar" style={{ flex: 2, padding: 20, minWidth: 260, overflowY: "auto" }}>
            {booked ? (
              <div style={{ textAlign: "center", paddingTop: 40 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.greenTint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 30 }}>✓</div>
                <p style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 6px" }}>Booking confirmed!</p>
                <p style={{ fontSize: 12, color: C.textSec, margin: "0 0 20px", lineHeight: 1.6 }}>Your request was sent to the landlord for confirmation.</p>
                <div style={{ background: "#F5F5F0", borderRadius: 8, padding: 12, marginBottom: 16, textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: C.textSec }}>Type</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{bookingType === "viewing" ? "Physical viewing" : "Unit reservation"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: C.textSec }}>Date</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{selectedDate}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: C.textSec }}>Status</span>
                    <Badge variant="warning">Awaiting landlord</Badge>
                  </div>
                </div>
                <button onClick={onClose} style={{ width: "100%", background: C.text, color: "#fff", border: "none", borderRadius: 8, height: 38, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Back to search</button>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: "0 0 16px" }}>Book this property</p>
                <label style={{ fontSize: 11, color: C.textSec, display: "block", marginBottom: 6 }}>Booking type</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  {[
                    { id: "viewing", icon: <CalendarDaysIcon style={{ width: 18, height: 18 }} />, label: "View visit" },
                    { id: "reservation", icon: <BuildingOffice2Icon style={{ width: 18, height: 18 }} />, label: "Reserve unit" },
                  ].map((option) => (
                    <button key={option.id} onClick={() => setBookingType(option.id)} style={{ flex: 1, border: `${bookingType === option.id ? "2px" : "1px"} solid ${bookingType === option.id ? C.blue : C.border}`, background: bookingType === option.id ? C.blueTint : "#fff", borderRadius: 8, padding: "8px 4px", cursor: "pointer", textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 2, color: bookingType === option.id ? C.blue : C.textSec }}>{option.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: bookingType === option.id ? 700 : 400, color: bookingType === option.id ? C.blue : C.textSec }}>{option.label}</div>
                    </button>
                  ))}
                </div>
                <label style={{ fontSize: 11, color: C.textSec, display: "block", marginBottom: 5 }}>Pick a date</label>
                <button
                  type="button"
                  onClick={() => setShowCalendar((current) => !current)}
                  style={{
                    width: "100%",
                    border: `1px solid ${C.borderMid}`,
                    borderRadius: 8,
                    padding: "9px 12px",
                    fontSize: 12,
                    marginBottom: showCalendar ? 8 : 12,
                    fontFamily: "inherit",
                    color: C.text,
                    background: "#fff",
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CalendarDaysIcon style={{ width: 16, height: 16, color: C.textSec }} />
                    {selectedDate || "Choose a date"}
                  </span>
                  <span style={{ color: C.textSec }}>{showCalendar ? "Hide" : "Show"}</span>
                </button>
                {showCalendar && (
                  <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, background: "#FAFAF8", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>Calendar</span>
                      <span style={{ fontSize: 11, color: C.textSec }}>Select a visit date</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(new Date(calendarYear, calendarIndex - 1, 1))}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          border: `1px solid ${C.border}`,
                          background: "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ArrowLeftIcon style={{ width: 16, height: 16, color: C.text }} />
                      </button>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text }}>
                          {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(calendarMonth)}
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: C.textSec }}>Choose a day</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(new Date(calendarYear, calendarIndex + 1, 1))}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          border: `1px solid ${C.border}`,
                          background: "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ArrowLeftIcon style={{ width: 16, height: 16, color: C.text, transform: "rotate(180deg)" }} />
                      </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 8 }}>
                      {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                        <div key={day} style={{ fontSize: 10, fontWeight: 700, color: C.textSec, textAlign: "center" }}>
                          {day}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                      {calendarCells.map((cell, index) => {
                        const isoDate = cell.date.toISOString().split("T")[0];
                        const selected = isSelectedDay(cell.date);
                        const disabled = isPastDay(cell.date);

                        return (
                          <button
                            key={`${isoDate}-${index}`}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              if (disabled) return;
                              setSelectedDate(isoDate);
                              setShowCalendar(false);
                            }}
                            style={{
                              height: 38,
                              borderRadius: 8,
                              border: selected ? `2px solid ${C.blue}` : `1px solid ${C.border}`,
                              background: selected ? C.blueTint : cell.inMonth ? "#fff" : "#F4F4EF",
                              color: disabled ? C.textTer : C.text,
                              opacity: cell.inMonth ? 1 : 0.55,
                              cursor: disabled ? "not-allowed" : "pointer",
                              fontSize: 12,
                              fontWeight: selected ? 700 : 500,
                            }}
                          >
                            {cell.date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      {[
                        { label: "Tomorrow", value: 1 },
                        { label: "This weekend", value: 3 },
                        { label: "Next week", value: 7 },
                      ].map((option) => (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => {
                            const nextDate = new Date();
                            nextDate.setDate(nextDate.getDate() + option.value);
                            setSelectedDate(nextDate.toISOString().split("T")[0]);
                          }}
                          style={{
                            border: `1px solid ${C.border}`,
                            background: "#fff",
                            borderRadius: 9999,
                            padding: "5px 10px",
                            fontSize: 11,
                            color: C.text,
                            cursor: "pointer",
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    {selectedDate && (
                      <p style={{ margin: "10px 0 0", fontSize: 11, color: C.textSec }}>
                        Selected: {formatCalendarDate(new Date(`${selectedDate}T00:00:00`))}
                      </p>
                    )}
                  </div>
                )}
                <label style={{ fontSize: 11, color: C.textSec, display: "block", marginBottom: 5 }}>Preferred time</label>
                <input type="time" value={time} onChange={(event) => setTime(event.target.value)} style={{ width: "100%", border: `1px solid ${C.borderMid}`, borderRadius: 8, padding: "7px 10px", fontSize: 12, marginBottom: 12, fontFamily: "inherit", color: C.text, boxSizing: "border-box" }} />
                <label style={{ fontSize: 11, color: C.textSec, display: "block", marginBottom: 5 }}>Note to landlord (optional)</label>
                <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Hi, I'd like to visit..." rows={3} style={{ width: "100%", border: `1px solid ${C.borderMid}`, borderRadius: 8, padding: "7px 10px", fontSize: 12, resize: "none", marginBottom: 12, fontFamily: "inherit", color: C.text, boxSizing: "border-box" }} />
                {selectedDate && (
                  <div style={{ background: "#F5F5F0", borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: C.textSec }}>Type</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{bookingType === "viewing" ? "Physical viewing" : "Unit reservation"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: C.textSec }}>Date</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{selectedDate}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: C.textSec }}>Time</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{time}</span>
                    </div>
                  </div>
                )}
                <button onClick={() => { if (selectedDate) setBooked(true); }} style={{ width: "100%", background: selectedDate ? C.text : "#ccc", color: "#fff", border: "none", borderRadius: 8, height: 40, fontSize: 13, fontWeight: 700, cursor: selectedDate ? "pointer" : "not-allowed", marginBottom: 8, transition: "opacity 0.15s" }}>Confirm booking</button>
                <button style={{ width: "100%", background: "transparent", color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, height: 36, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>♡ Save to favourites</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
