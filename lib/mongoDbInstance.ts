import { MongoClient, Db } from 'mongodb';

class MongoDBSingleton {
  private static instance: Db | null = null;
  
  private constructor() {}
  
  public static async getInstance(): Promise<Db | null> {
      if (MongoDBSingleton.instance) {
          return MongoDBSingleton.instance;
        }
        
        const dbName = 'countries';
        const url = process.env.NEXT_PUBLIC_MONGO_URI || "";

    try {
      const client = await MongoClient.connect(url);
      MongoDBSingleton.instance = client.db(dbName);
      return MongoDBSingleton.instance;
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
      return null;
    }
  }
}

export default MongoDBSingleton;