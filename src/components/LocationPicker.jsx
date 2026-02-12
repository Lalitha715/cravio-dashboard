import mapboxgl from "mapbox-gl";
import { useEffect, useRef, useState } from "react";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

export default function LocationPicker({ onSelect }) {

  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [coords, setCoords] = useState({
    lat: 11.0168,
    lng: 76.9558
  });

  useEffect(() => {

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [coords.lng, coords.lat],
      zoom: 12
    });

    const marker = new mapboxgl.Marker({
      draggable: true
    })
      .setLngLat([coords.lng, coords.lat])
      .addTo(map);

    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();

      setCoords({
        lat: lngLat.lat,
        lng: lngLat.lng
      });

      onSelect(lngLat.lat, lngLat.lng);
    });

    markerRef.current = marker;

  }, []);

  return (
    <div>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "400px" }}
      />

      <p className="mt-2">
        Lat: {coords.lat} | Lng: {coords.lng}
      </p>
    </div>
  );
}
