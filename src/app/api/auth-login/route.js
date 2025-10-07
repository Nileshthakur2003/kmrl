import { NextResponse } from 'next/server';
import dbConnect from '../dbconnect';
import User from '../../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Handles POST requests to authenticate a user and provide a session token.
 * @param {import('next/server').NextRequest} request
 */
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { employeeId, password } = body;

    // 1. Validate input
    if (!employeeId || !password) {
      return NextResponse.json(
        { success: false, error: 'Employee ID and password are required.' },
        { status: 400 }
      );
    }

    // 2. Find the user by their employeeId
    const user = await User.findOne({ employeeId }).select('+passwordHash'); // Explicitly include passwordHash

    if (!user) {
      // User not found
      return NextResponse.json(
        { success: false, error: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    // 3. Compare the provided password with the stored hash
    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordMatch) {
      // Passwords do not match
      return NextResponse.json(
        { success: false, error: 'Invalid credentials.' },
        { status: 401 }
      );
    }
    
    // Check if the user account is active
    if (!user.isActive) {
        return NextResponse.json(
            { success: false, error: 'This account has been disabled.'},
            { status: 403 } // 403 Forbidden
        );
    }

    // 4. If credentials are correct, create a JWT
    const payload = {
      id: user._id,
      employeeId: user.employeeId,
      role: user.role,
    };

    // Sign the token with a secret key and set an expiration time
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d', // Token expires in 1 day
    });

    // 5. Prepare user data to be sent back (without the password)
    const userResponse = {
        _id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
        email: user.contact.email
    };

    // 6. Create a success response and set the token in a secure, httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful!',
      user: userResponse,
    }, { status: 200 });

    response.cookies.set('token', token, {
      httpOnly: true, // The cookie is not accessible via client-side JavaScript
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict', // Helps prevent CSRF attacks
      maxAge: 60 * 60 * 24, // 1 day in seconds
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
