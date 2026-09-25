import { requireAuth } from '../middleware/auth.js';

describe('requireAuth', () => {
  it('returns 401 when no authorization header is provided', () => {
    const req = { headers: {} };
    let statusCode;
    let nextCalled = false;

    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: () => {},
        };
      },
    };

    const next = () => {
      nextCalled = true;
    };

    requireAuth(req, res, next);

    expect(statusCode).toBe(401);
    expect(nextCalled).toBe(false);
  });
});
