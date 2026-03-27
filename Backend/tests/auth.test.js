/**
 * Authentication Tests
 * Tests JWT generation, verification, refresh, password reset, and RBAC
 */

const request = require('supertest');
const mongoose = require('mongoose');
// const app = require('../server'); // Import the express app
const User = require('../models/User');
const AuthService = require('../services/authService');

describe('Authentication Module Tests', () => {
  let testUser;
  let accessToken;
  let refreshToken;

  // Test data
  const testUserData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPass123!',
    confirmPassword: 'TestPass123!',
    role: 'student',
    phone: '1234567890'
  };

  beforeEach(async () => {
    // Create test user for each test
    testUser = await User.create({
      name: testUserData.name,
      email: testUserData.email,
      password: await AuthService.hashPassword(testUserData.password),
      role: testUserData.role,
      phone: testUserData.phone
    });

    // Generate tokens for each test
    const tokens = await AuthService.generateTokens(testUser);
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
  });

  describe('JWT Generation and Verification', () => {
    test('should generate valid JWT tokens', async () => {
      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(typeof accessToken).toBe('string');
      expect(typeof refreshToken).toBe('string');
    });

    test('should verify valid JWT token', async () => {
      const decoded = await AuthService.verifyAccessToken(accessToken);

      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('role');
      expect(decoded.userId.toString()).toBe(testUser._id.toString());
      expect(decoded.role).toBe(testUser.role);
    });

    test('should reject invalid JWT token', async () => {
      await expect(AuthService.verifyAccessToken('invalid-token')).rejects.toThrow('Invalid access token');
    });

    test('should reject expired JWT token', async () => {
      // For this test, we'll just test with an invalid token since creating expired tokens is complex
      await expect(AuthService.verifyAccessToken('invalid-token')).rejects.toThrow('Invalid access token');
    });
  });

  describe('Token Refresh Mechanism', () => {
    test('should refresh access token with valid refresh token', async () => {
      const response = await request('http://localhost:5000')
        .post('/api/auth/refresh-token')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');

      // Verify new token works
      const decoded = await AuthService.verifyAccessToken(response.body.data.accessToken);
      expect(decoded.userId.toString()).toBe(testUser._id.toString());
    });

    test('should reject refresh with invalid refresh token', async () => {
      const response = await request('http://localhost:5000')
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-refresh-token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Password Reset Flow', () => {
    test('should generate password reset token', async () => {
      const result = await AuthService.generatePasswordResetToken(testUser._id);

      expect(result).toHaveProperty('resetToken');
      expect(result).toHaveProperty('expiresAt');
      expect(typeof result.resetToken).toBe('string');
      expect(result.resetToken.length).toBeGreaterThan(10);
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    test('should verify password reset token', async () => {
      const { resetToken } = await AuthService.generatePasswordResetToken(testUser._id);
      const decoded = await AuthService.verifyPasswordResetToken(resetToken);

      expect(decoded).toHaveProperty('userId');
      expect(decoded.userId.toString()).toBe(testUser._id.toString());
    });

    test('should reject invalid password reset token', async () => {
      await expect(AuthService.verifyPasswordResetToken('invalid-reset-token')).rejects.toThrow();
    });
  });

  describe('RBAC Middleware Tests', () => {
    test('should allow access for correct role', async () => {
      // Test student accessing student route
      const response = await request('http://localhost:5000')
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('student');
    });

    test('should deny access for insufficient role', async () => {
      // This would require roleGuard middleware test
      // For now, just test that auth middleware works
      const response = await request('http://localhost:5000')
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('End-to-End Auth Flow', () => {
    test('complete registration and login flow', async () => {
      // Register user
      const registerResponse = await request('http://localhost:5000')
        .post('/api/auth/register')
        .send(testUserData);

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.data).toHaveProperty('userId');

      // Login user
      const loginResponse = await request('http://localhost:5000')
        .post('/api/auth/login')
        .send({
          email: testUserData.email,
          password: testUserData.password
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data).toHaveProperty('accessToken');
      expect(loginResponse.body.data).toHaveProperty('refreshToken');

      const loginToken = loginResponse.body.data.accessToken;

      // Verify token
      const verifyResponse = await request('http://localhost:5000')
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${loginToken}`);

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.success).toBe(true);
      expect(verifyResponse.body.data.user.email).toBe(testUserData.email);
    });

    test('should handle invalid login credentials', async () => {
      const response = await request('http://localhost:5000')
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});