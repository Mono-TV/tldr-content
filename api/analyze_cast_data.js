const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'content_db';

async function analyzeCastData() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  console.log('=== Analyzing Cast Data ===\n');

  // Check how many movies have cast data
  const withCast = await db.collection('merged_catalog').countDocuments({ cast: { $exists: true, $ne: null, $ne: [] } });
  const total = await db.collection('merged_catalog').countDocuments();

  console.log('Total content:', total);
  console.log('With cast data:', withCast, '(' + ((withCast/total)*100).toFixed(1) + '%)\n');

  // Sample movie with cast data
  console.log('=== Sample Movie with Cast ===');
  const sample = await db.collection('merged_catalog')
    .findOne({
      cast: { $exists: true, $ne: null, $ne: [] },
      content_type: 'movie'
    }, {
      projection: { title: 1, year: 1, original_language: 1, cast: { $slice: 3 } }
    });

  if (sample) {
    console.log('Title:', sample.title, '(' + sample.year + ')');
    console.log('Language:', sample.original_language);
    console.log('Cast:', JSON.stringify(sample.cast, null, 2));
  }

  // Check recent movies (last 5 years) with cast data by language
  console.log('\n=== Recent Movies with Cast (Last 5 Years) ===');
  const currentYear = new Date().getFullYear();
  const fiveYearsAgo = currentYear - 5;

  const languages = ['hi', 'ta', 'te', 'ml', 'kn', 'en'];

  for (const lang of languages) {
    const count = await db.collection('merged_catalog').countDocuments({
      original_language: lang,
      content_type: 'movie',
      year: { $gte: fiveYearsAgo },
      cast: { $exists: true, $ne: null, $ne: [] }
    });
    console.log(lang.toUpperCase() + ':', count, 'movies');
  }

  // Find most common actors in recent Hindi movies
  console.log('\n=== Top Actors in Recent Hindi Movies ===');
  const topHindiActors = await db.collection('merged_catalog').aggregate([
    {
      $match: {
        original_language: 'hi',
        content_type: 'movie',
        year: { $gte: fiveYearsAgo },
        cast: { $exists: true, $ne: null, $ne: [] },
        imdb_rating: { $gte: 6 }
      }
    },
    { $unwind: '$cast' },
    { $group: { _id: '$cast.name', count: { $sum: 1 }, avgRating: { $avg: '$imdb_rating' } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]).toArray();

  topHindiActors.forEach((actor, i) => {
    const rating = actor.avgRating ? actor.avgRating.toFixed(1) : 'N/A';
    console.log((i+1) + '. ' + actor._id + ': ' + actor.count + ' movies (avg rating: ' + rating + ')');
  });

  // Find most common actors in recent Tamil movies
  console.log('\n=== Top Actors in Recent Tamil Movies ===');
  const topTamilActors = await db.collection('merged_catalog').aggregate([
    {
      $match: {
        original_language: 'ta',
        content_type: 'movie',
        year: { $gte: fiveYearsAgo },
        cast: { $exists: true, $ne: null, $ne: [] },
        imdb_rating: { $gte: 6 }
      }
    },
    { $unwind: '$cast' },
    { $group: { _id: '$cast.name', count: { $sum: 1 }, avgRating: { $avg: '$imdb_rating' } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]).toArray();

  topTamilActors.forEach((actor, i) => {
    const rating = actor.avgRating ? actor.avgRating.toFixed(1) : 'N/A';
    console.log((i+1) + '. ' + actor._id + ': ' + actor.count + ' movies (avg rating: ' + rating + ')');
  });

  await client.close();
}

analyzeCastData().catch(console.error);
