/* eslint-disable no-undef */
jest.mock('../../../src/services/discussion.service');
jest.mock('../../../src/validations/validator');

const {
    getAll,
    getById,
} = require('../../../src/controllers/discussion.controller');
const DiscussionService = require('../../../src/services/discussion.service');
const {
    validateDiscussionQuery,
} = require('../../../src/validations/validator');
const { ValidationError } = require('joi');

describe('Discussion Controller Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            query: {},
            params: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll Tests', () => {
        it('should return 200 with discussions and pagination on success', async () => {
            const mockQuery = { page: 1, limit: 10, sort: 'id' };
            const mockServiceResponse = {
                pagination: { totalRecords: 1 },
                discussions: [{ id: 1, title: 'Test Discussion' }],
            };
            validateDiscussionQuery.mockReturnValue({
                error: null,
                value: mockQuery,
            });
            DiscussionService.getMany.mockResolvedValue(mockServiceResponse);

            await getAll(req, res, next);

            expect(validateDiscussionQuery).toHaveBeenCalledWith(req.query);
            expect(DiscussionService.getMany).toHaveBeenCalledWith(mockQuery);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved all discussion forums.',
                data: {
                    discussions: mockServiceResponse.discussions,
                },
                pagination: mockServiceResponse.pagination,
                errors: null,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with a validation error if query params are invalid', async () => {
            const validationError = new ValidationError('Validation failed');
            validateDiscussionQuery.mockReturnValue({ error: validationError });

            await getAll(req, res, next);

            expect(validateDiscussionQuery).toHaveBeenCalledWith(req.query);
            expect(DiscussionService.getMany).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(validationError);
        });

        it('should forward service errors to the next middleware', async () => {
            const mockQuery = { page: 1, limit: 10, sort: 'id' };
            const serviceError = new Error('Service error');
            validateDiscussionQuery.mockReturnValue({
                error: null,
                value: mockQuery,
            });
            DiscussionService.getMany.mockRejectedValue(serviceError);

            await getAll(req, res, next);

            expect(validateDiscussionQuery).toHaveBeenCalledWith(req.query);
            expect(DiscussionService.getMany).toHaveBeenCalledWith(mockQuery);
            expect(next).toHaveBeenCalledWith(serviceError);
        });
    });

    describe('getById Tests', () => {
        it('should return 200 with discussion details on success', async () => {
            req.params.discussionId = '1';
            const mockDiscussion = { id: 1, title: 'Test Discussion' };
            DiscussionService.getOne.mockResolvedValue(mockDiscussion);

            await getById(req, res, next);

            expect(DiscussionService.getOne).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved discussion forum details.',
                data: {
                    discussion: mockDiscussion,
                },
                errors: null,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should forward service errors to the next middleware', async () => {
            req.params.discussionId = '999';
            const serviceError = new Error('Service error');
            DiscussionService.getOne.mockRejectedValue(serviceError);

            await getById(req, res, next);

            expect(DiscussionService.getOne).toHaveBeenCalledWith(999);
            expect(next).toHaveBeenCalledWith(serviceError);
        });
    });
});
