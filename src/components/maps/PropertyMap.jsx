import Map, { Marker } from "react-map-gl/maplibre";

const DEFAULT_VIEW_STATE = {
  longitude: 36.7802,
  latitude: -1.2965,
  zoom: 13,
};

const OSM_MAP_STYLE = {
  version: 8,
  sources: {
    openstreetmap: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "openstreetmap",
      type: "raster",
      source: "openstreetmap",
    },
  ],
};

export default function PropertyMap({ latitude, longitude, label = "Property location" }) {
  const viewState = {
    longitude: Number.isFinite(Number(longitude)) ? Number(longitude) : DEFAULT_VIEW_STATE.longitude,
    latitude: Number.isFinite(Number(latitude)) ? Number(latitude) : DEFAULT_VIEW_STATE.latitude,
    zoom: DEFAULT_VIEW_STATE.zoom,
  };

  return (
    <div style={{ width: "100%", height: 340, borderRadius: 16, overflow: "hidden", border: "1px solid #E0E0D8" }}>
      <Map
        initialViewState={viewState}
        style={{ width: "100%", height: "100%" }}
        mapStyle={OSM_MAP_STYLE}
      >
        <Marker longitude={viewState.longitude} latitude={viewState.latitude} anchor="bottom">
          <div
            title={label}
            style={{
              width: 18,
              height: 18,
              borderRadius: "50% 50% 50% 0",
              background: "#185FA5",
              border: "2px solid #fff",
              transform: "rotate(-45deg)",
              boxShadow: "0 6px 14px rgba(0,0,0,0.18)",
            }}
          />
        </Marker>
      </Map>
    </div>
  );
}