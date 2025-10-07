import { NextResponse } from 'next/server';
import dbConnect from '../../dbconnect';
import Log from '../../../models/log';

/**
 * Handles GET requests to fetch all logs, sorted by most recent.
 * @param {import('next/server').NextRequest} request
 */
export async function GET(request) {
  try {
    await dbConnect();

    // Find all logs and sort them descending by timestamp (most recent first)
    const logs = await Log.find({}).sort({ timestamp: -1 }).limit(100); // Limit to last 100 logs for performance

    return NextResponse.json({ success: true, data: logs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

/**
 * Handles POST requests to create a new log entry.
 * @param {import('next/server').NextRequest} request
 */
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();

    // Create a new log entry in the database
    const log = await Log.create(body);

    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to clear all log entries.
 * This is an administrative action and should be protected.
 * @param {import('next/server').NextRequest} request
 */
export async function DELETE(request) {
    try {
        await dbConnect();

        // In a real app, you would add authentication/authorization here
        // to ensure only an admin can perform this action.

        await Log.deleteMany({}); // Deletes all documents in the collection

        return NextResponse.json({ success: true, message: "All logs have been cleared." }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}
