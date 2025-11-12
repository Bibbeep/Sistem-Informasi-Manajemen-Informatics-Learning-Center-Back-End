/* eslint-disable no-undef */
jest.mock('../../../src/services/discussion.service');
jest.mock('../../../src/validations/validator');
const {
    getAll,
    getById,
    create,
    updateById,
    deleteById,
    getAllComments,
    getCommentById,
    createComment,
    updateCommentById,
    deleteCommentById,
    createLike,
    deleteLike,
} = require('../../../src/controllers/discussion.controller');
const DiscussionService = require('../../../src/services/discussion.service');
const {
    validateDiscussionQuery,
    validateDiscussion,
    validateUpdateDiscussionData,
    validateCommentQuery,
    validateCommentByIdQuery,
    validateComment,
    validateUpdateCommentData,
} = require('../../../src/validations/validator');
const { ValidationError } = require('joi');
const HTTPError = require('../../../src/utils/httpError');

describe('Discussion Controller Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            query: {},
            params: {},
            body: {},
            tokenPayload: {},
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

    describe('create Tests', () => {
        it('should return 201 with created discussion on success', async () => {
            req.body = { title: 'New Discussion' };
            req.tokenPayload = { sub: '1' };
            const mockValue = { title: 'New Discussion' };
            const mockDiscussion = { id: 1, title: 'New Discussion' };
            validateDiscussion.mockReturnValue({
                error: null,
                value: mockValue,
            });
            DiscussionService.create.mockResolvedValue(mockDiscussion);

            await create(req, res, next);

            expect(validateDiscussion).toHaveBeenCalledWith(req.body);
            expect(DiscussionService.create).toHaveBeenCalledWith({
                ...mockValue,
                adminUserId: 1,
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 201,
                message: 'Successfully created a discussion forum.',
                data: {
                    discussion: mockDiscussion,
                },
                errors: null,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with a validation error if body is invalid', async () => {
            req.body = { title: '' };
            const validationError = new ValidationError('Validation failed');
            validateDiscussion.mockReturnValue({ error: validationError });

            await create(req, res, next);

            expect(validateDiscussion).toHaveBeenCalledWith(req.body);
            expect(DiscussionService.create).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(validationError);
        });

        it('should forward service errors to the next middleware', async () => {
            req.body = { title: 'New Discussion' };
            req.tokenPayload = { sub: '1' };
            const mockValue = { title: 'New Discussion' };
            const serviceError = new Error('Service error');
            validateDiscussion.mockReturnValue({
                error: null,
                value: mockValue,
            });
            DiscussionService.create.mockRejectedValue(serviceError);

            await create(req, res, next);

            expect(validateDiscussion).toHaveBeenCalledWith(req.body);
            expect(DiscussionService.create).toHaveBeenCalledWith({
                ...mockValue,
                adminUserId: 1,
            });
            expect(next).toHaveBeenCalledWith(serviceError);
        });
    });

    describe('updateById Tests', () => {
        it('should return 200 with updated discussion on success', async () => {
            req.params.discussionId = '1';
            req.body = { title: 'Updated Title' };
            const mockValue = { title: 'Updated Title' };
            const mockUpdatedDiscussion = { id: 1, title: 'Updated Title' };
            validateUpdateDiscussionData.mockReturnValue({
                error: null,
                value: mockValue,
            });
            DiscussionService.updateOne.mockResolvedValue(
                mockUpdatedDiscussion,
            );

            await updateById(req, res, next);

            expect(validateUpdateDiscussionData).toHaveBeenCalledWith(req.body);
            expect(DiscussionService.updateOne).toHaveBeenCalledWith({
                ...mockValue,
                discussionId: 1,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 200,
                message: 'Successfully updated a discussion forum.',
                data: {
                    discussion: mockUpdatedDiscussion,
                },
                errors: null,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with a validation error if body is invalid', async () => {
            req.params.discussionId = '1';
            req.body = { title: '' };
            const validationError = new ValidationError('Validation failed');
            validateUpdateDiscussionData.mockReturnValue({
                error: validationError,
            });

            await updateById(req, res, next);

            expect(validateUpdateDiscussionData).toHaveBeenCalledWith(req.body);
            expect(DiscussionService.updateOne).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(validationError);
        });

        it('should forward service errors to the next middleware', async () => {
            req.params.discussionId = '1';
            req.body = { title: 'Updated Title' };
            const mockValue = { title: 'Updated Title' };
            const serviceError = new Error('Service error');
            validateUpdateDiscussionData.mockReturnValue({
                error: null,
                value: mockValue,
            });
            DiscussionService.updateOne.mockRejectedValue(serviceError);

            await updateById(req, res, next);

            expect(validateUpdateDiscussionData).toHaveBeenCalledWith(req.body);
            expect(DiscussionService.updateOne).toHaveBeenCalledWith({
                ...mockValue,
                discussionId: 1,
            });
            expect(next).toHaveBeenCalledWith(serviceError);
        });
    });

    describe('deleteById Tests', () => {
        it('should return 200 on successful deletion', async () => {
            req.params.discussionId = '1';
            DiscussionService.deleteOne.mockResolvedValue();

            await deleteById(req, res, next);

            expect(DiscussionService.deleteOne).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 200,
                message: 'Successfully deleted a discussion forum.',
                data: null,
                errors: null,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should forward service errors to the next middleware', async () => {
            req.params.discussionId = '999';
            const serviceError = new Error('Service error');
            DiscussionService.deleteOne.mockRejectedValue(serviceError);

            await deleteById(req, res, next);

            expect(DiscussionService.deleteOne).toHaveBeenCalledWith(999);
            expect(next).toHaveBeenCalledWith(serviceError);
        });
    });

    describe('getAllComments Tests', () => {
        beforeEach(() => {
            req.params.discussionId = '1';
        });

        it('should return 200 with comments and pagination on success', async () => {
            const mockQuery = { page: 1, limit: 10, sort: 'id' };
            const mockDiscussionId = parseInt(req.params.discussionId, 10);
            const mockServiceResponse = {
                pagination: { totalRecords: 5 },
                comments: [
                    {
                        id: 1,
                        message: 'Test Comment',
                        userId: 1,
                        fullName: 'Test User',
                    },
                ],
            };
            validateCommentQuery.mockReturnValue({
                error: null,
                value: mockQuery,
            });
            DiscussionService.getManyComments.mockResolvedValue(
                mockServiceResponse,
            );

            await getAllComments(req, res, next);

            expect(validateCommentQuery).toHaveBeenCalledWith(req.query);
            expect(DiscussionService.getManyComments).toHaveBeenCalledWith({
                ...mockQuery,
                discussionId: mockDiscussionId,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved all comments.',
                data: {
                    comments: mockServiceResponse.comments,
                },
                pagination: mockServiceResponse.pagination,
                errors: null,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with a validation error if query params are invalid', async () => {
            const validationError = new ValidationError('Validation failed');
            validateCommentQuery.mockReturnValue({ error: validationError });

            await getAllComments(req, res, next);

            expect(validateCommentQuery).toHaveBeenCalledWith(req.query);
            expect(DiscussionService.getManyComments).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(validationError);
        });

        it('should forward service errors (like 404) to the next middleware', async () => {
            const mockQuery = { page: 1, limit: 10, sort: 'id' };
            const mockDiscussionId = 999;
            req.params.discussionId = mockDiscussionId.toString();
            const serviceError = new HTTPError(404, 'Resource not found.');
            validateCommentQuery.mockReturnValue({
                error: null,
                value: mockQuery,
            });
            DiscussionService.getManyComments.mockRejectedValue(serviceError);

            await getAllComments(req, res, next);

            expect(validateCommentQuery).toHaveBeenCalledWith(req.query);
            expect(DiscussionService.getManyComments).toHaveBeenCalledWith({
                ...mockQuery,
                discussionId: mockDiscussionId,
            });
            expect(next).toHaveBeenCalledWith(serviceError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('getCommentById Tests', () => {
        beforeEach(() => {
            req.params = { discussionId: '1', commentId: '5' };
        });

        it('should return 200 with comment details on success (no replies)', async () => {
            const mockQuery = { includeReplies: false };
            const mockDiscussionId = parseInt(req.params.discussionId, 10);
            const mockCommentId = parseInt(req.params.commentId, 10);
            const mockCommentResponse = {
                id: mockCommentId,
                message: 'Test Comment',
                userId: 1,
                userName: 'Test User',
                likesCount: 2,
                repliesCount: 0,
            };
            validateCommentByIdQuery.mockReturnValue({
                error: null,
                value: mockQuery,
            });
            DiscussionService.getOneComment.mockResolvedValue(
                mockCommentResponse,
            );

            await getCommentById(req, res, next);

            expect(validateCommentByIdQuery).toHaveBeenCalledWith(req.query);
            expect(DiscussionService.getOneComment).toHaveBeenCalledWith({
                discussionId: mockDiscussionId,
                commentId: mockCommentId,
                includeReplies: false,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved a comment details.',
                data: {
                    comment: mockCommentResponse,
                },
                errors: null,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 200 with comment details and replies on success', async () => {
            req.query = { includeReplies: 'true' };
            const mockQuery = { includeReplies: true };
            const mockDiscussionId = parseInt(req.params.discussionId, 10);
            const mockCommentId = parseInt(req.params.commentId, 10);
            const mockCommentResponse = {
                id: mockCommentId,
                message: 'Test Comment',
                likesCount: 2,
                repliesCount: 1,
                replies: [{ id: 6, message: 'Reply 1' }],
            };
            validateCommentByIdQuery.mockReturnValue({
                error: null,
                value: mockQuery,
            });
            DiscussionService.getOneComment.mockResolvedValue(
                mockCommentResponse,
            );

            await getCommentById(req, res, next);

            expect(validateCommentByIdQuery).toHaveBeenCalledWith(req.query);
            expect(DiscussionService.getOneComment).toHaveBeenCalledWith({
                discussionId: mockDiscussionId,
                commentId: mockCommentId,
                includeReplies: true,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { comment: mockCommentResponse },
                }),
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with a validation error if query params are invalid', async () => {
            req.query = { includeReplies: 'abc' };
            const validationError = new ValidationError('Validation failed');
            validateCommentByIdQuery.mockReturnValue({
                error: validationError,
            });

            await getCommentById(req, res, next);

            expect(validateCommentByIdQuery).toHaveBeenCalledWith(req.query);
            expect(DiscussionService.getOneComment).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(validationError);
        });

        it('should forward service errors (like 404) to the next middleware', async () => {
            req.params.commentId = '999';
            const mockQuery = { includeReplies: false };
            const mockDiscussionId = parseInt(req.params.discussionId, 10);
            const mockCommentId = 999;
            const serviceError = new HTTPError(404, 'Resource not found.');
            validateCommentByIdQuery.mockReturnValue({
                error: null,
                value: mockQuery,
            });
            DiscussionService.getOneComment.mockRejectedValue(serviceError);

            await getCommentById(req, res, next);

            expect(validateCommentByIdQuery).toHaveBeenCalledWith(req.query);
            expect(DiscussionService.getOneComment).toHaveBeenCalledWith({
                discussionId: mockDiscussionId,
                commentId: mockCommentId,
                includeReplies: false,
            });
            expect(next).toHaveBeenCalledWith(serviceError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('createComment Tests', () => {
        it('should call res with 201', async () => {
            req.params.discussionId = '1';
            req.tokenPayload.sub = 1;
            req.body = {
                parentCommentId: 1,
                message: 'HEY',
            };
            const mockValue = {
                parentCommentId: 1,
                message: 'HEY',
            };
            const mockComment = {
                id: 1,
            };
            validateComment.mockReturnValue({ value: mockValue });
            DiscussionService.createComment.mockResolvedValue(mockComment);

            await createComment(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 201,
                message: 'Successfully created a comment.',
                data: {
                    comment: mockComment,
                },
                errors: null,
            });
        });

        it('should call next with Joi error', async () => {
            req.params.discussionId = '1';
            req.tokenPayload.sub = 1;
            req.body = {
                parentCommentId: true,
                message: 123,
            };
            const mockError = new ValidationError();
            validateComment.mockReturnValue({ error: mockError });

            await createComment(req, res, next);

            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should forwards service error', async () => {
            req.params.discussionId = '1';
            req.tokenPayload.sub = 1;
            req.body = {
                parentCommentId: 1,
                message: 'HEY',
            };
            const mockValue = {
                parentCommentId: 1,
                message: 'HEY',
            };
            const mockServiceError = new Error('BOOM');
            validateComment.mockReturnValue({ value: mockValue });
            DiscussionService.createComment.mockRejectedValue(mockServiceError);

            await createComment(req, res, next);

            expect(next).toHaveBeenCalledWith(mockServiceError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('updateCommentById Tests', () => {
        beforeEach(() => {
            req.params = { discussionId: '1', commentId: '5' };
            req.body = { message: 'Updated message' };
            req.tokenPayload = { sub: '10' };
        });

        it('should return 200 with updated comment on success', async () => {
            const mockValue = { message: 'Updated message' };
            const mockDiscussionId = parseInt(req.params.discussionId, 10);
            const mockCommentId = parseInt(req.params.commentId, 10);
            const mockUpdatedComment = {
                id: mockCommentId,
                message: 'Updated message',
                userId: 10,
            };
            validateUpdateCommentData.mockReturnValue({
                error: null,
                value: mockValue,
            });
            DiscussionService.updateOneComment.mockResolvedValue(
                mockUpdatedComment,
            );

            await updateCommentById(req, res, next);

            expect(validateUpdateCommentData).toHaveBeenCalledWith(req.body);
            expect(DiscussionService.updateOneComment).toHaveBeenCalledWith({
                discussionId: mockDiscussionId,
                commentId: mockCommentId,
                message: mockValue.message,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 200,
                message: 'Successfully updated a comment.',
                data: {
                    comment: mockUpdatedComment,
                },
                errors: null,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with a validation error if body is invalid', async () => {
            req.body = { message: '' };
            const validationError = new ValidationError('Validation failed');
            validateUpdateCommentData.mockReturnValue({
                error: validationError,
            });

            await updateCommentById(req, res, next);

            expect(validateUpdateCommentData).toHaveBeenCalledWith(req.body);
            expect(DiscussionService.updateOneComment).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(validationError);
        });

        it('should forward service errors (like 404) to the next middleware', async () => {
            req.params.commentId = '999';
            const mockValue = { message: 'Updated message' };
            const mockDiscussionId = parseInt(req.params.discussionId, 10);
            const mockCommentId = 999;
            const serviceError = new HTTPError(404, 'Resource not found.');
            validateUpdateCommentData.mockReturnValue({
                error: null,
                value: mockValue,
            });
            DiscussionService.updateOneComment.mockRejectedValue(serviceError);

            await updateCommentById(req, res, next);

            expect(validateUpdateCommentData).toHaveBeenCalledWith(req.body);
            expect(DiscussionService.updateOneComment).toHaveBeenCalledWith({
                discussionId: mockDiscussionId,
                commentId: mockCommentId,
                message: mockValue.message,
            });
            expect(next).toHaveBeenCalledWith(serviceError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('deleteCommentById tests', () => {
        it('should call res with 200', async () => {
            req.params = {
                discussionId: '1',
                commentId: '1',
            };
            DiscussionService.deleteOneComment.mockResolvedValue();

            await deleteCommentById(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 200,
                message: 'Successfully deleted a discussion forum.',
                data: null,
                errors: null,
            });
        });

        it('should forwards service error to next', async () => {
            req.params = {
                discussionId: '1',
                commentId: '1',
            };
            const mockError = new Error('BOOM');
            DiscussionService.deleteOneComment.mockRejectedValue(mockError);

            await deleteCommentById(req, res, next);

            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('createLike Tests', () => {
        beforeEach(() => {
            req.params = { discussionId: '1', commentId: '5' };
            req.tokenPayload = { sub: '10' };
        });

        it('should return 201 with the new likes count on success', async () => {
            const mockDiscussionId = parseInt(req.params.discussionId, 10);
            const mockCommentId = parseInt(req.params.commentId, 10);
            const mockUserId = parseInt(req.tokenPayload.sub, 10);
            const mockLikesCount = 5;
            DiscussionService.createLike.mockResolvedValue(mockLikesCount);

            await createLike(req, res, next);

            expect(DiscussionService.createLike).toHaveBeenCalledWith({
                discussionId: mockDiscussionId,
                commentId: mockCommentId,
                userId: mockUserId,
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 201,
                message: 'Successfully liked a comment.',
                data: {
                    likesCount: mockLikesCount,
                },
                errors: null,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should forward service errors (like 404 or 409) to the next middleware', async () => {
            const mockDiscussionId = parseInt(req.params.discussionId, 10);
            const mockCommentId = parseInt(req.params.commentId, 10);
            const mockUserId = parseInt(req.tokenPayload.sub, 10);
            const serviceError = new HTTPError(409, 'Resource conflict.');
            DiscussionService.createLike.mockRejectedValue(serviceError);

            await createLike(req, res, next);

            expect(DiscussionService.createLike).toHaveBeenCalledWith({
                discussionId: mockDiscussionId,
                commentId: mockCommentId,
                userId: mockUserId,
            });
            expect(next).toHaveBeenCalledWith(serviceError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('deleteLike Tests', () => {
        beforeEach(() => {
            req.params = { discussionId: '1', commentId: '5' };
            req.tokenPayload = { sub: '10' };
        });

        it('should return 200 with the new likes count on success', async () => {
            const mockDiscussionId = parseInt(req.params.discussionId, 10);
            const mockCommentId = parseInt(req.params.commentId, 10);
            const mockUserId = parseInt(req.tokenPayload.sub, 10);
            const mockLikesCount = 4;
            DiscussionService.deleteLike.mockResolvedValue(mockLikesCount);

            await deleteLike(req, res, next);

            expect(DiscussionService.deleteLike).toHaveBeenCalledWith({
                discussionId: mockDiscussionId,
                commentId: mockCommentId,
                userId: mockUserId,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 200,
                message: 'Successfully unliked a comment.',
                data: {
                    likesCount: mockLikesCount,
                },
                errors: null,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should forward service errors (like 404) to the next middleware', async () => {
            const mockDiscussionId = parseInt(req.params.discussionId, 10);
            const mockCommentId = parseInt(req.params.commentId, 10);
            const mockUserId = parseInt(req.tokenPayload.sub, 10);
            const serviceError = new HTTPError(404, 'Resource not found.');
            DiscussionService.deleteLike.mockRejectedValue(serviceError);

            await deleteLike(req, res, next);

            expect(DiscussionService.deleteLike).toHaveBeenCalledWith({
                discussionId: mockDiscussionId,
                commentId: mockCommentId,
                userId: mockUserId,
            });
            expect(next).toHaveBeenCalledWith(serviceError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});
