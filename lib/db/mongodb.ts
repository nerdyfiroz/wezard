// MongoDB serverless connection helper
let MongoClientClass: any = null;

try {
  MongoClientClass = require("mongodb").MongoClient;
} catch {
  // Module will be resolved at runtime in production (Vercel)
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

export async function getMongoDb(): Promise<any | null> {
  if (!isMongoConfigured) return null;
  if (!clientPromise && MongoClientClass) {
    client = new MongoClientClass(uri);
    clientPromise = client.connect();
  }
  if (!clientPromise) return null;
  const connectedClient = await clientPromise;
  return connectedClient.db();
}
