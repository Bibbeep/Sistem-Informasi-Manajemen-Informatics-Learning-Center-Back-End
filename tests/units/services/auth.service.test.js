/* eslint-disable no-undef */
const AuthService = require('../../../src/services/auth.service');
const User = require('../../../src/db/models/user');

fn.mock('bcrypt');
fn.mock('../../../src/db/models/user');

describe('Authentication Service Unit Tests', () => {
    describe('register Tests', () => {
        it('should create a new user and return user data', async () => {
            //
        });

        it('should throw error if user already exists', async () => {
            //
        });

        it('should throw error if User.create fails', async () => {
            //
        });
    });
});
