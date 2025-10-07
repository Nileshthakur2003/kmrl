import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Alert from '../../../../models/Alert'; // Assuming you have an Alert model

/**
 * Handles GET requests to fetch a single alert by its ID.
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string } }} context
 */
export async function GET(request, { params }) {
  const { id } = params;

  try {
    await dbConnect();
    const alert = await Alert.findById(id);

    if (!alert) {
      return NextResponse.json({ success: false, error: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: alert }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update an alert, e.g., to acknowledge it.
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string } }} context
 */
export async function PUT(request, { params }) {
  const { id } = params;

  try {
    await dbConnect();
    const body = await request.json();

    // The most common update will be to acknowledge an alert.
    // Example request body: { "isAcknowledged": true }
    const alert = await Alert.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!alert) {
      return NextResponse.json({ success: false, error: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: alert }, { status: 200 });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to remove an alert.
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string } }} context
 */
export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    await dbConnect();
    const deletedAlert = await Alert.deleteOne({ _id: id });

    if (deletedAlert.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
