import { NextResponse } from 'next/server';
import dbConnect from '../../dbconnect';
import Trainset from '../../../models/trainset';
import BrandingCampaign from '../../../models/branding_campaign';
import BrandingProposal from '../../../models/branding_proposal';

/**
 * API route to fetch and aggregate all data required for the Branding Dashboard.
 */
export async function GET() {
  try {
    await dbConnect();

    // Fetch all necessary data concurrently for performance
    const [campaigns, proposals, allTrainsets] = await Promise.all([
      BrandingCampaign.find({ status: 'Active' }),
      BrandingProposal.find({ status: 'Pending' }).sort({ submittedDate: -1 }),
      Trainset.find({}).select('_id branding') // Only select necessary fields
    ]);

    // Determine which trainsets are available for branding
    const brandedTrainsetIds = new Set(campaigns.map(c => c.trainsetId));
    const availableTrainsets = allTrainsets
      .filter(t => !brandedTrainsetIds.has(t._id))
      .map(t => t._id);

    return NextResponse.json({
      success: true,
      data: {
        campaigns,
        proposals,
        availableTrainsets,
      },
    });

  } catch (error) {
    console.error('Branding Summary API Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
