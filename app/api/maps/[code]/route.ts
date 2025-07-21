import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: { code: string } }
) {
         // Get the origin and referer
  const referer = request.headers.get('referer')
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  
  // List of allowed origins that don't need API key
  const sameOriginSources = [host]
  // Check if request is from the same origin
  const isSameOrigin = sameOriginSources.some(url => 
    url && (referer?.includes(url) || origin?.includes(url))
  )

    try {
        if (!isSameOrigin) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Unauthorized origin'
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
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
