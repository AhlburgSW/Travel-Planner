/* ==============================================
   IMPORTS
   ============================================== */
import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents
} from "react-leaflet";
import axios from "axios";
import L from "leaflet";
import "./App.css";
import "leaflet/dist/leaflet.css";

/* ==============================================
   MARKER ICON SETUP
   ============================================== */
// Import marker images using ES modules
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

// Define custom marker icons
const blueIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const orangeIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greyIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

/* ==============================================
   HELPER FUNCTIONS
   ============================================== */
function formatDateGerman(date) {
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function isToday(date) {
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

/* ==============================================
   ICON COMPONENTS
   ============================================== */
function InfoIcon({ onClick }) {
  return (
    <span className="info-icon" onClick={onClick} title="Mehr Informationen">
      🛈
    </span>
  );
}

function MapIcon({ onClick }) {
  return (
    <span className="map-icon" onClick={onClick} title="Navigation">
      🗺
    </span>
  );
}

function OpenMarkerIcon({ onClick }) {
  return (
    <span className="open-marker-icon" onClick={onClick} title="Open Marker">
      ⚲
    </span>
  );
}

/* ==============================================
   HEADER COMPONENT
   ============================================== */
function Header() {
  return (
    <header className="header">
      <img src="/logo.svg" alt="Ahlburg Travel Planner logo" className="logo" />
      <h1>Ahlburg Travel Planner</h1>
    </header>
  );
}

/* ==============================================
   FOOTER COMPONENT
   ============================================== */
function Footer() {
  return (
    <footer className="footer">
      <p>
        <a
          href="https://github.com/AhlburgSW/Travel-Planner"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>{" "}
        | Licensed under GPL‑3.0 | <span className="eu">Proudly made in the EU 🇪🇺</span>
      </p>
    </footer>
  );
}

/* ==============================================
   HAMBURGER MENU COMPONENT
   ============================================== */
function HamburgerMenu({ activities, hotels, onSelectInfo, openInGoogleMaps, openMarkerPopup }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const parseDate = (dateStr) => new Date(dateStr);
  const toGerman = (date) => formatDateGerman(date);
  const isFuture = (dateStr) => parseDate(dateStr) > today;
  const isPast = (dateStr) => parseDate(dateStr) < today;

  const currentHotel = hotels.find((hotel) => {
    const checkIn = parseDate(hotel.checkIn);
    const checkOut = parseDate(hotel.checkOut);
    return checkIn <= today && today < checkOut;
  });

  const todaysActivities = activities.filter((act) =>
    isToday(parseDate(act.day))
  );

  const upcomingActivities = activities
    .filter((act) => isFuture(act.day))
    .sort((a, b) => parseDate(a.day) - parseDate(b.day));
  const upcomingByDate = upcomingActivities.reduce((acc, act) => {
    const key = toGerman(parseDate(act.day));
    if (!acc[key]) acc[key] = [];
    acc[key].push(act);
    return acc;
  }, {});

  const pastActivities = activities
    .filter((act) => isPast(act.day))
    .sort((a, b) => parseDate(a.day) - parseDate(b.day));
  const pastByDate = pastActivities.reduce((acc, act) => {
    const key = toGerman(parseDate(act.day));
    if (!acc[key]) acc[key] = [];
    acc[key].push(act);
    return acc;
  }, {});

  const upcomingHotels = hotels
    .filter((hotel) => parseDate(hotel.checkIn) > today)
    .sort((a, b) => parseDate(a.checkIn) - parseDate(b.checkIn));

  const pastHotelsArr = hotels
    .filter((hotel) => parseDate(hotel.checkOut) < today)
    .sort((a, b) => parseDate(a.checkIn) - parseDate(b.checkIn));

  return (
    <div className="hamburger-menu">
      <button className="hamburger-button" onClick={() => setOpen(!open)}>
        {open ? "\u2715" : "\u2630"}
      </button>
      <div className={`menu-content ${open ? "visible" : "hidden"}`}>
        {currentHotel && (
          <div className="menu-section">
            <h3 className="menu-heading">Current Hotel</h3>
            <p className="hotel-item">
              {toGerman(new Date(currentHotel.checkIn))} - {currentHotel.name}
              <span style={{ display: "inline-flex", gap: "4px" }}>
                <InfoIcon onClick={() => onSelectInfo("Hotel", currentHotel)} />
                <MapIcon onClick={() => openInGoogleMaps(currentHotel.lat, currentHotel.lng)} />
                <OpenMarkerIcon onClick={() => openMarkerPopup(currentHotel.id, "Hotel")} />
              </span>
            </p>
          </div>
        )}
        {todaysActivities.length > 0 && (
          <div className="menu-section">
            <h3 className="menu-heading">Today's Activities</h3>
            <ul>
              {todaysActivities.map((act) => (
                <li key={act.id} className="activity-item">
                  <span className="item-name">
                    {toGerman(new Date(act.day))} - {act.name}
                  </span>
                  <span style={{ display: "inline-flex", gap: "4px" }}>
                    <InfoIcon onClick={() => onSelectInfo("Activity", act)} />
                    <MapIcon onClick={() => openInGoogleMaps(act.lat, act.lng)} />
                    <OpenMarkerIcon onClick={() => openMarkerPopup(act.id, "Activity")} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="menu-section">
          <h3 className="menu-heading">Upcoming Activities</h3>
          {Object.keys(upcomingByDate).length === 0 ? (
            <p>No upcoming activities</p>
          ) : (
            Object.keys(upcomingByDate)
              .sort()
              .map((key) => (
                <div key={key} className="date-group">
                  <p className="date-heading">{key}:</p>
                  <ul>
                    {upcomingByDate[key].map((act) => {
                      const actDate = parseDate(act.day);
                      const opacity = !isToday(actDate) && actDate > today ? 0.7 : 1;
                      return (
                        <li key={act.id} className="activity-item" style={{ opacity }}>
                          <span className="item-name">{act.name}</span>
                          <span style={{ display: "inline-flex", gap: "4px" }}>
                            <InfoIcon onClick={() => onSelectInfo("Activity", act)} />
                            <MapIcon onClick={() => openInGoogleMaps(act.lat, act.lng)} />
                            <OpenMarkerIcon onClick={() => openMarkerPopup(act.id, "Activity")} />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
          )}
        </div>
        <div className="menu-section">
          <h3 className="menu-heading">Upcoming Hotels</h3>
          {upcomingHotels.length === 0 ? (
            <p>No upcoming hotels</p>
          ) : (
            <ul>
              {upcomingHotels.map((hotel) => {
                const checkInDate = parseDate(hotel.checkIn);
                const opacity = checkInDate > today ? 0.7 : 1;
                return (
                  <li key={hotel.id} className="hotel-item" style={{ opacity }}>
                    <span className="item-name">
                      {toGerman(new Date(hotel.checkIn))} - {hotel.name}
                    </span>
                    <span style={{ display: "inline-flex", gap: "4px" }}>
                      <InfoIcon onClick={() => onSelectInfo("Hotel", hotel)} />
                      <MapIcon onClick={() => openInGoogleMaps(hotel.lat, hotel.lng)} />
                      <OpenMarkerIcon onClick={() => openMarkerPopup(hotel.id, "Hotel")} />
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="menu-section">
          <h3 className="menu-heading">Past Activities</h3>
          {Object.keys(pastByDate).length === 0 ? (
            <p>No past activities</p>
          ) : (
            Object.keys(pastByDate)
              .sort()
              .map((key) => (
                <div key={key} className="date-group">
                  <p className="date-heading">{key}:</p>
                  <ul>
                    {pastByDate[key].map((act) => (
                      <li key={act.id} className="activity-item" style={{ opacity: 0.5 }}>
                        <span className="item-name">{act.name}</span>
                        <span style={{ display: "inline-flex", gap: "4px" }}>
                          <InfoIcon onClick={() => onSelectInfo("Activity", act)} />
                          <MapIcon onClick={() => openInGoogleMaps(act.lat, act.lng)} />
                          <OpenMarkerIcon onClick={() => openMarkerPopup(act.id, "Activity")} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
          )}
        </div>
        <div className="menu-section">
          <h3 className="menu-heading">Past Hotels</h3>
          {pastHotelsArr.length === 0 ? (
            <p>No past hotels</p>
          ) : (
            <ul>
              {pastHotelsArr.map((hotel) => (
                <li key={hotel.id} className="hotel-item" style={{ opacity: 0.5 }}>
                  <span className="item-name">
                    {toGerman(new Date(hotel.checkIn))} - {hotel.name}
                  </span>
                  <span style={{ display: "inline-flex", gap: "4px" }}>
                    <InfoIcon onClick={() => onSelectInfo("Hotel", hotel)} />
                    <MapIcon onClick={() => openInGoogleMaps(hotel.lat, hotel.lng)} />
                    <OpenMarkerIcon onClick={() => openMarkerPopup(hotel.id, "Hotel")} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==============================================
   MAP CLICK HANDLER COMPONENT
   ============================================== */
function MapClickHandler({ onNewLocation }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      axios
        .get("https://nominatim.openstreetmap.org/reverse", {
          params: { format: "json", lat, lon: lng }
        })
        .then((res) => {
          const address = res.data.display_name || "";
          onNewLocation({
            type: "Activity",
            name: "",
            day: "",
            address,
            info: "",
            lat,
            lng
          });
        })
        .catch((err) => {
          console.error("Reverse geocoding error:", err);
          onNewLocation({
            type: "Activity",
            name: "",
            day: "",
            address: "",
            info: "",
            lat,
            lng
          });
        });
    }
  });
  return null;
}

/* ==============================================
   INFO MODAL COMPONENT
   ============================================== */
function InfoModal({ type, item, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState({ ...item });
  const [weather, setWeather] = useState(null);
  const [newFiles, setNewFiles] = useState([]); // For new uploads

  useEffect(() => {
    if (item.lat && item.lng) {
      axios
        .get("/api/weather", { params: { lat: item.lat, lon: item.lng } })
        .then((res) => {
          setWeather(res.data);
        })
        .catch((err) => {
          console.error("Error fetching weather info:", err);
        });
    }
  }, [item]);

  /* ==============================================
     FILE MANAGEMENT HANDLERS
     ============================================== */
  const handleDeleteFile = (index) => {
    try {
      const currentFiles = formData.files ? JSON.parse(formData.files) : [];
      const updatedFiles = currentFiles.filter((_, i) => i !== index);
      setFormData({ ...formData, files: JSON.stringify(updatedFiles) });
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  };

  const handleFileChange = (e) => {
    setNewFiles(e.target.files);
  };

  /* ==============================================
     FORM HANDLERS
     ============================================== */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const dataToSend = new FormData();
      for (const key in formData) {
        if (key === "files") continue;
        dataToSend.append(key, formData[key]);
      }
      if (formData.files) {
        dataToSend.append("files", formData.files);
      }
      if (newFiles.length > 0) {
        for (let i = 0; i < newFiles.length; i++) {
          dataToSend.append("files", newFiles[i]);
        }
      }
      if (type === "Activity") {
        await axios.put(`/api/activities/${item.id}`, dataToSend, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else if (type === "Hotel") {
        await axios.put(`/api/hotels/${item.id}`, dataToSend, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else if (type === "Expense") {
        await axios.put(`/api/expenses/${item.id}`, dataToSend, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      onSave();
      onClose();
    } catch (err) {
      console.error("Error saving changes:", err);
    }
  };

  const handleDelete = async () => {
    try {
      if (type === "Activity") {
        await axios.delete(`/api/activities/${item.id}`);
      } else if (type === "Hotel") {
        await axios.delete(`/api/hotels/${item.id}`);
      } else if (type === "Expense") {
        await axios.delete(`/api/expenses/${item.id}`);
      }
      onDelete();
      onClose();
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  /* ==============================================
     RENDER INFO MODAL
     ============================================== */
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{type} Details</h2>
        {type === "Activity" && (
          <>
            <label>Name:</label>
            <input type="text" name="name" value={formData.name || ""} onChange={handleChange} />
            <label>Date:</label>
            <input type="date" name="day" value={formData.day || ""} onChange={handleChange} />
            <label>Address:</label>
            <input type="text" name="location" value={formData.location || ""} onChange={handleChange} />
            <label>Info:</label>
            <textarea name="info" value={formData.info || ""} onChange={handleChange} />
            <label>Upload Documents:</label>
            <input type="file" name="files" multiple onChange={handleFileChange} />
            {formData.files &&
              (() => {
                try {
                  const files = JSON.parse(formData.files);
                  return (
                    <ul>
                      {files.map((file, index) => {
                        const fileUrl = `/uploads/${file.filename}`;
                        const extension = file.filename.split('.').pop().toLowerCase();
                        if (extension === "pdf") {
                          return (
                            <li key={index}>
                              <div>
                                <embed src={fileUrl} type="application/pdf" width="100%" height="200px" />
                              </div>
                              <a href={fileUrl} download={file.originalname}>Download</a>
                              <button onClick={() => handleDeleteFile(index)}>Delete</button>
                            </li>
                          );
                        } else if (/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.filename)) {
                          return (
                            <li key={index}>
                              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                <img src={fileUrl} alt={file.originalname} style={{ maxWidth: "200px", display: "block" }} />
                              </a>
                              <a href={fileUrl} download={file.originalname}>Download</a>
                              <button onClick={() => handleDeleteFile(index)}>Delete</button>
                            </li>
                          );
                        } else {
                          return (
                            <li key={index}>
                              <a href={fileUrl} download={file.originalname}>{file.originalname}</a>
                              <button onClick={() => handleDeleteFile(index)}>Delete</button>
                            </li>
                          );
                        }
                      })}
                    </ul>
                  );
                } catch (err) {
                  console.error("Error parsing files:", err);
                  return null;
                }
              })()}
          </>
        )}
        {type === "Hotel" && (
          <>
            <label>Name:</label>
            <input type="text" name="name" value={formData.name || ""} onChange={handleChange} />
            <label>Address:</label>
            <input type="text" name="address" value={formData.address || ""} onChange={handleChange} />
            <label>Info:</label>
            <textarea name="info" value={formData.info || ""} onChange={handleChange} />
            <label>Check-In:</label>
            <input
              type="date"
              name="checkIn"
              value={formData.checkIn ? formData.checkIn.split("T")[0] : ""}
              onChange={handleChange}
            />
            <label>Check-Out:</label>
            <input
              type="date"
              name="checkOut"
              value={formData.checkOut ? formData.checkOut.split("T")[0] : ""}
              onChange={handleChange}
            />
            <label>Upload Documents:</label>
            <input type="file" name="files" multiple onChange={handleFileChange} />
            {formData.files &&
              (() => {
                try {
                  const files = JSON.parse(formData.files);
                  return (
                    <ul>
                      {files.map((file, index) => {
                        const fileUrl = `/uploads/${file.filename}`;
                        const extension = file.filename.split('.').pop().toLowerCase();
                        if (extension === "pdf") {
                          return (
                            <li key={index}>
                              <div>
                                <embed src={fileUrl} type="application/pdf" width="100%" height="200px" />
                              </div>
                              <a href={fileUrl} download={file.originalname}>Download</a>
                              <button onClick={() => handleDeleteFile(index)}>Delete</button>
                            </li>
                          );
                        } else if (/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.filename)) {
                          return (
                            <li key={index}>
                              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                <img src={fileUrl} alt={file.originalname} style={{ maxWidth: "200px", display: "block" }} />
                              </a>
                              <a href={fileUrl} download={file.originalname}>Download</a>
                              <button onClick={() => handleDeleteFile(index)}>Delete</button>
                            </li>
                          );
                        } else {
                          return (
                            <li key={index}>
                              <a href={fileUrl} download={file.originalname}>{file.originalname}</a>
                              <button onClick={() => handleDeleteFile(index)}>Delete</button>
                            </li>
                          );
                        }
                      })}
                    </ul>
                  );
                } catch (err) {
                  console.error("Error parsing files:", err);
                  return null;
                }
              })()}
          </>
        )}
        {type === "Expense" && (
          <>
            <label>Description:</label>
            <input type="text" name="description" value={formData.description || ""} onChange={handleChange} />
            <label>Amount:</label>
            <input type="number" step="any" name="amount" value={formData.amount || ""} onChange={handleChange} />
            <label>Date:</label>
            <input type="date" name="date" value={formData.date || ""} onChange={handleChange} />
            <label>Category:</label>
            <input type="text" name="category" value={formData.category || ""} onChange={handleChange} />
          </>
        )}
        <div>
          <p>Coordinates: Lat: {item.lat}, Lng: {item.lng}</p>
        </div>
        {weather && (
          <div>
            <h3>Weather</h3>
            <p>Temperature: {weather.main?.temp}°C</p>
            <p>Conditions: {weather.weather && weather.weather[0]?.description}</p>
          </div>
        )}
        <div className="modal-buttons">
          <button onClick={handleSave}>Save Changes</button>
          <button onClick={handleDelete}>Delete</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ==============================================
   APP WRAPPER COMPONENT
   ============================================== */
export default function AppWrapper() {
  const today = new Date();
  // Use a ref to store marker references
  const markerRefs = useRef({});

  const [activities, setActivities] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [newLocation, setNewLocation] = useState(null);
  const [filters, setFilters] = useState({
    activities: true,
    hotels: true,
    expenses: true
  });
  const [addressQuery, setAddressQuery] = useState("");
  const [addressError, setAddressError] = useState("");
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [infoType, setInfoType] = useState(null);

  /* ==============================================
     DATA FETCHING EFFECTS
     ============================================== */
  useEffect(() => {
    fetchActivities();
    fetchHotels();
    fetchExpenses();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.error("Error getting current location", err);
        }
      );
    }
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await axios.get("/api/activities");
      setActivities(res.data);
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
  };

  const fetchHotels = async () => {
    try {
      const res = await axios.get("/api/hotels");
      setHotels(res.data);
    } catch (err) {
      console.error("Error fetching hotels:", err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await axios.get("/api/expenses");
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  /* ==============================================
     NAVIGATION FUNCTIONS
     ============================================== */
  const openInGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank");
  };

  const openMarkerPopup = (itemId, itemType) => {
    const markerRef = markerRefs.current[itemId];
    if (markerRef) {
      markerRef.openPopup();
    }
  };

  /* ==============================================
     ADDRESS SEARCH FUNCTION
     ============================================== */
  const searchAddress = async () => {
    if (!addressQuery) return;
    try {
      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q: addressQuery, format: "json", limit: 1 }
      });
      if (res.data && res.data.length > 0) {
        const result = res.data[0];
        setNewLocation({
          type: "Activity",
          name: "",
          day: "",
          address: result.display_name,
          info: "",
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        });
        setAddressError("");
      } else {
        setAddressError("Address not found");
      }
    } catch (err) {
      console.error("Error searching address:", err);
      setAddressError("Error searching address");
    }
  };

  /* ==============================================
     NEW LOCATION SUBMISSION HANDLER
     ============================================== */
  const handleSubmitNew = async (e) => {
    e.preventDefault();
    if (!newLocation) return;
    let payload = {};
    let endpoint = "";
    if (newLocation.type === "Activity") {
      payload = {
        name: newLocation.name,
        day: newLocation.day,
        location: newLocation.address,
        info: newLocation.info,
        lat: newLocation.lat,
        lng: newLocation.lng
      };
      endpoint = "/api/activities";
    } else if (newLocation.type === "Hotel") {
      payload = {
        name: newLocation.name,
        address: newLocation.address,
        info: newLocation.info,
        checkIn: newLocation.checkIn,
        checkOut: newLocation.checkOut,
        lat: newLocation.lat,
        lng: newLocation.lng
      };
      endpoint = "/api/hotels";
    } else if (newLocation.type === "Expense") {
      payload = {
        description: newLocation.description,
        amount: newLocation.amount,
        date: newLocation.date,
        category: newLocation.category,
        lat: newLocation.lat,
        lng: newLocation.lng
      };
      endpoint = "/api/expenses";
    }
    try {
      await axios.post(endpoint, payload);
      setNewLocation(null);
      fetchActivities();
      fetchHotels();
      fetchExpenses();
    } catch (err) {
      console.error("Error saving new location:", err);
    }
  };

  /* ==============================================
     INFO MODAL HANDLERS
     ============================================== */
  const handleSelectInfo = (type, item) => {
    setInfoType(type);
    setSelectedInfo(item);
  };

  const handleInfoModalClose = () => {
    setSelectedInfo(null);
    setInfoType(null);
  };

  const handleInfoModalSave = () => {
    fetchActivities();
    fetchHotels();
    fetchExpenses();
  };

  const handleInfoModalDelete = () => {
    fetchActivities();
    fetchHotels();
    fetchExpenses();
  };

  /* ==============================================
     RENDER APPLICATION
     ============================================== */
  return (
    <div className="app-container">
      <Header />
      <HamburgerMenu
        activities={activities}
        hotels={hotels}
        onSelectInfo={handleSelectInfo}
        openInGoogleMaps={openInGoogleMaps}
        openMarkerPopup={openMarkerPopup}
      />
      <main className="main">
        <MapContainer center={[56.4907, -4.2026]} zoom={7} className="map-container">
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <MapClickHandler onNewLocation={setNewLocation} />

          {currentLocation && (
            <Marker position={currentLocation} icon={redIcon}>
              <Popup>Your current location</Popup>
            </Marker>
          )}

          {filters.activities &&
            activities.map((act) => (
              <Marker
                key={act.id}
                position={[act.lat, act.lng]}
                icon={
                  isToday(new Date(act.day))
                    ? orangeIcon
                    : new Date(act.day) > new Date()
                    ? orangeIcon
                    : greyIcon
                }
                opacity={
                  isToday(new Date(act.day))
                    ? 1
                    : new Date(act.day) > new Date()
                    ? 0.7
                    : 0.5
                }
                ref={(ref) => {
                  if (ref) markerRefs.current[act.id] = ref;
                }}
              >
                <Popup>
                  <div>
                    <h3>Activity: {act.name}</h3>
                    <p>Date: {formatDateGerman(new Date(act.day))}</p>
                    <p>Info: {act.info}</p>
                    <div style={{ display: "inline-flex", gap: "4px" }}>
                      <MapIcon onClick={() => openInGoogleMaps(act.lat, act.lng)} />
                      <InfoIcon onClick={() => handleSelectInfo("Activity", act)} />
                      <OpenMarkerIcon onClick={() => openMarkerPopup(act.id, "Activity")} />
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {filters.hotels &&
            hotels.map((hotel) => (
              <Marker
                key={hotel.id}
                position={[hotel.lat, hotel.lng]}
                icon={
                  new Date(hotel.checkIn) <= today && today < new Date(hotel.checkOut)
                    ? blueIcon
                    : new Date(hotel.checkIn) > today
                    ? blueIcon
                    : greyIcon
                }
                opacity={
                  new Date(hotel.checkIn) <= today && today < new Date(hotel.checkOut)
                    ? 1
                    : new Date(hotel.checkIn) > today
                    ? 0.7
                    : 0.5
                }
                ref={(ref) => {
                  if (ref) markerRefs.current[hotel.id] = ref;
                }}
              >
                <Popup>
                  <div>
                    <h3>Hotel: {hotel.name}</h3>
                    <p>Address: {hotel.address}</p>
                    <p>Info: {hotel.info}</p>
                    <p>Check-In: {formatDateGerman(new Date(hotel.checkIn))}</p>
                    <p>Check-Out: {formatDateGerman(new Date(hotel.checkOut))}</p>
                    <div style={{ display: "inline-flex", gap: "4px" }}>
                      <MapIcon onClick={() => openInGoogleMaps(hotel.lat, hotel.lng)} />
                      <InfoIcon onClick={() => handleSelectInfo("Hotel", hotel)} />
                      <OpenMarkerIcon onClick={() => openMarkerPopup(hotel.id, "Hotel")} />
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {filters.expenses &&
            expenses.map((exp) => {
              if (!exp.lat || !exp.lng) return null;
              return (
                <Marker key={exp.id} position={[exp.lat, exp.lng]}>
                  <Popup>
                    <div>
                      <h3>Expense</h3>
                      <p>{exp.description}</p>
                      <p>Amount: {exp.amount} €</p>
                      <p>Date: {new Date(exp.date).toLocaleDateString("de-DE")}</p>
                      <p>Category: {exp.category}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {newLocation && (
            <Marker position={[newLocation.lat, newLocation.lng]}>
              <Popup>
                <div>
                  <h3>Create New {newLocation.type}</h3>
                  <form onSubmit={handleSubmitNew}>
                    <div>
                      <label>Type: </label>
                      <select
                        value={newLocation.type}
                        onChange={(e) =>
                          setNewLocation({ ...newLocation, type: e.target.value })
                        }
                      >
                        <option value="Activity">Activity</option>
                        <option value="Hotel">Hotel</option>
                        <option value="Expense">Expense</option>
                      </select>
                    </div>
                    {newLocation.type === "Activity" && (
                      <>
                        <div>
                          <label>Name: </label>
                          <input
                            type="text"
                            value={newLocation.name || ""}
                            onChange={(e) =>
                              setNewLocation({ ...newLocation, name: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <label>Date: </label>
                          <input
                            type="date"
                            value={newLocation.day || ""}
                            onChange={(e) =>
                              setNewLocation({ ...newLocation, day: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <label>Address: </label>
                          <input
                            type="text"
                            value={newLocation.address || ""}
                            onChange={(e) =>
                              setNewLocation({ ...newLocation, address: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <label>Info: </label>
                          <textarea
                            value={newLocation.info || ""}
                            onChange={(e) =>
                              setNewLocation({ ...newLocation, info: e.target.value })
                            }
                          />
                        </div>
                      </>
                    )}
                    {newLocation.type === "Hotel" && (
                      <>
                        <div>
                          <label>Hotel Name: </label>
                          <input
                            type="text"
                            value={newLocation.name || ""}
                            onChange={(e) =>
                              setNewLocation({ ...newLocation, name: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <label>Address: </label>
                          <input
                            type="text"
                            value={newLocation.address || ""}
                            onChange={(e) =>
                              setNewLocation({ ...newLocation, address: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <label>Info: </label>
                          <textarea
                            value={newLocation.info || ""}
                            onChange={(e) =>
                              setNewLocation({ ...newLocation, info: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label>Check-In: </label>
                          <input
                            type="date"
                            value={newLocation.checkIn || ""}
                            onChange={(e) =>
                              setNewLocation({ ...newLocation, checkIn: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <label>Check-Out: </label>
                          <input
                            type="date"
                            value={newLocation.checkOut || ""}
                            onChange={(e) =>
                              setNewLocation({ ...newLocation, checkOut: e.target.value })
                            }
                            required
                          />
                        </div>
                      </>
                    )}
                    {newLocation.type === "Expense" && (
                      <>
                        <div>
                          <label>Description: </label>
                          <input
                            type="text"
                            value={newLocation.description || ""}
                            onChange={(e) =>
                              setNewLocation({ ...newLocation, description: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <label>Amount: </label>
                          <input
                            type="number"
                            step="any"
                            value={newLocation.amount || ""}
                            onChange={(e) =>
                              setNewLocation({ ...newLocation, amount: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <label>Date: </label>
                          <input
                            type="date"
                            value={newLocation.date || ""}
                            onChange={(e) =>
                              setNewLocation({ ...newLocation, date: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <label>Category: </label>
                          <input
                            type="text"
                            value={newLocation.category || ""}
                            onChange={(e) =>
                              setNewLocation({ ...newLocation, category: e.target.value })
                            }
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <label>Coordinates: </label>
                      <input
                        type="text"
                        value={`Lat: ${newLocation.lat}, Lng: ${newLocation.lng}`}
                        readOnly
                      />
                    </div>
                    <button type="submit">Save {newLocation.type}</button>
                  </form>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        <div className="search-container">
          <h2>Search by Address</h2>
          <input
            type="text"
            placeholder="Enter address"
            value={addressQuery}
            onChange={(e) => setAddressQuery(e.target.value)}
          />
          <button onClick={searchAddress}>Search</button>
          {addressError && <p className="error">{addressError}</p>}
        </div>

        <div className="filter-panel">
          <label>
            <input
              type="checkbox"
              checked={filters.activities}
              onChange={(e) =>
                setFilters({ ...filters, activities: e.target.checked })
              }
            />
            Activities
          </label>
          <label>
            <input
              type="checkbox"
              checked={filters.hotels}
              onChange={(e) =>
                setFilters({ ...filters, hotels: e.target.checked })
              }
            />
            Hotels
          </label>
          <label>
            <input
              type="checkbox"
              checked={filters.expenses}
              onChange={(e) =>
                setFilters({ ...filters, expenses: e.target.checked })
              }
            />
            Expenses
          </label>
        </div>
      </main>

      <Footer />

      {selectedInfo && (
        <InfoModal
          type={infoType}
          item={selectedInfo}
          onClose={handleInfoModalClose}
          onSave={handleInfoModalSave}
          onDelete={handleInfoModalDelete}
        />
      )}
    </div>
  );
}

