import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Alert from '../../../models/Alert'; // Assuming you have an Alert model

/**
 * Handles GET requests to fetch all alerts.
 * Allows filtering for unacknowledged alerts via a query parameter.
 * @param {import('next/server').NextRequest} request
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // e.g., /api/alerts?status=unacknowledged

  try {
    await dbConnect();

    const query = {};
    if (status === 'unacknowledged') {
      query.isAcknowledged = false;
    }

    // Find alerts based on the query, sorted by most recent
    const alerts = await Alert.find(query).sort({ timestamp: -1 });

    return NextResponse.json({ success: true, data: alerts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

/**
 * Handles POST requests to create a new alert.
 * @param {import('next/server').NextRequest} request
 */
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const alert = await Alert.create(body);

    return NextResponse.json({ success: true, data: alert }, { status: 201 });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
