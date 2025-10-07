import { NextResponse } from 'next/server';
import dbConnect from '../../dbconnect';
import User from '../../../models/user';

/**
 * API Route to get the currently authenticated user's profile.
 * In a real application, this would be protected and would use a session token (JWT)
 * to identify the user. For this example, we will hardcode it to fetch the admin.
 */
export async function GET() {
  try {
    await dbConnect();

    // In a real app, you'd decode a JWT here to get the userId.
    // For this example, we fetch the admin user directly by their employeeId.
    const adminEmployeeId = 'KMRL-001';

    const user = await User.findOne({ employeeId: adminEmployeeId }).select('-passwordHash'); // Exclude the password hash for security

    if (!user) {
      return NextResponse.json({ success: false, error: 'Admin user not found' }, { status: 404 });
    }
    
    // The frontend expects an avatarUrl, which is not in our schema.
    // We can add it to the response object dynamically.
    const userProfile = {
        ...user.toObject(),
        avatarUrl: `https://i.pravatar.cc/150?u=${user.employeeId}` // Generate a consistent placeholder avatar
    };

    return NextResponse.json({ success: true, data: userProfile });

  } catch (error) {
    console.error('API /api/auth/me Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

