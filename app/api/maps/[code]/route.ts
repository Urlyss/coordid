import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';


export async function GET(
    request: Request,
    { params }: { params: { code: string } }
) {
        // List of allowed origins
    const allowedOrigins = [process.env.PRODUCTION_URL || "http://localhost:3000"];
    console.log(allowedOrigins)

    // Function to check if the origin is allowed
    function isAllowedOrigin(origin: string | null): boolean {
    if (!origin) return false;
    return allowedOrigins.some(allowedOrigin => origin.startsWith(allowedOrigin));
    }

    try {
        if (!isAllowedOrigin(request.headers.get('origin'))) {
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
