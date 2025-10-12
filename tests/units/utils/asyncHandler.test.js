/* eslint-disable no-undef */
const asyncHandler = require('../../../src/utils/asyncHandler');

describe('asyncHandler Utility Unit Tests', () => {
    let req, res, next;

    it('should wrap controller', () => {
        const mockController = jest
            .fn()
            .mockImplementation((req, res, next) => {
                return next;
            });

        asyncHandler(mockController)(req, res, next);
    });
});
