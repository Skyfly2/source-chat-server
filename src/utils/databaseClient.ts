import { Db, MongoClient } from "mongodb";

class DatabaseClient {
  private static instance: DatabaseClient | null = null;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnecting: boolean = false;

  private constructor() {}

  static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }

  async connect(): Promise<void> {
    if (this.client && this.db) {
      return;
    }

    if (this.isConnecting) {
      while (this.isConnecting) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return;
    }

    this.isConnecting = true;

    try {
      const connectionString = process.env.MONGODB_CONNECTION_STRING;
      const databaseName = process.env.MONGODB_DATABASE_NAME || "source-chat";

      if (!connectionString) {
        throw new Error(
          "MONGODB_CONNECTION_STRING environment variable is required"
        );
      }

      console.log("Connecting to MongoDB...");

      this.client = new MongoClient(connectionString, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();
      this.db = this.client.db(databaseName);

      console.log(`✓ Connected to MongoDB database: ${databaseName}`);
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      this.client = null;
      this.db = null;
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log("✓ Disconnected from MongoDB");
    }
  }

  getDatabase(): Db {
    if (!this.db) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.db;
  }

  isConnected(): boolean {
    return this.client !== null && this.db !== null;
  }

  static reset(): void {
    if (DatabaseClient.instance) {
      DatabaseClient.instance.disconnect();
      DatabaseClient.instance = null;
    }
  }
}

export const getDatabaseClient = (): DatabaseClient => {
  return DatabaseClient.getInstance();
};

export const getDatabase = (): Db => {
  return getDatabaseClient().getDatabase();
};

export const connectToDatabase = async (): Promise<void> => {
  const client = getDatabaseClient();
  await client.connect();
};

export const disconnectFromDatabase = async (): Promise<void> => {
  const client = getDatabaseClient();
  await client.disconnect();
};

export const resetDatabaseClient = (): void => {
  DatabaseClient.reset();
};
