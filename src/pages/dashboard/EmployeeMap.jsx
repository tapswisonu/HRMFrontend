import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Typography } from "@material-tailwind/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import api from "../../app/api";

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

export function EmployeeMap() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLocations = async () => {
        try {
            const { data } = await api.get("/admin/locations");
            setLocations(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch locations", err);
            if (loading) {
                setError("Failed to load map data. Server might be unreachable.");
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchLocations();
        const interval = setInterval(fetchLocations, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card className="h-[600px] w-full shadow-lg">
                <CardHeader
                    variant="gradient"
                    color="blue"
                    className="mb-4 p-6 flex justify-between items-center"
                >
                    <Typography variant="h6" color="white">
                        Live Employee Map (OpenStreetMap)
                    </Typography>
                    {loading && <Typography variant="small" className="text-white/80">Updating...</Typography>}
                </CardHeader>

                <CardBody className="h-full p-0 overflow-hidden relative">
                    {!error ? (
                        <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {locations.map((user) => (
                                (user.location && user.location.lat && user.location.lng) && (
                                    <Marker
                                        key={user._id || Math.random()}
                                        position={[user.location.lat, user.location.lng]}
                                    >
                                        <Popup>
                                            <div className="text-center p-2">
                                                <Typography variant="h6" className="text-blue-gray-900 mb-1 font-bold">
                                                    {user.name}
                                                </Typography>
                                                <div className="text-sm text-gray-700 space-y-1 text-left">
                                                    <p><strong>Device ID:</strong> <span className="text-gray-600">{user.deviceId || "Unknown"}</span></p>
                                                    <p><strong>Last Seen:</strong> <span className="text-gray-600">{user.lastUpdated ? new Date(user.lastUpdated).toLocaleTimeString() : "Just now"}</span></p>
                                                    <p><strong>Status:</strong> <span className="text-green-600 font-medium">Active</span></p>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )
                            ))}
                        </MapContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <Typography color="red">{error}</Typography>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}

export default EmployeeMap;
