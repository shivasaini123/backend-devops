import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

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
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 for missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({})
        .expect(400);
    });

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          fullName: 'John Doe',
          email: 'not-an-email',
          phone: '+1234567890',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          acceptTerms: true,
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 for missing fields', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({})
        .expect(400);
    });

    it('should return 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'WrongPass123!',
        })
        .expect(401);
    });
  });

  describe('GET /api/users/profile', () => {
    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/users/profile')
        .expect(401);
    });
  });
});
