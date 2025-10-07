import { NextResponse } from 'next/server';
import dbConnect from '../../dbconnect';
import Trainset from  '../../../models/trainset';

/**
 * Handles GET requests to fetch a single trainset by its ID.
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string } }} context
 */
export async function GET(request, { params }) {
  const { id } = params;

  try {
    await dbConnect();

    const trainset = await Trainset.findById(id);

    if (!trainset) {
      return NextResponse.json({ success: false, error: 'Trainset not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: trainset }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update a single trainset by its ID.
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string } }} context
 */
export async function PUT(request, { params }) {
  const { id } = params;

  try {
    await dbConnect();
    const body = await request.json();

    const trainset = await Trainset.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!trainset) {
      return NextResponse.json({ success: false, error: 'Trainset not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: trainset }, { status: 200 });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to remove a single trainset by its ID.
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string } }} context
 */
export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    await dbConnect();

    const deletedTrainset = await Trainset.deleteOne({ _id: id });

    if (deletedTrainset.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Trainset not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
