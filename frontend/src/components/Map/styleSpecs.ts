import mapStyle from "./map-style.json";
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

export const naturalEarth: maplibregl.StyleSpecification = {
  version: 8,
  glyphs: `${window.location.protocol}//${window.location.host}/assets/fonts/{fontstack}/{range}.pbf`,
  sources: {
    naturalearth: {
      type: "vector",
      url: `pmtiles://${window.location.protocol}//${window.location.host}/natural_earth.vector_v2.pmtiles`,
    },
  },
  layers: mapStyle.layers as Array<maplibregl.LayerSpecification>,
};
