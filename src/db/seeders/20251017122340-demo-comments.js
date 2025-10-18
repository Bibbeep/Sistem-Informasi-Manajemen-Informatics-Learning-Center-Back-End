/* eslint-disable no-unused-vars */
'use strict';
const { fakerID_ID: faker } = require('@faker-js/faker');
const { User, Discussion } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const users = await User.findAll({ attributes: ['id'] });
        const discussions = await Discussion.findAll({ attributes: ['id'] });

        if (users.length === 0 || discussions.length === 0) {
            console.log('Cannot seed comments: No users or discussions found.');
            return;
        }

        const userIds = users.map((u) => {
            return u.id;
        });
        const discussionIds = discussions.map((d) => {
            return d.id;
        });

        const topLevelComments = [];
        for (const discussionId of discussionIds) {
            const commentCount = faker.number.int({ min: 3, max: 7 });
            for (let i = 0; i < commentCount; i++) {
                const createdAt = faker.date.past();
                topLevelComments.push({
                    discussion_id: discussionId,
                    user_id: faker.helpers.arrayElement(userIds),
                    parent_comment_id: null,
                    message: faker.lorem.paragraph(),
                    created_at: createdAt,
                    updated_at: faker.date.between({
                        from: createdAt,
                        to: new Date(),
                    }),
                });
            }
        }

        const createdComments = await queryInterface.bulkInsert(
            'comments',
            topLevelComments,
            { returning: ['id', 'discussion_id', 'created_at'] },
        );

        const replies = [];
        for (const parentComment of createdComments) {
            if (faker.datatype.boolean()) {
                const replyCount = faker.number.int({ min: 1, max: 2 });
                for (let i = 0; i < replyCount; i++) {
                    const createdAt = faker.date.between({
                        from: parentComment.created_at,
                        to: new Date(),
                    });
                    replies.push({
                        discussion_id: parentComment.discussion_id,
                        user_id: faker.helpers.arrayElement(userIds),
                        parent_comment_id: parentComment.id,
                        message: faker.lorem.sentence(),
                        created_at: createdAt,
                        updated_at: faker.date.between({
                            from: createdAt,
                            to: new Date(),
                        }),
                    });
                }
            }
        }

        if (replies.length > 0) {
            await queryInterface.bulkInsert('comments', replies, {});
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('comments', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });
    },
};
