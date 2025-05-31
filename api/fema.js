export default async function handler(req, res) {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing lat or lng" });
  }

  const baseUrl = "https://gis.fema.gov/server/rest/services/NFHL/NFHL/MapServer/28/query";

  const query = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: '*',
    returnGeometry: 'true',
    f: 'json'
  });

  const url = `${baseUrl}?${query.toString()}`;

  try {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type");

    if (!contentType.includes("application/json")) {
      const html = await response.text();
      return res.status(502).json({
        error: "Expected JSON but received HTML",
        preview: html.slice(0, 300)
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: "Fetch failed", detail: err.message });
  }
}
