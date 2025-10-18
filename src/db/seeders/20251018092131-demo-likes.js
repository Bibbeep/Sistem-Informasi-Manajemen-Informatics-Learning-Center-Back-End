/* eslint-disable no-unused-vars */
'use strict';
const { faker } = require('@faker-js/faker');
const { User, Comment } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const users = await User.findAll({ attributes: ['id'] });
        const comments = await Comment.findAll({ attributes: ['id'] });

        if (users.length === 0 || comments.length === 0) {
            console.log('Cannot seed likes: No users or comments found.');
            return;
        }

        const userIds = users.map((user) => {
            return user.id;
        });
        const commentIds = comments.map((comment) => {
            return comment.id;
        });

        const likes = [];
        const uniqueLikes = new Set();

        for (const userId of userIds) {
            const numberOfLikes = faker.number.int({ min: 5, max: 20 });
            const shuffledComments = faker.helpers.shuffle(commentIds);

            for (let i = 0; i < numberOfLikes; i++) {
                const commentId = shuffledComments[i];
                if (commentId) {
                    const likeKey = `${userId}-${commentId}`;

                    if (!uniqueLikes.has(likeKey)) {
                        const createdAt = faker.date.past();
                        likes.push({
                            user_id: userId,
                            comment_id: commentId,
                            created_at: createdAt,
                            updated_at: createdAt,
                        });
                        uniqueLikes.add(likeKey);
                    }
                }
            }
        }

        if (likes.length > 0) {
            await queryInterface.bulkInsert('comment_likes', likes, {});
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('comment_likes', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });
    },
};
