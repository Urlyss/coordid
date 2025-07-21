import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export async function GET(request: Request) {
    try {
        const client = await clientPromise;
        const db = client.db('countries');
        
        // Get search params from URL if any
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');
        
        let data;
        if (query) {
            data = await db.collection('countries').find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { code: { $regex: query, $options: 'i' } }
                ]
            }).toArray();
        } else {
            data = await db.collection('countries').find({}).toArray();
        }
        
        return NextResponse.json(data);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
