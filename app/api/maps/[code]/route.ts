import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: { code: string } }
) {
    try {
        const client = await clientPromise;
        const db = client.db('coord');

        // Get the country map data
        const data = await db.collection('countries').findOne({ code: params.code });
        
        if (!data) {
            return NextResponse.json(
                { error: 'Country not found' },
                { status: 404 }
            );
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
