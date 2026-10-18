import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { AppError } from '../../middleware/error.middleware';

const SALT_ROUNDS = 10;

export class AuthService {
  private repo = new AuthRepository();

  /**
   * Register a new user.
   * Handles password hashing and profile creation.
   */
  async register(data: {
    fullName: string;
    email: string;
    mobile: string;
    password: string;
    role: string;
    // Student-specific
    rollNumber?: string;
    course?: string;
    // Staff-specific
    staffType?: string;
  }) {
    // Check for duplicate email
    const existingEmail = await this.repo.findByEmail(data.email);
    if (existingEmail) {
      throw new AppError('Email already registered', 409);
    }

    // Check for duplicate mobile
    const existingMobile = await this.repo.findByMobile(data.mobile);
    if (existingMobile) {
      throw new AppError('Mobile number already registered', 409);
    }

    // Check for duplicate roll number (students)
    if (data.role === 'STUDENT' && data.rollNumber) {
      const existingRoll = await this.repo.findByRollNumber(data.rollNumber);
      if (existingRoll) {
        throw new AppError('Roll number already registered', 409);
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user
    const userId = await this.repo.createUser(
      data.fullName,
      data.email,
      data.mobile,
      passwordHash,
      data.role
    );

    // Create role-specific profile
    if (data.role === 'STUDENT' && data.rollNumber) {
      await this.repo.createStudentProfile(
        userId,
        data.rollNumber,
        data.course || ''
      );
    } else if (data.role === 'STAFF' && data.staffType) {
      await this.repo.createStaffProfile(userId, data.staffType);
    }

    // Generate JWT
    const token = this.generateToken(userId, data.role as any);

    return {
      user: {
        userId,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
      },
      token,
    };
  }

  /**
   * Authenticate user with email and password.
   */
  async login(email: string, password: string) {
    const user = await this.repo.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.is_active) {
      throw new AppError('Account is deactivated. Contact admin.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(user.user_id, user.role);

    return {
      user: {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  /**
   * Get current user profile (from JWT).
   */
  async getMe(userId: number) {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Fetch role-specific profile
    let profile: any = null;
    if (user.role === 'STUDENT') {
      profile = await this.repo.getStudentProfile(userId);
    } else if (user.role === 'STAFF') {
      profile = await this.repo.getStaffProfile(userId);
    }

    return {
      userId: user.user_id,
      fullName: user.full_name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      profile,
    };
  }

  /**
   * Generate a JWT token.
   */
  private generateToken(userId: number, role: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError('JWT_SECRET not configured', 500);
    }
    return jwt.sign(
      { userId, role },
      secret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as any }
    );
  }
}
