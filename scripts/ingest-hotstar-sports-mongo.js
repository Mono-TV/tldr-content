#!/usr/bin/env node
/**
 * Hotstar Sports Content Ingestion to MongoDB
 *
 * Fetches sports content (matches) from Hotstar API and stores in MongoDB.
 * Total available: ~175,000 sports items
 *
 * Usage:
 *   MONGO_URI="mongodb://..." node scripts/ingest-hotstar-sports-mongo.js
 *
 * Options:
 *   --limit=N     Only fetch N items (default: all)
 *   --batch=N     Batch size per API request (default: 1000, max: 1000)
 */

const { MongoClient } = require("mongodb");
const crypto = require("crypto");

// Configuration
const HOTSTAR_API_BASE =
  process.env.HOTSTAR_API_BASE_URL || "https://pp-catalog-api.hotstar.com";
const PARTNER_ID = process.env.HOTSTAR_PARTNER_ID || "92837456123";
const AKAMAI_SECRET =
  process.env.HOTSTAR_AKAMAI_SECRET ||
  "7073910d5c5f50d16d50bfdfb0ebb156dd37bea138f341a8432c92e569881617";
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "content_db";
const COLLECTION_NAME = "hotstar_sports";

const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const MAX_OFFSET = 10000; // Hotstar API limit

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace("--", "").split("=");
  acc[key] = value ? parseInt(value, 10) : true;
  return acc;
}, {});

const LIMIT = args.limit || Infinity;
const BATCH_SIZE = Math.min(args.batch || 1000, 1000);

/**
 * Generate Akamai HMAC token
 */
function generateToken() {
  const start = Math.floor(Date.now() / 1000);
  const exp = start + 2000; // 33 minutes validity
  const acl = "/*";

  const authString = `st=${start}~exp=${exp}~acl=${acl}`;
  const keyBytes = Buffer.from(AKAMAI_SECRET, "hex");
  const hmacHash = crypto
    .createHmac("sha256", keyBytes)
    .update(authString)
    .digest("hex");

  return `${authString}~hmac=${hmacHash}`;
}

/**
 * Fetch a batch of sports content from Hotstar API
 */
async function fetchSportsBatch(
  token,
  offset = 0,
  size = 1000,
  fromDate = null,
  toDate = null,
) {
  const params = new URLSearchParams({
    partner: PARTNER_ID,
    orderBy: "startDate",
    order: "desc",
    offset: offset.toString(),
    size: size.toString(),
  });

  if (fromDate) params.append("fromStartDate", fromDate.toString());
  if (toDate) params.append("toStartDate", toDate.toString());

  const url = `${HOTSTAR_API_BASE}/match/search?${params}`;

  const response = await fetch(url, {
    headers: {
      "x-country-code": "in",
      "x-platform-code": "ANDROID",
      "x-partner-name": PARTNER_ID,
      "x-region-code": "DL",
      "x-client-code": "pt",
      hdnea: token,
    },
  });

  if (response.status === 403) {
    throw new Error("TOKEN_EXPIRED");
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Transform Hotstar sport item for MongoDB storage
 */
function transformSportItem(item) {
  return {
    hotstar_id: item.id,
    content_id: item.contentId,
    title: item.title,
    description: item.description,
    content_type: item.contentType,
    sub_content_type: item.subContentType,

    // Sport-specific fields
    game_name: item.gameName,
    tournament_id: item.tournamentId,
    sports_season_id: item.sportsSeasonId,
    sports_season_name: item.sportsSeasonName,

    // Timing
    duration: item.duration,
    start_date: item.startDate,
    end_date: item.endDate,

    // Access
    premium: item.premium || false,
    vip: item.vip || false,
    paid: item.paid || false,
    live: item.live || false,
    asset_status: item.assetStatus,

    // Metadata
    genre: item.genre || [],
    lang: item.lang || [],
    search_keywords: item.searchKeywords || [],

    // Media
    thumbnail: item.thumbnail,
    source_images: item.sourceImages || [],

    // Links
    deep_link_url: item.deepLinkUrl,
    locators: item.locators || [],

    // API tracking
    api_update_date: item.updateDate,

    // Timestamps
    created_at: new Date(),
    updated_at: new Date(),
    last_synced_at: new Date(),
  };
}

/**
 * Main ingestion function
 */
async function ingestSports() {
  console.log("=".repeat(60));
  console.log("HOTSTAR SPORTS INGESTION TO MONGODB");
  console.log("=".repeat(60));

  if (!MONGO_URI) {
    console.error("\n❌ MONGO_URI environment variable is required");
    console.log("\nUsage:");
    console.log(
      '  MONGO_URI="mongodb://..." node scripts/ingest-hotstar-sports-mongo.js',
    );
    console.log("\nOptions:");
    console.log("  --limit=N     Only fetch N items");
    console.log("  --batch=N     Batch size (default: 1000)");
    process.exit(1);
  }

  // Connect to MongoDB
  console.log("\n📦 Connecting to MongoDB...");
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Create indexes
    console.log("📇 Creating indexes...");
    await collection.createIndex({ content_id: 1 }, { unique: true });
    await collection.createIndex({ game_name: 1 });
    await collection.createIndex({ start_date: -1 });
    await collection.createIndex({ tournament_id: 1 });
    await collection.createIndex({ live: 1 });
    await collection.createIndex({ asset_status: 1 });
    await collection.createIndex({ title: "text", description: "text" });

    console.log("✅ Connected and indexes created");

    // Generate token
    let token = generateToken();
    console.log("🔑 Token generated");

    // Get total count
    const initialData = await fetchSportsBatch(token, 0, 1);
    const totalAvailable = initialData.body.results.totalResults;
    const totalToFetch = Math.min(totalAvailable, LIMIT);

    console.log(
      `\n📊 Total sports available: ${totalAvailable.toLocaleString()}`,
    );
    console.log(`📥 Will fetch: ${totalToFetch.toLocaleString()} items`);
    console.log(`📦 Batch size: ${BATCH_SIZE}`);

    const startTime = Date.now();
    let totalFetched = 0;
    let totalInserted = 0;
    let totalUpdated = 0;
    let apiRequests = 0;
    const errors = [];

    // Phase 1: Pagination up to MAX_OFFSET (10,000)
    console.log("\n" + "-".repeat(60));
    console.log("Phase 1: Standard pagination (first 10,000 items)");
    console.log("-".repeat(60));

    for (
      let offset = 0;
      offset < Math.min(MAX_OFFSET, totalToFetch);
      offset += BATCH_SIZE
    ) {
      if (totalFetched >= LIMIT) break;

      const batchNum = Math.floor(offset / BATCH_SIZE) + 1;
      const expectedBatches = Math.ceil(
        Math.min(MAX_OFFSET, totalToFetch) / BATCH_SIZE,
      );

      process.stdout.write(
        `\r  Batch ${batchNum}/${expectedBatches}: Fetching items ${offset.toLocaleString()} - ${(offset + BATCH_SIZE).toLocaleString()}...`,
      );

      try {
        // Regenerate token if needed (every 25 minutes to be safe)
        if (apiRequests > 0 && apiRequests % 25 === 0) {
          token = generateToken();
        }

        const data = await fetchSportsBatch(token, offset, BATCH_SIZE);
        apiRequests++;

        const items = data.body.results.items;

        if (!items || items.length === 0) {
          console.log(`\n  No more items at offset ${offset}`);
          break;
        }

        // Bulk upsert to MongoDB
        const bulkOps = items.map((item) => {
          const transformed = transformSportItem(item);
          const { created_at, ...updateFields } = transformed;
          return {
            updateOne: {
              filter: { content_id: item.contentId },
              update: {
                $set: updateFields,
                $setOnInsert: { created_at: new Date() },
              },
              upsert: true,
            },
          };
        });

        const result = await collection.bulkWrite(bulkOps, { ordered: false });

        totalFetched += items.length;
        totalInserted += result.upsertedCount;
        totalUpdated += result.modifiedCount;

        process.stdout.write(
          ` ✓ (${items.length} items, ${result.upsertedCount} new)`,
        );

        if (items.length < BATCH_SIZE) {
          console.log("\n  Reached end of results");
          break;
        }

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
      } catch (error) {
        if (error.message === "TOKEN_EXPIRED") {
          console.log("\n  ⚠️ Token expired, regenerating...");
          token = generateToken();
          offset -= BATCH_SIZE; // Retry this batch
          continue;
        }

        console.error(`\n  ❌ Error at offset ${offset}: ${error.message}`);
        errors.push({ offset, error: error.message });

        // Wait and continue
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    // Phase 2: Date-based filtering for items beyond 10,000
    if (totalToFetch > MAX_OFFSET && totalFetched < LIMIT) {
      console.log("\n\n" + "-".repeat(60));
      console.log("Phase 2: Date-based filtering (items beyond 10,000)");
      console.log("-".repeat(60));

      // Get the oldest start_date from our current data to continue from there
      const oldestItem = await collection.findOne(
        {},
        { sort: { start_date: 1 }, projection: { start_date: 1 } },
      );

      if (oldestItem && oldestItem.start_date) {
        let toDate = oldestItem.start_date;
        const oneYearMs = 365 * 24 * 60 * 60; // 1 year in seconds

        console.log(
          `  Starting from date: ${new Date(toDate * 1000).toISOString()}`,
        );

        let phase2Batches = 0;
        const maxPhase2Batches = 200; // Safety limit

        while (totalFetched < LIMIT && phase2Batches < maxPhase2Batches) {
          const fromDate = toDate - oneYearMs;

          process.stdout.write(
            `\r  Date range: ${new Date(fromDate * 1000).toISOString().split("T")[0]} to ${new Date(toDate * 1000).toISOString().split("T")[0]}...`,
          );

          try {
            // Regenerate token periodically
            if (apiRequests % 25 === 0) {
              token = generateToken();
            }

            const data = await fetchSportsBatch(
              token,
              0,
              BATCH_SIZE,
              fromDate,
              toDate,
            );
            apiRequests++;

            const items = data.body.results.items;

            if (!items || items.length === 0) {
              console.log(" (no items)");
              toDate = fromDate;
              phase2Batches++;
              continue;
            }

            // Bulk upsert
            const bulkOps = items.map((item) => {
              const transformed = transformSportItem(item);
              const { created_at, ...updateFields } = transformed;
              return {
                updateOne: {
                  filter: { content_id: item.contentId },
                  update: {
                    $set: updateFields,
                    $setOnInsert: { created_at: new Date() },
                  },
                  upsert: true,
                },
              };
            });

            const result = await collection.bulkWrite(bulkOps, {
              ordered: false,
            });

            totalFetched += items.length;
            totalInserted += result.upsertedCount;
            totalUpdated += result.modifiedCount;

            console.log(
              ` ✓ ${items.length} items (${result.upsertedCount} new)`,
            );

            // Move to earlier date range
            toDate = fromDate;
            phase2Batches++;

            await new Promise((resolve) =>
              setTimeout(resolve, RATE_LIMIT_DELAY),
            );
          } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
              token = generateToken();
              continue;
            }

            console.error(`\n  ❌ Error: ${error.message}`);
            errors.push({ phase: 2, fromDate, toDate, error: error.message });
            toDate = fromDate;
            phase2Batches++;
          }
        }
      }
    }

    // Summary
    const elapsed = (Date.now() - startTime) / 1000;

    // Get final count
    const finalCount = await collection.countDocuments();

    console.log("\n\n" + "=".repeat(60));
    console.log("✅ INGESTION COMPLETE!");
    console.log("=".repeat(60));
    console.log(`  Total in DB:       ${finalCount.toLocaleString()}`);
    console.log(`  Items Fetched:     ${totalFetched.toLocaleString()}`);
    console.log(`  Items Inserted:    ${totalInserted.toLocaleString()}`);
    console.log(`  Items Updated:     ${totalUpdated.toLocaleString()}`);
    console.log(`  API Requests:      ${apiRequests.toLocaleString()}`);
    console.log(`  Errors:            ${errors.length}`);
    console.log(
      `  Time Taken:        ${elapsed.toFixed(1)}s (${(elapsed / 60).toFixed(1)} min)`,
    );
    console.log("=".repeat(60));

    // Sample data
    console.log("\n📋 Sample sports content:");
    const samples = await collection.find({}).limit(5).toArray();
    samples.forEach((item, i) => {
      console.log(
        `  ${i + 1}. ${item.title} (${item.game_name || "N/A"}) - ${item.asset_status}`,
      );
    });
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\n👋 MongoDB connection closed");
  }
}

// Run
ingestSports();
