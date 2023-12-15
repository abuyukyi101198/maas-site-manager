export const osm: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap Contributors",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
};

const textFont = ["Ubuntu Sans Regular"];
export const naturalEarthLayers: Array<maplibregl.LayerSpecification> = [
  {
    id: "playa",
    source: "vector",
    "source-layer": "playa",
    type: "fill",
    paint: {
      "fill-color": "#999",
    },
  },
  {
    id: "urban",
    source: "vector",
    "source-layer": "urban",
    type: "fill",
    paint: {
      "fill-color": "#999",
    },
  },
  {
    id: "water",
    source: "vector",
    "source-layer": "water",
    type: "fill",
    paint: {
      "fill-color": "#999",
    },
  },
  {
    id: "ice",
    source: "vector",
    "source-layer": "ice",
    type: "fill",
    paint: {
      "fill-color": "#999",
    },
  },
  {
    id: "river",
    source: "vector",
    "source-layer": "river",
    type: "line",
    paint: {
      "line-color": "#999",
    },
  },
  {
    id: "railroad",
    source: "vector",
    "source-layer": "railroad",
    type: "line",
    paint: {
      "line-color": "#999",
    },
  },
  {
    id: "road",
    source: "vector",
    "source-layer": "road",
    type: "line",
    paint: {
      "line-color": "#999",
    },
  },
  {
    id: "country_label",
    source: "vector",
    "source-layer": "country_label",
    type: "symbol",
    layout: {
      "text-field": ["get", "name"],
      "text-font": textFont,
      "text-offset": [0, 0.6],
      "text-anchor": "top",
    },
    paint: {
      "text-color": "#000",
    },
  },
  {
    id: "state_label",
    source: "vector",
    "source-layer": "state_label",
    type: "symbol",
    layout: {
      "text-field": ["get", "name"],
      "text-font": textFont,
      "text-offset": [0, 0.6],
      "text-anchor": "top",
    },
    paint: {
      "text-color": "#000",
    },
  },
  {
    id: "marine_label",
    source: "vector",
    "source-layer": "marine_label",
    type: "symbol",
    layout: {
      "text-field": ["get", "name"],
      "text-font": textFont,
      "text-offset": [0, 0.6],
      "text-anchor": "top",
    },
    paint: {
      "text-color": "#000",
    },
  },
  {
    id: "lake_label",
    source: "vector",
    "source-layer": "lake_label",
    type: "symbol",
    layout: {
      "text-field": ["get", "name"],
      "text-font": textFont,
      "text-offset": [0, 0.6],
      "text-anchor": "top",
    },
    paint: {
      "text-color": "#000",
    },
  },
  {
    id: "place_label",
    source: "vector",
    "source-layer": "place_label",
    type: "symbol",
    layout: {
      "text-field": ["get", "name"],
      "text-font": textFont,
      "text-offset": [0, 0.6],
      "text-anchor": "top",
    },
    paint: {
      "text-color": "#000",
    },
  },
];

export const naturalEarth: maplibregl.StyleSpecification = {
  version: 8,
  glyphs: `${window.location.protocol}//${window.location.host}/{fontstack}/{range}.pbf`,
  sources: {
    vector: {
      type: "vector",
      url: `pmtiles://${window.location.protocol}//${window.location.host}/natural_earth.vector.pmtiles`,
    },
  },
  layers: naturalEarthLayers,
};
