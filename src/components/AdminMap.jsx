import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import api from "../app/api";

// Fix for default marker icon in Leaflet with Request
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const AdminMap = () => {
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        // Fetch employee locations from backend
        const fetchLocations = async () => {
            try {
                // Switched to correct endpoint
                const { data } = await api.get("/admin/locations");
                setEmployees(data);
            } catch (err) {
                console.error("Failed to fetch locations", err);
            }
        };

        fetchLocations();
        // Poll every 30 seconds
        const interval = setInterval(fetchLocations, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-4 bg-white shadow rounded-lg" style={{ height: "600px", width: "100%" }}>
            <h2 className="text-xl font-bold mb-4">Employee Real-Time Locations</h2>

            <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={true} style={{ height: "100%", width: "100%", borderRadius: "10px" }}>
                {/* OpenStreetMap Tile Layer */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Render Markers */}
                {employees.map((emp) => (
                    emp.location && emp.location.lat && emp.location.lng ? (
                        <Marker key={emp._id || emp.id} position={[emp.location.lat, emp.location.lng]}>
                            <Popup>
                                <strong>{emp.name || "Unknown"}</strong> <br />
                                {emp.email || ""} <br />
                                Last Seen: {new Date(emp.lastSeen || Date.now()).toLocaleString()} <br />
                                Status: {emp.status}
                            </Popup>
                        </Marker>
                    ) : null
                ))}
            </MapContainer>
        </div>
    );
};

export default AdminMap;
