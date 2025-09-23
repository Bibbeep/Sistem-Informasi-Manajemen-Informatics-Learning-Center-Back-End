const bcrypt = require('bcrypt');
const sharp = require('sharp');
const { fromBuffer } = require('file-type');
const { Upload } = require('@aws-sdk/lib-storage');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const User = require('../db/models/user');
const HTTPError = require('../utils/httpError');
const AuthService = require('./auth.service');
const { s3 } = require('../configs/s3');

class UserService {
    static async getMany(data) {
        const { page, limit, sort, role, level } = data;

        const where = {};

        if (role === 'user' || role === 'admin') {
            where.role = role === 'user' ? 'User' : 'Admin';
        }

        if (level === 'basic' || level === 'premium') {
            where.memberLevel = level === 'basic' ? 'Basic' : 'Premium';
        }

        const { count, rows } = await User.findAndCountAll({
            where,
            limit,
            offset: (page - 1) * limit,
            order: sort.startsWith('-')
                ? [[sort.replace('-', ''), 'DESC']]
                : [[sort, 'ASC']],
            attributes: {
                exclude: ['hashedPassword'],
            },
        });

        const totalPages = Math.ceil(count / limit);

        return {
            pagination: {
                currentRecords: rows.length,
                totalRecords: count,
                currentPage: page,
                totalPages,
                nextPage: page < totalPages ? page + 1 : null,
                prevPage:
                    page > totalPages + 1 ? null : page > 1 ? page - 1 : null,
            },
            users: rows,
        };
    }

    static async getOne(userId) {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'User with "userId" does not exist',
                    context: {
                        key: 'userId',
                        value: userId,
                    },
                },
            ]);
        }

        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            memberLevel: user.memberLevel,
            role: user.role,
            pictureUrl: user.pictureUrl,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    static async updateOne(data) {
        const { userId, fullName, email, password } = data;

        if (!(await User.findByPk(userId))) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'User with "userId" does not exist',
                    context: {
                        key: 'userId',
                        value: userId,
                    },
                },
            ]);
        }

        const updateData = {
            ...(fullName && { fullName }),
            ...(email && { email }),
        };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.hashedPassword = await bcrypt.hash(password, salt);
        }

        // eslint-disable-next-line no-unused-vars
        const [count, rows] = await User.update(updateData, {
            where: {
                id: userId,
            },
            returning: true,
        });

        return {
            id: rows[0].id,
            email: rows[0].email,
            fullName: rows[0].fullName,
            memberLevel: rows[0].memberLevel,
            role: rows[0].role,
            pictureUrl: rows[0].pictureUrl,
            createdAt: rows[0].createdAt,
            updatedAt: rows[0].updatedAt,
        };
    }

    static async deleteOne(data) {
        const { userId, tokenPayload } = data;
        const isUserExist = await User.findByPk(userId);

        if (!isUserExist) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'User with "userId" does not exist',
                    context: {
                        key: 'userId',
                        value: userId,
                    },
                },
            ]);
        }

        await User.destroy({ where: { id: userId } });

        if (tokenPayload.sub === userId) {
            await AuthService.logout(tokenPayload);
        }
    }

    static async uploadPhoto(data) {
        if (!data.file) {
            throw new HTTPError(400, 'Invalid request.', [
                {
                    message: '"photo" is empty',
                    context: {
                        key: 'photo',
                        value: null,
                    },
                },
            ]);
        }

        const userData = await User.findByPk(data.userId);

        if (!userData) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'User with "userId" does not exist',
                    context: {
                        key: 'userId',
                        value: data.userId,
                    },
                },
            ]);
        }

        const { file } = data;
        const fileType = await fromBuffer(file.buffer);

        if (
            !fileType ||
            !['image/jpeg', 'image/png', 'image/webp'].includes(fileType.mime)
        ) {
            throw new HTTPError(415, 'Unsupported Media Type.', [
                {
                    message:
                        'File MIME type must be "image/jpeg", "image/png", or "image/webp"',
                    context: {
                        key: 'File MIME Type',
                        value: fileType ? fileType.mime : null,
                    },
                },
            ]);
        }

        const compressedImageBuffer = await sharp(file.buffer)
            .webp({ quality: 40 })
            .toBuffer();

        const fileName = `images/${data.userId}-photo-${Date.now().toString()}.webp`;

        const client = new Upload({
            client: s3,
            params: {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: fileName,
                Body: compressedImageBuffer,
                ContentType: 'image/webp',
                ACL: 'public-read',
            },
        });

        const { Location } = await client.done();

        if (userData.pictureUrl) {
            const oldKey = userData.pictureUrl.split('/').pop();

            await s3.send(
                new DeleteObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: `images/${oldKey}`,
                }),
            );
        }

        if (Location) {
            await User.update(
                { pictureUrl: Location },
                {
                    where: {
                        id: data.userId,
                    },
                },
            );
        }

        return {
            pictureUrl: Location,
        };
    }
}

module.exports = UserService;
