import { useState, useEffect } from 'react';

export type Country = {
    name: string;
    code: string;
    // Add other fields as needed
};

export function useCountries(query?: string) {
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCountries = async () => {
            setLoading(true);
            try {
                const url = query 
                    ? `/api/countries?query=${encodeURIComponent(query)}`
                    : '/api/countries';
                    
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setCountries(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                setCountries([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCountries();
    }, [query]);

    return { countries, loading, error };
}
