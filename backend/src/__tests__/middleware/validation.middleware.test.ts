import { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { validateRequest } from '../../middleware/validation.middleware';

describe('validateRequest middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Mock Express request
    mockReq = {
      body: {},
    };

    // Mock Express response avec chaînage
    mockRes = {
      status: vi.fn().mockReturnThis(), // Permet res.status().json()
      json: vi.fn(),
    };

    // Mock next function
    mockNext = vi.fn();
  });

  it('should call next() when validation passes', async () => {
    const schema = z.object({
      name: z.string(),
    });

    mockReq.body = { name: 'Test Project' };

    const middleware = validateRequest(schema);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith(); // Appelé sans argument
    expect(mockRes.status).not.toHaveBeenCalled(); // Pas d'erreur
  });

  it('should transform req.body with validated data', async () => {
    const schema = z.object({
      name: z.string().trim(),
      count: z.number().default(0),
    });

    mockReq.body = {
      name: '  Test Project  ', // Espaces avant/après
      // count manquant → doit avoir default 0
    };

    const middleware = validateRequest(schema);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    // Vérifier que req.body a été transformé
    expect(mockReq.body).toEqual({
      name: 'Test Project', // Trimmed
      count: 0, // Default appliqué
    });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 400 with formatted errors when validation fails', async () => {
    const schema = z.object({
      name: z.string().min(3, 'Name must be at least 3 characters'),
      age: z.number().min(18, 'Must be at least 18'),
    });

    mockReq.body = {
      name: 'Ab', // Trop court (min 3)
      age: 15, // Trop jeune (min 18)
    };

    const middleware = validateRequest(schema);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    // Vérifier que res.status(400).json() a été appelé
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Validation failed',
      details: expect.arrayContaining([
        expect.objectContaining({
          field: 'name',
          message: 'Name must be at least 3 characters',
        }),
        expect.objectContaining({
          field: 'age',
          message: 'Must be at least 18',
        }),
      ]),
    });

    // next() ne doit PAS être appelé
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should pass unknown errors to next()', async () => {
    // Schema qui lance une erreur custom (pas ZodError)
    const schema = z
      .object({
        name: z.string(),
      })
      .refine(() => {
        throw new Error('Custom error'); // Erreur inattendue
      });

    mockReq.body = { name: 'Test' };

    const middleware = validateRequest(schema);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    // next() doit être appelé avec l'erreur
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Custom error',
      }),
    );

    // res.status() ne doit PAS être appelé (erreur non gérée ici)
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  
});
