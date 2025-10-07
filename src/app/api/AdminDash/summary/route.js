import { NextResponse } from 'next/server';
import dbConnect from '../../dbconnect';
import Trainset from '../../../models/trainset';
import Job from '../../../models/job';
import BrandingCampaign from '../../../models/branding_campaign';
import Alert from '../../../models/Alert';

/**
 * Fetches and aggregates all necessary data for the main dashboard.
 * This is more efficient than making multiple separate API calls from the client.
 */
export async function GET() {
  try {
    await dbConnect();

    // --- Fetch Data from Multiple Collections Concurrently ---
    const [trainsets, openJobs, activeCampaigns, urgentAlerts] = await Promise.all([
      Trainset.find({}),
      Job.find({ status: { $in: ['Open', 'In Progress'] } }),
      BrandingCampaign.find({ status: 'Active' }),
      Alert.find({ isAcknowledged: false }).sort({ level: 1, timestamp: -1 }).limit(5)
    ]);

    // --- Process and Aggregate the Data ---

    // 1. Calculate Fleet Status
    const fleetStatus = { ready: 0, standby: 0, ibl: 0 }; // ibl = Inspecition Bay Line (Maintenance/Wash)
    trainsets.forEach(train => {
      if (train.currentStatus === 'Ready') fleetStatus.ready++;
      else if (train.currentStatus === 'Standby') fleetStatus.standby++;
      else if (['Under Repair', 'Washing'].includes(train.currentStatus)) {
        fleetStatus.ibl++;
      }
    });

    // 2. Calculate Job Card Stats
    const criticalJobs = openJobs.filter(j => j.priority === 'Critical').length;
    const jobCardStats = {
      value: `${criticalJobs} Critical, ${openJobs.length - criticalJobs} Minor`,
      totalOpen: openJobs.length
    };
    
    // 3. Calculate Branding SLA Status
    let onTrackCount = 0;
    activeCampaigns.forEach(c => {
        if(c.performance.currentVisibility >= c.sla.requiredVisibility * 0.98) { // Assuming "on track" is >= 98% of target
            onTrackCount++;
        }
    });
    const brandingSlaStats = {
        value: `${((onTrackCount / activeCampaigns.length) * 100).toFixed(0)}% On Track`
    };

    // 4. Format Alerts
    const formattedAlerts = urgentAlerts.map(alert => ({
        id: alert._id.toString(),
        trainsetId: alert.trainsetId,
        message: alert.message,
        timestamp: new Date(alert.timestamp).toLocaleString('en-IN'),
        color: alert.level === 'high' ? 'text-red-500' : 'text-yellow-500'
    }));

    // --- Return the Consolidated Payload ---
    return NextResponse.json({
      success: true,
      data: {
        fleetStatus,
        jobCardStats,
        brandingSlaStats,
        urgentAlerts: formattedAlerts
        // In a real app, you might also calculate cleaning bay status here
      }
    });

  } catch (error) {
    console.error('Dashboard Summary API Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
