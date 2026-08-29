/**
 * Multi-Source Data Ingestion & Intelligence Pipeline Service
 * Coordinates:
 * Ingestion -> Text Analysis -> Classification -> Duplicate Detection -> AI Authenticity Scoring -> Database & Timeline
 */

const WeatherEvent = require('../models/WeatherEvent');
const { classifyWeatherText, extractHashtags } = require('./classificationService');
const { evaluateEventAuthenticity } = require('./verificationService');
const { findPotentialDuplicate } = require('./duplicateDetectionService');

const SOURCE_METADATA = {
  imd_api: { name: 'IMD AWS & Radar Doppler', type: 'Official Weather Stream', isSimulated: false },
  openweather: { name: 'OpenWeather Satellite Grid', type: 'Meteorological Satellite API', isSimulated: false },
  twitter: { name: 'X / Twitter Weather Stream', type: 'Social Media Feed', isSimulated: true },
  news_web: { name: 'News & Web Ingestion', type: 'News RSS & Web Crawler', isSimulated: true },
  public_dataset: { name: 'National Public Weather Archives', type: 'Historical & Open Data', isSimulated: false },
  citizen: { name: 'Citizen Crowdsource Mobile Portal', type: 'Citizen Eye-witness Report', isSimulated: false },
};

/**
 * Ingest and process a raw weather report
 */
async function processAndIngestReport({
  source = 'twitter',
  rawText = '',
  title = '',
  description = '',
  city = 'Mumbai',
  state = 'Maharashtra',
  coordinates = [72.8777, 19.0760],
  explicitEventType = null,
  hashtags = [],
  mediaUrls = [],
  mediaType = 'image',
  timestamp = new Date(),
  reporterName = 'Automated Stream',
  reporterPhone = '',
  isExplicitFake = false,
  verifiedBy = null,
}) {
  const contentToAnalyze = (rawText || `${title} ${description}`).trim();

  // 1. NLP Event Classification & Hashtag Extraction
  const classificationResult = classifyWeatherText(contentToAnalyze, hashtags);
  const detectedEventType = explicitEventType || classificationResult.eventType;
  const extractedTags = classificationResult.hashtags;

  const finalTitle = title || (rawText ? rawText.slice(0, 80) : `Weather Report: ${detectedEventType} in ${city}`);
  const finalDescription = description || rawText || `Weather incident of type ${detectedEventType} logged in ${city}, ${state}.`;

  // 2. Duplicate Detection
  const duplicateResult = await findPotentialDuplicate({
    title: finalTitle,
    description: finalDescription,
    city,
    state,
    eventType: detectedEventType,
    coordinates,
    timestamp,
  });

  // 3. AI Authenticity & Verification Evaluation
  const duplicateCount = duplicateResult.isDuplicate && duplicateResult.match
    ? (duplicateResult.match.event.reportCount || 1) + 1
    : 1;

  const verificationResult = evaluateEventAuthenticity({
    source,
    title: finalTitle,
    description: finalDescription,
    city,
    state,
    coordinates,
    eventType: detectedEventType,
    hasMedia: mediaUrls.length > 0,
    duplicateCount,
    isExplicitFake,
  });

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 4. If it's a duplicate, update existing cluster and create linked record
  let duplicateOfId = null;
  let duplicateGroupId = `WS-GRP-${Date.now()}`;

  if (duplicateResult.isDuplicate && duplicateResult.match) {
    const parentEvent = duplicateResult.match.event;
    duplicateOfId = parentEvent._id;
    duplicateGroupId = parentEvent.duplicateGroupId || `WS-GRP-${parentEvent._id.toString().slice(-6)}`;

    // Update parent event's report count, timeline and associated sources
    await WeatherEvent.findByIdAndUpdate(parentEvent._id, {
      $inc: { reportCount: 1 },
      $addToSet: {
        hashtags: { $each: extractedTags },
        mediaUrls: { $each: mediaUrls },
      },
      $push: {
        associatedReports: {
          reportId: `REP-${Math.floor(10000 + Math.random() * 90000)}`,
          source,
          text: finalTitle,
          timestamp: new Date(timestamp),
          reporterName,
        },
        processingTimeline: {
          step: `Corroborating report merged (${source.toUpperCase()})`,
          timestamp: new Date(),
          details: `Report from ${city} merged with similarity ${Math.round(duplicateResult.similarityScore * 100)}%`,
        },
      },
    });
  }

  // 5. Build timeline events for this record
  const processingTimeline = [
    {
      step: 'Raw Data Ingested',
      timestamp: new Date(timestamp),
      details: `Received via ${SOURCE_METADATA[source]?.name || source} at ${timeFormatted}`,
    },
    {
      step: 'NLP Classification',
      timestamp: new Date(Date.now() + 100),
      details: `Classified as ${detectedEventType.toUpperCase()} (Confidence: ${Math.round(classificationResult.confidence * 100)}%)`,
    },
    {
      step: duplicateResult.isDuplicate ? 'Duplicate Clustered' : 'Deduplication Scan Clear',
      timestamp: new Date(Date.now() + 200),
      details: duplicateResult.isDuplicate
        ? `Linked with active incident cluster ${duplicateGroupId} (${Math.round(duplicateResult.similarityScore * 100)}% similarity)`
        : 'Unique spatial-temporal incident confirmed',
    },
    {
      step: 'AI Authenticity Scoring',
      timestamp: new Date(Date.now() + 300),
      details: `Authenticity Score: ${Math.round(verificationResult.authenticityScore * 100)}% (${verificationResult.verdict})`,
    },
  ];

  // 6. Create WeatherEvent document
  const eventDoc = await WeatherEvent.create({
    source,
    sourceName: SOURCE_METADATA[source]?.name || source,
    title: finalTitle,
    description: finalDescription,
    eventType: detectedEventType,
    city,
    state,
    location: {
      type: 'Point',
      coordinates: [Number(coordinates[0]), Number(coordinates[1])],
    },
    timestamp: new Date(timestamp),
    hashtags: extractedTags,
    mediaUrls,
    mediaType,
    verificationStatus: verificationResult.status,
    verifiedBy: verificationResult.status === 'verified' && verifiedBy ? verifiedBy : null,
    mlConfidenceScore: verificationResult.authenticityScore,
    verificationFactors: verificationResult.factors,
    isFake: verificationResult.status === 'fake' || isExplicitFake,
    isDuplicate: duplicateResult.isDuplicate,
    duplicateOf: duplicateOfId,
    duplicateGroupId,
    similarityScore: duplicateResult.similarityScore || 0,
    reportCount: 1,
    associatedReports: [
      {
        reportId: `REP-${Math.floor(10000 + Math.random() * 90000)}`,
        source,
        text: finalTitle,
        timestamp: new Date(timestamp),
        reporterName,
      },
    ],
    processingTimeline,
    processingStatus: 'processed',
    ingestionTimestamp: new Date(),
  });

  return {
    success: true,
    event: eventDoc,
    classification: classificationResult,
    verification: verificationResult,
    duplicate: duplicateResult,
  };
}

module.exports = {
  processAndIngestReport,
  SOURCE_METADATA,
};
