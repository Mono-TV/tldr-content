const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 8080;

// MongoDB connection - credentials must be set via environment variables
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'content_db';

if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI environment variable is required');
  process.exit(1);
}

let db;
let client;

// Manual corrections for incorrect original_language metadata
// Maps IMDb ID to correct ISO 639-1 language code
const LANGUAGE_CORRECTIONS = {
  'tt9263550': 'hi', // Rocketry: The Nambi Effect (Hindi, not Tamil)
  // Add more corrections here as needed
};

// Helper: Apply language corrections to a content item
function applyLanguageCorrections(item) {
  if (!item) return item;
  if (LANGUAGE_CORRECTIONS[item.imdb_id]) {
    return {
      ...item,
      original_language: LANGUAGE_CORRECTIONS[item.imdb_id]
    };
  }
  return item;
}

// Middleware
app.use(compression());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://content.lumiolabs.in',
    'https://mono-tv.github.io',
    'https://tldrcontent-ncrhtdqoiq-uc.a.run.app',
    /\.github\.io$/,
    /\.lumiolabs\.in$/,
    /\.run\.app$/
  ],
  methods: ['GET', 'OPTIONS'],
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Connect to MongoDB
async function connectDB() {
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Helper: Fix Amazon/IMDB image URLs to get full resolution
// Transforms: ._V1_QL75_UY281_CR18,0,190,281_.jpg -> ._V1_.jpg
function fixAmazonImageUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('media-amazon.com') && !url.includes('imdb.com')) return url;
  // Replace size/quality parameters with just ._V1_.
  return url.replace(/\._V1_[^.]+\./, '._V1_.');
}

// Helper: Fix image URLs and apply language corrections to a content item
function fixContentImages(item) {
  if (!item) return item;

  // Apply language corrections first
  const correctedItem = applyLanguageCorrections(item);

  // Then fix image URLs
  return {
    ...correctedItem,
    poster_url: fixAmazonImageUrl(correctedItem.poster_url),
    backdrop_url: fixAmazonImageUrl(correctedItem.backdrop_url)
  };
}

// Helper: Fix image URLs in an array of content items
function fixContentImagesArray(items) {
  return items.map(fixContentImages);
}

// Helper: Build filter query
function buildFilterQuery(query) {
  const filter = {};

  // Genre filter
  if (query.genre) {
    filter['genres.name'] = { $regex: new RegExp(query.genre, 'i') };
  }

  // Language filter (searches in languages array)
  if (query.language) {
    filter.languages = { $regex: new RegExp(query.language, 'i') };
  }

  // Original language filter (searches in original_language field)
  if (query.original_language) {
    // Find IMDb IDs that should be corrected to this language
    const correctedIds = Object.entries(LANGUAGE_CORRECTIONS)
      .filter(([id, lang]) => lang === query.original_language)
      .map(([id]) => id);

    if (correctedIds.length > 0) {
      // Include both: movies with original_language matching AND movies in correction list
      // Store this condition to be applied later with proper $and logic if needed
      filter._original_language_condition = {
        $or: [
          { original_language: { $regex: new RegExp(query.original_language, 'i') } },
          { imdb_id: { $in: correctedIds } }
        ]
      };
    } else {
      // No corrections for this language, just filter normally
      filter.original_language = { $regex: new RegExp(query.original_language, 'i') };
    }
  }

  // Year filter
  if (query.year) {
    filter.year = parseInt(query.year);
  }

  // Year range
  if (query.year_from || query.year_to) {
    filter.year = {};
    if (query.year_from) filter.year.$gte = parseInt(query.year_from);
    if (query.year_to) filter.year.$lte = parseInt(query.year_to);
  }

  // Rating filter (minimum)
  if (query.min_rating) {
    filter.$or = [
      { imdb_rating: { $gte: parseFloat(query.min_rating) } },
      { tmdb_vote_average: { $gte: parseFloat(query.min_rating) } }
    ];
  }

  // Vote count filter (minimum)
  if (query.min_votes) {
    filter.imdb_rating_count = { $gte: parseInt(query.min_votes) };
  }

  // Content type (movie/show)
  if (query.type) {
    filter.content_type = query.type;
  }

  // Country filter
  if (query.country) {
    filter.countries = { $regex: new RegExp(query.country, 'i') };
  }

  // Merge original_language_condition with any existing $or using $and
  if (filter._original_language_condition) {
    const langCondition = filter._original_language_condition;
    delete filter._original_language_condition;

    if (filter.$or) {
      // Both rating filter and language correction exist - use $and to combine them
      const ratingOr = filter.$or;
      delete filter.$or;
      filter.$and = [
        { $or: ratingOr },
        langCondition
      ];
    } else {
      // Only language condition - apply it directly
      Object.assign(filter, langCondition);
    }
  }

  return filter;
}

// Helper: Build sort options
function buildSortOptions(query) {
  const sortField = query.sort || 'release_date';
  const sortOrder = query.order === 'asc' ? 1 : -1;

  const sortMap = {
    'release_date': { release_date: sortOrder },
    'rating': { imdb_rating: sortOrder },
    'title': { title: sortOrder },
    'year': { year: sortOrder },
    'popularity': { tmdb_popularity: sortOrder }
  };

  return sortMap[sortField] || { release_date: -1 };
}

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'tldrcontent-api',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', db: db ? 'connected' : 'disconnected' });
});

// Get all content (movies + shows) from merged_catalog
app.get('/api/content', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = buildFilterQuery(req.query);
    const sort = buildSortOptions(req.query);

    const [items, total] = await Promise.all([
      db.collection('merged_catalog')
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .project({
          _id: 1,
          imdb_id: 1,
          title: 1,
          original_title: 1,
          year: 1,
          release_date: 1,
          overview: 1,
          plot: 1,
          runtime: 1,
          imdb_rating: 1,
          tmdb_vote_average: 1,
          genres: 1,
          languages: 1,
          original_language: 1,
          countries: 1,
          poster_url: 1,
          backdrop_url: 1,
          content_type: 1
        })
        .toArray(),
      db.collection('merged_catalog').countDocuments(filter)
    ]);

    res.json({
      items: fixContentImagesArray(items),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single content by ID
app.get('/api/content/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by imdb_id first, then by _id
    let item = await db.collection('merged_catalog').findOne({ imdb_id: id });

    if (!item) {
      const { ObjectId } = require('mongodb');
      try {
        item = await db.collection('merged_catalog').findOne({ _id: new ObjectId(id) });
      } catch (e) {
        // Invalid ObjectId format, ignore
      }
    }

    if (!item) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(fixContentImages(item));
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search content
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const searchFilter = {
      $or: [
        { title: { $regex: new RegExp(q, 'i') } },
        { original_title: { $regex: new RegExp(q, 'i') } },
        { 'cast.name': { $regex: new RegExp(q, 'i') } },
        { 'directors': { $regex: new RegExp(q, 'i') } }
      ]
    };

    // Apply additional filters
    const additionalFilters = buildFilterQuery(req.query);
    const filter = { ...searchFilter, ...additionalFilters };

    const [items, total] = await Promise.all([
      db.collection('merged_catalog')
        .find(filter)
        .sort({ imdb_rating: -1 })
        .skip(skip)
        .limit(limit)
        .project({
          _id: 1,
          imdb_id: 1,
          title: 1,
          original_title: 1,
          year: 1,
          release_date: 1,
          overview: 1,
          imdb_rating: 1,
          tmdb_vote_average: 1,
          genres: 1,
          languages: 1,
          original_language: 1,
          poster_url: 1,
          content_type: 1
        })
        .toArray(),
      db.collection('merged_catalog').countDocuments(filter)
    ]);

    res.json({
      query: q,
      items: fixContentImagesArray(items),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all genres
app.get('/api/genres', async (req, res) => {
  try {
    const genres = await db.collection('merged_catalog').distinct('genres.name');
    const filtered = genres.filter(g => g && g.trim()).sort();
    res.json(filtered);
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all languages
app.get('/api/languages', async (req, res) => {
  try {
    const languages = await db.collection('merged_catalog').distinct('languages');
    const filtered = languages.filter(l => l && l.trim()).sort();
    res.json(filtered);
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all countries
app.get('/api/countries', async (req, res) => {
  try {
    const countries = await db.collection('merged_catalog').distinct('countries');
    const filtered = countries.filter(c => c && c.trim()).sort();
    res.json(filtered);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get years range
app.get('/api/years', async (req, res) => {
  try {
    const result = await db.collection('merged_catalog').aggregate([
      { $match: { year: { $exists: true, $ne: null } } },
      { $group: { _id: null, min: { $min: '$year' }, max: { $max: '$year' } } }
    ]).toArray();

    if (result.length > 0) {
      res.json({ min: result[0].min, max: result[0].max });
    } else {
      res.json({ min: 1900, max: new Date().getFullYear() });
    }
  } catch (error) {
    console.error('Error fetching years:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recently added (just_in collection)
app.get('/api/recent', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    const items = await db.collection('just_in')
      .find({})
      .sort({ inserted_at: -1 })
      .limit(limit)
      .toArray();

    res.json(fixContentImagesArray(items));
  } catch (error) {
    console.error('Error fetching recent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get stats
app.get('/api/stats', async (req, res) => {
  try {
    const [movies, shows, genres, languages] = await Promise.all([
      db.collection('merged_catalog').countDocuments({ content_type: 'movie' }),
      db.collection('merged_catalog').countDocuments({ content_type: { $in: ['tv', 'show', 'series'] } }),
      db.collection('merged_catalog').distinct('genres.name'),
      db.collection('merged_catalog').distinct('languages')
    ]);

    res.json({
      total: movies + shows,
      movies,
      shows,
      genres: genres.filter(g => g).length,
      languages: languages.filter(l => l).length
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...');
  if (client) await client.close();
  process.exit(0);
});
