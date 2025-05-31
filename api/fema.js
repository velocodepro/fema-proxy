export default async function handler(req, res) {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing lat or lng" });
  }

  const query = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: '*',
    returnGeometry: 'true',
    f: 'json'
  });

  const url = `https://services.arcgis.com/hILyB2v3YVYcU7cg/arcgis/rest/services/NFHL/FeatureServer/28/query?${query.toString()}`;

  try {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type");

    if (!contentType.includes("application/json")) {
      const text = await response.text();
      return res.status(502).json({ error: "Blocked or returned HTML", htmlPreview: text.slice(0, 200) });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "FEMA data fetch failed", detail: err.message });
  }
}
