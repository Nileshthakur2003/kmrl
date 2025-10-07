import { NextResponse } from 'next/server';

/**
 * This is an API Route Handler for the Next.js App Router.
 * It handles GET requests to the /api/hello endpoint.
 *
 * @param {import('next/server').NextRequest} request - The incoming request object.
 */
export async function GET(request) {
  // In the App Router, you return a Response or NextResponse object.
  // NextResponse.json() automatically handles setting the correct headers and status code (200 OK).
  return NextResponse.json({
    message: "Hello World from the Next.js App Router Backend!",
    timestamp: new Date().toISOString(),
  });
}

