/* eslint-disable no-undef */
jest.mock('multer');
const multer = require('multer');
const { upload } = require('../../../src/middlewares/multer.middleware');

describe('Multer Middleware Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('upload Tests', () => {
        it('should return multer object', () => {
            const mockFilter = jest.fn();
            multer.mockReturnValue(jest.fn());

            expect(upload(mockFilter)).not.toThrow();
        });
    });
});
