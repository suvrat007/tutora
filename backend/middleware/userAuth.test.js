const jwt = require('jsonwebtoken');

process.env.JWT_KEY = 'test-secret';
const userAuth = require('./userAuth');

describe('userAuth middleware', () => {
    it('sends 401 when no token cookie is present', () => {
        const req = { cookies: {} };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next = jest.fn();

        userAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Token not Found');
        expect(next).not.toHaveBeenCalled();
    });

    it('sets req.adminId and req.instituteId then calls next() for a valid token', () => {
        const token = jwt.sign(
            { _id: 'admin123', instituteId: 'inst456' },
            'test-secret'
        );
        const req = { cookies: { token } };
        const res = {};
        const next = jest.fn();

        userAuth(req, res, next);

        expect(req.adminId).toBe('admin123');
        expect(req.instituteId).toBe('inst456');
        expect(next).toHaveBeenCalled();
    });

    it('sets req.instituteId to null when payload has no instituteId', () => {
        const token = jwt.sign({ _id: 'admin123' }, 'test-secret');
        const req = { cookies: { token } };
        const res = {};
        const next = jest.fn();

        userAuth(req, res, next);

        expect(req.instituteId).toBeNull();
    });

    it('sends 401 for a tampered / invalid token', () => {
        const req = { cookies: { token: 'invalid.token.value' } };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next = jest.fn();

        userAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('sends 401 for a token signed with a different secret', () => {
        const token = jwt.sign({ _id: 'admin123' }, 'wrong-secret');
        const req = { cookies: { token } };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next = jest.fn();

        userAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
    });
});
