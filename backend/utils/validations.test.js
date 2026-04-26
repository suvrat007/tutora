const { signupValidation, logInValidation } = require('./validations');

const validSignup = {
    name: 'Admin User',
    emailId: 'admin@example.com',
    password: 'secret123',
    institute_info: {
        instiName: 'Test Institute',
        logo_URL: '',
        instituteEmailId: 'inst@example.com',
        phone_number: '+91 9876543210',
    },
};

describe('signupValidation', () => {
    it('accepts a fully valid payload', () => {
        const { error } = signupValidation.validate(validSignup);
        expect(error).toBeUndefined();
    });

    it('rejects when emailId is missing', () => {
        const { name, emailId, ...rest } = validSignup;
        const { error } = signupValidation.validate({ name, ...rest });
        expect(error).toBeDefined();
    });

    it('rejects an invalid email format', () => {
        const { error } = signupValidation.validate({
            ...validSignup,
            emailId: 'not-an-email',
        });
        expect(error).toBeDefined();
    });

    it('rejects a password shorter than 6 characters', () => {
        const { error } = signupValidation.validate({ ...validSignup, password: '123' });
        expect(error).toBeDefined();
    });

    it('accepts phone numbers with +, spaces, and hyphens', () => {
        const variants = ['+1-800-555-1234', '+44 20 7946 0958', '9876543210'];
        for (const phone_number of variants) {
            const { error } = signupValidation.validate({
                ...validSignup,
                institute_info: { ...validSignup.institute_info, phone_number },
            });
            expect(error).toBeUndefined();
        }
    });

    it('rejects a phone number that is too short', () => {
        const { error } = signupValidation.validate({
            ...validSignup,
            institute_info: { ...validSignup.institute_info, phone_number: '123' },
        });
        expect(error).toBeDefined();
    });
});

describe('logInValidation', () => {
    it('accepts valid credentials', () => {
        const { error } = logInValidation.validate({
            emailId: 'admin@example.com',
            password: 'pass123',
        });
        expect(error).toBeUndefined();
    });

    it('rejects a password shorter than 6 characters', () => {
        const { error } = logInValidation.validate({
            emailId: 'admin@example.com',
            password: '123',
        });
        expect(error).toBeDefined();
    });

    it('rejects an invalid email', () => {
        const { error } = logInValidation.validate({
            emailId: 'notanemail',
            password: 'pass123',
        });
        expect(error).toBeDefined();
    });
});
