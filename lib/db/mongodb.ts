// MongoDB serverless connection helper
let MongoClientClass: any = null;

try {
  MongoClientClass = require("mongodb").MongoClient;
} catch {
  // Will be retried dynamically in getMongoDb()
}

const uri = (
  process.env.MONGODB_URI ||
  process.env.MONGODB_URL ||
  process.env.MONGO_URL ||
  (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("mongodb")
    ? process.env.DATABASE_URL
    : "") ||
  ""
)
  .trim()
  .replace(/^["']|["']$/g, "");

export const isMongoConfigured = Boolean(
  uri && (uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://"))
);

/**
 * Extract the database name from the MongoDB URI so that .db() always
 * connects to the correct database (not the default 'test' db).
 * e.g. mongodb+srv://...@cluster.net/wezards?... → "wezards"
 */
function getDbNameFromUri(mongoUri: string): string | undefined {
  try {
    // Path after the host: /dbname?options
    const withoutScheme = mongoUri.replace(/^mongodb(\+srv)?:\/\//, "");
    const pathStart = withoutScheme.indexOf("/");
    if (pathStart === -1) return undefined;
    const afterSlash = withoutScheme.slice(pathStart + 1);
    const dbName = afterSlash.split("?")[0].trim();
    return dbName || undefined;
  } catch {
    return undefined;
  }
}

const DB_NAME = getDbNameFromUri(uri);

let client: any = null;
let clientPromise: Promise<any> | null = null;

declare global {
  var _mongoClientPromise: Promise<any> | undefined;
}

if (isMongoConfigured && MongoClientClass) {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClientClass(uri);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise || null;
  } else {
    client = new MongoClientClass(uri);
    clientPromise = client.connect();
  }
}

let indexesCreated = false;
async function ensureIndexes(dbInstance: any) {
  if (indexesCreated || !dbInstance) return;
  try {
    const col = dbInstance.collection("whitelist_entries");
    await Promise.all([
      col.createIndex({ createdAt: -1 }),
      col.createIndex({ walletAddress: 1 }),
      col.createIndex({ status: 1 }),
      col.createIndex({ twitterUsername: 1 }),
    ]);
    indexesCreated = true;
  } catch (e) {
    // Indexes already exist or not authorized
  }
}

export async function getMongoDb(): Promise<any | null> {
  if (!isMongoConfigured) return null;

  // Retry loading the mongodb module if it failed at module init time
  if (!MongoClientClass) {
    try {
      MongoClientClass = require("mongodb").MongoClient;
    } catch (e) {
      console.error("[MongoDB] Failed to load mongodb driver:", e);
      return null;
    }
  }

  // Initialize the connection promise if it hasn't been set up yet
  if (!clientPromise) {
    try {
      if (process.env.NODE_ENV === "development") {
        if (!global._mongoClientPromise) {
          client = new MongoClientClass(uri);
          global._mongoClientPromise = client.connect();
        }
        clientPromise = global._mongoClientPromise || null;
      } else {
        client = new MongoClientClass(uri);
        clientPromise = client.connect();
      }
    } catch (e) {
      console.error("[MongoDB] Failed to create client:", e);
      return null;
    }
  }

  if (!clientPromise) return null;

  try {
    const connectedClient = await clientPromise;
    const dbInstance = DB_NAME ? connectedClient.db(DB_NAME) : connectedClient.db();
    ensureIndexes(dbInstance).catch(() => {});
    return dbInstance;
  } catch (e) {
    console.error("[MongoDB] Connection failed:", e);
    // Reset so the next call retries the connection
    clientPromise = null;
    client = null;
    return null;
  }
}

