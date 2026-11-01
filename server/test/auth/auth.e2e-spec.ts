import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';

describe('Authentication & User Module (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await dataSource.query('DELETE FROM user_profiles');
    await dataSource.query('DELETE FROM users');
  });

  describe('POST /auth/register - User Registration', () => {
    const validUser = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123',
      role: 'allrounder',
      battingStyle: 'right_hand',
      bowlingStyle: 'right_arm_fast',
      experienceYears: 5,
      bio: 'Experienced cricket player',
    };

    it('should successfully register a valid user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email', validUser.email.toLowerCase());
      expect(response.body.data).toHaveProperty('name', validUser.name);
      expect(response.body.data).not.toHaveProperty('password');
      expect(response.body.message).toBe('User registered successfully');
    });

    it('should reject registration with existing email', async () => {
      // Register first user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(validUser)
        .expect(201);

      // Try to register with same email
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          name: 'Jane Doe',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should reject registration with invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('valid email');
    });

    it('should reject registration with weak password (less than 8 chars)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          password: 'weak',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('at least 8 characters');
    });

    it('should reject registration with password without uppercase letter', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          password: 'lowercase123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('uppercase');
    });

    it('should reject registration with password without lowercase letter', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          password: 'UPPERCASE123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('lowercase');
    });

    it('should reject registration with password without number', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          password: 'NoNumbers',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('number');
    });

    it('should reject registration with common password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          password: 'Password123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('stronger password');
    });

    it('should reject registration with password containing sequences', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          password: 'Abcdef123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('sequences');
    });

    it('should reject registration with name less than 2 characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          name: 'J',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('at least 2 characters');
    });

    it('should reject registration with name containing numbers', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          name: 'John123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('only letters');
    });

    it('should reject registration with name containing special characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          name: 'John@Doe',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('only letters');
    });

    it('should reject registration with name more than 50 characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          name: 'A'.repeat(51),
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('50 characters');
    });

    it('should reject registration with email more than 100 characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          email: `${'a'.repeat(90)}@example.com`,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('100 characters');
    });

    it('should reject registration with negative experience years', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          experienceYears: -1,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('negative');
    });

    it('should reject registration with experience years > 50', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          experienceYears: 51,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('50');
    });

    it('should reject registration with bio more than 500 characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          bio: 'A'.repeat(501),
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('500 characters');
    });

    it('should reject registration with leading/trailing spaces in email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          email: '  john@example.com  ',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('spaces');
    });

    it('should handle registration with minimal valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'SecurePass456',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });
  });

  describe('POST /auth/login - User Login', () => {
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'LoginTest123',
    };

    beforeEach(async () => {
      // Register test user before login tests
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);
    });

    it('should successfully login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('access_token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('email', testUser.email.toLowerCase());
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.message).toBe('Login successful');
    });

    it('should reject login with non-existent email (generic error)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      // Should use generic error message to prevent user enumeration
      expect(response.body.message).toBe('Invalid email or password');
      expect(response.body.message).not.toContain('not found');
    });

    it('should reject login with invalid password (generic error)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      // Should use generic error message
      expect(response.body.message).toBe('Invalid email or password');
      expect(response.body.message).not.toContain('incorrect');
    });

    it('should reject login with invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: testUser.password,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('valid email');
    });

    it('should reject login with password less than 8 characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'short',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('at least 8 characters');
    });

    it('should reject login with empty email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: '',
          password: testUser.password,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject login with empty password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: '',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle case-insensitive email (uppercase)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: testUser.password,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('access_token');
    });
  });

  describe('GET /auth/me - Get Current User', () => {
    const testUser = {
      name: 'Auth Test User',
      email: 'authtest@example.com',
      password: 'AuthToken123',
    };

    let authToken: string;

    beforeEach(async () => {
      // Register and login to get token
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      authToken = loginResponse.body.data.access_token;
    });

    it('should get current user with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email', testUser.email.toLowerCase());
      expect(response.body.data).toHaveProperty('name', testUser.name);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject request with malformed authorization header', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', authToken) // Missing 'Bearer'
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('User Profile Management', () => {
    const testUser = {
      name: 'Profile User',
      email: 'profile@example.com',
      password: 'ProfilePass123',
    };

    let authToken: string;

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      authToken = loginResponse.body.data.access_token;
    });

    describe('POST /user/profile - Create Profile', () => {
      it('should create user profile successfully', async () => {
        const profileData = {
          role: 'allrounder' as const,
          battingStyle: 'right_hand' as const,
          bowlingStyle: 'right_arm_fast' as const,
          experienceYears: 5,
          bio: 'Experienced player',
        };

        const response = await request(app.getHttpServer())
          .post('/user/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .send(profileData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.role).toBe(profileData.role);
      });

      it('should reject duplicate profile creation', async () => {
        const profileData = {
          role: 'batsman' as const,
        };

        // Create first profile
        await request(app.getHttpServer())
          .post('/user/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .send(profileData)
          .expect(201);

        // Try to create again
        const response = await request(app.getHttpServer())
          .post('/user/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .send(profileData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('already exists');
      });
    });

    describe('PATCH /user/profile - Update Profile', () => {
      beforeEach(async () => {
        // Create initial profile
        await request(app.getHttpServer())
          .post('/user/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            role: 'batsman',
            experienceYears: 2,
          });
      });

      it('should update user profile successfully', async () => {
        const response = await request(app.getHttpServer())
          .patch('/user/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            role: 'allrounder',
            experienceYears: 5,
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.role).toBe('allrounder');
      });

      it('should reject invalid role enum value', async () => {
        const response = await request(app.getHttpServer())
          .patch('/user/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            role: 'invalid_role',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });
  });
});
