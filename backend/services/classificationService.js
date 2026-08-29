/**
 * Automatic Event Classification Service
 * Rule-based NLP classifier mapping text, keywords, and hashtags
 * to national weather hazard categories with confidence estimation.
 */

const EVENT_PATTERNS = {
  flooding: {
    type: 'flooding',
    label: 'Flooding / Inundation',
    icon: '🌊',
    keywords: [
      'flood', 'flooding', 'flooded', 'waterlogging', 'waterlogged', 'inundation',
      'inundated', 'submerged', 'water entered', 'drainage surge', 'river overflow',
      'danger mark', 'ndrf deployed', 'rescue boat', 'deluge', 'water level',
    ],
    hashtags: ['#flood', '#floodalert', '#mumbaifloods', '#waterlogging', '#deluge', '#rescueops'],
    weight: 1.2,
  },
  thunderstorm: {
    type: 'thunderstorm',
    label: 'Thunderstorm & Lightning',
    icon: '⚡',
    keywords: [
      'thunder', 'thunderstorm', 'lightning', 'lightning strike', 'squall', 'cumulonimbus',
      'hail', 'hailstorm', 'cloudburst', 'thunderclap', 'storm cell', 'gusty wind',
    ],
    hashtags: ['#thunderstorm', '#lightning', '#lightningalert', '#hailstorm', '#nowcast'],
    weight: 1.1,
  },
  rainfall: {
    type: 'rainfall',
    label: 'Heavy Rainfall',
    icon: '🌧️',
    keywords: [
      'rain', 'rainfall', 'heavy rain', 'downpour', 'monsoon', 'torrential',
      'drizzle', 'precipitation', 'monsoon shower', 'wet spell', 'red alert rain',
      'orange alert rain', 'mm rain', 'cloudy sky', 'overcast',
    ],
    hashtags: ['#rain', '#heavyrain', '#monsoon', '#mumbairains', '#delhirains', '#monsoon2026', '#imdalert'],
    weight: 1.0,
  },
  heatwave: {
    type: 'heatwave',
    label: 'Severe Heatwave',
    icon: '☀️',
    keywords: [
      'heat', 'heatwave', 'heat wave', 'scorching', 'hot temperature', 'mercury hits',
      'degree celsius', '°c', 'thermal stress', 'loo', 'warm night', 'extreme temperature',
      'sunstroke', 'hydration advisory',
    ],
    hashtags: ['#heatwave', '#summerheat', '#heatstroke', '#temperature', '#scorching'],
    weight: 1.1,
  },
  fog: {
    type: 'fog',
    label: 'Dense Fog / Smog',
    icon: '🌫️',
    keywords: [
      'fog', 'dense fog', 'smog', 'radiation fog', 'zero visibility', 'low visibility',
      'runway visual range', 'cat iii', 'mist', 'haze', 'air quality', 'aqi',
    ],
    hashtags: ['#fog', '#densefog', '#smog', '#delhismog', '#winterfog', '#lowvisibility'],
    weight: 1.0,
  },
  dust_storm: {
    type: 'dust_storm',
    label: 'Dust Storm / Andhi',
    icon: '🌪️',
    keywords: [
      'dust storm', 'dust gale', 'andhi', 'sandstorm', 'suspended particulate',
      'dust haze', 'dust plume', 'particulate matter',
    ],
    hashtags: ['#duststorm', '#andhi', '#sandstorm', '#dustalert'],
    weight: 1.1,
  },
  strong_winds: {
    type: 'strong_winds',
    label: 'Strong / Gale Winds',
    icon: '💨',
    keywords: [
      'strong wind', 'gale', 'squally winds', 'cyclone', 'high wind', 'gusts',
      'tree fall', 'wind speed', 'coastal gale', 'depression winds', 'kmph', 'km/h',
    ],
    hashtags: ['#cyclone', '#highwinds', '#gale', '#coastalalert', '#cyclonealert'],
    weight: 1.0,
  },
};

/**
 * Extract hashtags from text
 */
function extractHashtags(text = '') {
  const matches = text.match(/#[a-zA-Z0-9_]+/g);
  return matches ? [...new Set(matches.map((t) => t.trim()))] : [];
}

/**
 * Classify a weather report text/description into standard hazard categories
 */
function classifyWeatherText(text = '', existingHashtags = []) {
  const normalized = (text + ' ' + existingHashtags.join(' ')).toLowerCase();
  const extractedTags = extractHashtags(text);
  const allTags = [...new Set([...existingHashtags, ...extractedTags])];

  let bestType = 'other';
  let highestScore = 0;
  const matchDetails = {};

  for (const [typeKey, config] of Object.entries(EVENT_PATTERNS)) {
    let score = 0;
    const matchedKeywords = [];

    // Keyword match check
    for (const kw of config.keywords) {
      if (normalized.includes(kw)) {
        score += 1.5;
        matchedKeywords.push(kw);
      }
    }

    // Hashtag match check
    for (const tag of allTags) {
      const lowerTag = tag.toLowerCase();
      if (config.hashtags.includes(lowerTag)) {
        score += 2.5;
        matchedKeywords.push(tag);
      }
    }

    // Apply category priority weight
    score *= config.weight;

    if (score > 0) {
      matchDetails[typeKey] = {
        score,
        matchedKeywords,
        label: config.label,
        icon: config.icon,
      };
    }

    if (score > highestScore) {
      highestScore = score;
      bestType = typeKey;
    }
  }

  // Calculate normalized confidence score (0.50 to 0.98)
  let confidence = 0.65;
  if (highestScore >= 6) {
    confidence = 0.94 + Math.min(0.04, (highestScore - 6) * 0.01);
  } else if (highestScore >= 3) {
    confidence = 0.85 + (highestScore - 3) * 0.03;
  } else if (highestScore > 0) {
    confidence = 0.70 + highestScore * 0.05;
  } else {
    bestType = 'rainfall'; // Default baseline hazard if unclassified
    confidence = 0.60;
  }

  confidence = Number(Math.min(0.99, confidence).toFixed(2));

  return {
    eventType: bestType,
    confidence,
    hashtags: allTags,
    matchDetails,
    meta: EVENT_PATTERNS[bestType] || { label: 'Other Weather Incident', icon: '⚠️' },
  };
}

module.exports = {
  classifyWeatherText,
  extractHashtags,
  EVENT_PATTERNS,
};
