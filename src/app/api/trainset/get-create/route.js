import { NextResponse } from 'next/server';
import dbConnect from '../../dbconnect';
import Trainset from '../../../models/trainset';

/**
 * Handles GET requests to fetch all trainsets.
 * @param {import('next/server').NextRequest} request
 */
export async function GET(request) {
  try {
    await dbConnect();

    // Find all trainsets and sort them by their _id
    const trainsets = await Trainset.find({}).sort({ _id: 1 });

    return NextResponse.json({ success: true, data: trainsets }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

/**
 * Handles POST requests to create a new trainset.
 * @param {import('next/server').NextRequest} request
 */
export async function POST(request) {
  try {
    await dbConnect();

    // Get the request body
    const body = await request.json();

    // Create a new trainset in the database
    const trainset = await Trainset.create(body);

    return NextResponse.json({ success: true, data: trainset }, { status: 201 });
  } catch (error) {
    // Handle potential validation errors from Mongoose
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
