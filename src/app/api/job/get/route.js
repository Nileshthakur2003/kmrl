import { NextResponse } from 'next/server';
import dbConnect from '../../dbconnect';
import Job from '../../../models/job';
import Trainset from '../../../models/trainset';

/**
 * API route to fetch a list of all jobs.
 * Supports filtering by jobType via query parameters.
 * Example: GET /api/jobs?jobType=cleaning
 */
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const jobType = searchParams.get('jobType');

    const query = {};
    if (jobType) {
      query.jobType = jobType;
    }

    // Find jobs based on the query, sort by most recently opened
    const jobs = await Job.find(query).sort({ dateOpened: -1 }).limit(100);

    return NextResponse.json({ success: true, data: jobs });

  } catch (error) {
    console.error('Job Fetching API Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
