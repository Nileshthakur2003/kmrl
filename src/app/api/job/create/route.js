import { NextResponse } from 'next/server';
import dbConnect from '../../dbconnect';
import Job from '../../../models/job';
import Trainset from '../../../models/trainset';

/**
 * API route to create a new job.
 */
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Create the new job
    const newJob = await Job.create(body);

    // IMPORTANT: Update the trainset's status to reflect the new job
    await Trainset.findByIdAndUpdate(body.trainsetId, {
      //'cleaning.status': 'Scheduled',
      'cleaning.activeJobId': newJob._id,
    });

    return NextResponse.json({ success: true, data: newJob }, { status: 201 });

  } catch (error) {
    console.error('Job Creation API Error:', error);
    if (error.name === 'ValidationError') {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
