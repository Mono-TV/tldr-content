import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || '';
const DB_NAME = process.env.DB_NAME || 'content_db';
const COLLECTION_NAME = 'hotstar_sports';

let cachedClient: MongoClient | null = null;

async function getClient(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }

  if (!MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const game_name = searchParams.get('game_name');
    const asset_status = searchParams.get('asset_status') || 'PUBLISHED';
    const live = searchParams.get('live');
    const lang = searchParams.get('lang');
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const sort = searchParams.get('sort') || 'start_date';
    const order = searchParams.get('order') || 'desc';

    // Build query
    const query: Record<string, any> = {
      // Exclude test/automation content
      title: { $not: /automation|test/i },
    };

    if (asset_status) {
      query.asset_status = asset_status;
    }

    if (game_name) {
      query.game_name = game_name;
    }

    if (live !== null) {
      query.live = live === 'true';
    }

    if (lang) {
      query.lang = lang;
    }

    // Connect to MongoDB
    const client = await getClient();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Fetch data
    const sortOrder = order === 'asc' ? 1 : -1;
    const items = await collection
      .find(query)
      .sort({ [sort]: sortOrder })
      .limit(limit)
      .toArray();

    // Transform items
    const transformedItems = items.map((item) => ({
      _id: item._id.toString(),
      content_id: item.content_id,
      hotstar_id: item.hotstar_id,
      title: item.title,
      description: item.description,
      game_name: item.game_name,
      genre: item.genre,
      tournament_id: item.tournament_id,
      tournament_name: item.tournament_name,
      sports_season_id: item.sports_season_id,
      sports_season_name: item.sports_season_name,
      start_date: item.start_date,
      end_date: item.end_date,
      duration: item.duration,
      live: item.live,
      asset_status: item.asset_status,
      premium: item.premium,
      vip: item.vip,
      lang: item.lang,
      thumbnail: item.thumbnail,
      source_images: item.source_images,
      deep_link_url: item.deep_link_url,
      locators: item.locators,
      search_keywords: item.search_keywords,
    }));

    return NextResponse.json({
      items: transformedItems,
      total: transformedItems.length,
    });
  } catch (error) {
    console.error('[Sports API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sports data', items: [], total: 0 },
      { status: 500 }
    );
  }
}
