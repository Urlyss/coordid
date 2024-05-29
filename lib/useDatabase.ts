import { useState, useEffect, useRef } from 'react';
import * as Realm from 'realm-web';

const useDatabase = () => {
  const [dbInstance, setDbInstance] = useState<Realm.App|null>(null);
  const initializing = useRef(false);

  useEffect(() => {
    const fetchMyDB = async () => {
      if (dbInstance || initializing.current) {
        return;
      }

      initializing.current = true;

      console.log('fetching db');
      const uri = process.env.NEXT_PUBLIC_MONGO_URI;
      const id = process.env.NEXT_PUBLIC_APP_ID;
      const apiKey = process.env.NEXT_PUBLIC_MONGO_API_KEY;

      if (!uri || !id || !apiKey) {
        throw new Error('Invalid/Missing environment variable');
      }

      const app = Realm.getApp(id);
      if (app && !app.currentUser) {
        const credentials = Realm.Credentials.apiKey(apiKey);
        await app.logIn(credentials);
      }

      setDbInstance(app);
      initializing.current = false;
    };

    fetchMyDB().catch(console.error);
  }, [dbInstance]);

  return dbInstance;
};

export default useDatabase;
