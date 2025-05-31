export default async function handler(req, res) {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing lat or lng" });
  }

  const baseUrl = "https://services.arcgis.com/hILyB2v3YVYcU7cg/arcgis/rest/services/NFHL/FeatureServer/28/query";

  const query = new URLSearchParams({
    geometry: `${lng},${lat}`, // Must be in this order: X (lng), Y (lat)
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: '*',
    returnGeometry: 'true',
    f: 'json'
  });

  const fullUrl = `${baseUrl}?${query.toString()}`;

  try {
    const response = await fetch(fullUrl);

    // Handle HTML returned instead of JSON
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const html = await response.text();
      return res.status(502).json({
        error: "Expected JSON but received HTML",
        preview: html.slice(0, 200)
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({
      error: "Error fetching FEMA data",
      detail: err.message
    });
  }
}
