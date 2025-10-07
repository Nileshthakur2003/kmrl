import { NextResponse } from 'next/server';
import dbConnect from '../../dbconnect';
import Trainset from '../../../models/trainset';
import Job from '../../../models/job';

/**
 * API route to fetch and aggregate all data for the Cleaning Operations Dashboard.
 */
export async function GET() {
  try {
    await dbConnect();

    const [allTrainsets, activeCleaningJobs] = await Promise.all([
      Trainset.find({}).select('_id currentStatus cleaning'),
      Job.find({ 
        jobType: 'cleaning', 
        status: { $in: ['Open', 'In Progress', 'Scheduled'] } 
      }).sort({ 'details.startTime': 1 })
    ]);

    // --- Categorize Trainsets ---
    const needsCleaning = [];
    const scheduledTrainIds = new Set(activeCleaningJobs.map(job => job.trainsetId));

    allTrainsets.forEach(train => {
      // A train needs cleaning if its status is 'Awaiting Cleaning' AND it's not already scheduled.
      if (train.currentStatus === 'Awaiting Cleaning' && !scheduledTrainIds.has(train._id)) {
        needsCleaning.push(train);
      }
    });

    // --- Determine Bay Status ---
    const bayStatuses = [
        { bayId: 1, status: 'Available', currentJobId: null },
        { bayId: 2, status: 'Available', currentJobId: null },
        { bayId: 3, status: 'Available', currentJobId: null },
    ];
    
    // In a real system, you'd check job start/end times against the current time.
    // For this simulation, we'll just show the first few jobs as active.
    activeCleaningJobs.forEach(job => {
        if (job.details.bayId && bayStatuses[job.details.bayId - 1].status === 'Available') {
            bayStatuses[job.details.bayId - 1].status = 'Occupied';
            bayStatuses[job.details.bayId - 1].currentJobId = job;
        }
    });

    // --- Calculate Operational Efficiency ---
    const totalFleetSize = allTrainsets.length;
    const readyForServiceCount = totalFleetSize - needsCleaning.length - activeCleaningJobs.filter(j => j.status !== 'Completed').length;
    const cleaningReadiness = (readyForServiceCount / totalFleetSize) * 100;

    return NextResponse.json({
      success: true,
      data: {
        needsCleaning,
        scheduledJobs: activeCleaningJobs,
        bayStatuses,
        fleetCleaningReadiness: cleaningReadiness,
      },
    });

  } catch (error) {
    console.error('Cleaning Summary API Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
