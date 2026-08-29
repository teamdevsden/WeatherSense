/**
 * Duplicate Detection and Event Clustering Service
 * Identifies similar weather reports across social media, citizen reports, and sensors:
 * - Compares text tokens and titles
 * - Matches City, State, and Event Type
 * - Evaluates temporal proximity (within recent 12 hours)
 * - Evaluates GPS distance proximity
 * - Links duplicates into unified event clusters
 */

const WeatherEvent = require('../models/WeatherEvent');

/**
 * Compute Jaccard token similarity between two strings
 */
function computeTextSimilarity(str1 = '', str2 = '') {
  const cleanTokens = (s) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const set1 = new Set(cleanTokens(str1));
  const set2 = new Set(cleanTokens(str2));

  if (set1.size === 0 || set2.size === 0) return 0;

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return Number((intersection.size / union.size).toFixed(3));
}

/**
 * Calculate geographical distance in km between two lat/lng coordinates (Haversine formula)
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if a new weather report matches an existing active event cluster
 */
async function findPotentialDuplicate({ title, description, city, state, eventType, coordinates, timestamp }) {
  const searchTime = timestamp ? new Date(timestamp) : new Date();
  const twelveHoursAgo = new Date(searchTime.getTime() - 12 * 60 * 60 * 1000);

  // Search recent non-duplicate events matching city or state and eventType
  const recentEvents = await WeatherEvent.find({
    city: { $regex: new RegExp(`^${city}$`, 'i') },
    eventType,
    isDuplicate: { $ne: true },
    timestamp: { $gte: twelveHoursAgo },
  }).sort({ timestamp: -1 }).limit(10);

  let bestMatch = null;
  let maxSimilarity = 0;

  for (const ev of recentEvents) {
    const titleSim = computeTextSimilarity(title, ev.title);
    const descSim = computeTextSimilarity(description, ev.description);
    const combinedSim = titleSim * 0.4 + descSim * 0.6;

    let geoDistance = null;
    let geoMatch = true;

    if (
      Array.isArray(coordinates) &&
      coordinates.length === 2 &&
      ev.location?.coordinates?.length === 2
    ) {
      geoDistance = calculateDistanceKm(
        coordinates[1],
        coordinates[0],
        ev.location.coordinates[1],
        ev.location.coordinates[0]
      );
      // If within 30km, strong location corroboration
      geoMatch = geoDistance <= 30;
    }

    // Similarity boost if geographical location is closely matching
    const totalScore = geoMatch ? combinedSim + 0.15 : combinedSim;

    if (totalScore > maxSimilarity) {
      maxSimilarity = totalScore;
      bestMatch = {
        event: ev,
        similarityScore: Number(Math.min(0.98, totalScore).toFixed(2)),
        geoDistance: geoDistance ? Number(geoDistance.toFixed(1)) : null,
      };
    }
  }

  // Threshold for duplicate cluster merging: 0.50 similarity with matching city & eventType
  const isDuplicate = Boolean(bestMatch && maxSimilarity >= 0.50);

  return {
    isDuplicate,
    match: isDuplicate ? bestMatch : null,
    similarityScore: isDuplicate ? bestMatch.similarityScore : 0,
  };
}

module.exports = {
  computeTextSimilarity,
  calculateDistanceKm,
  findPotentialDuplicate,
};
