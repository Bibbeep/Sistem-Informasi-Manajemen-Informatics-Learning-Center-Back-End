/* eslint-disable no-unused-vars */
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('comments', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            discussionId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                field: 'discussion_id',
                references: {
                    model: 'discussions',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            userId: {
                allowNull: true,
                type: Sequelize.INTEGER,
                field: 'user_id',
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            parentCommentId: {
                allowNull: true,
                type: Sequelize.INTEGER,
                field: 'parent_comment_id',
                references: {
                    model: 'comments',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            message: {
                allowNull: false,
                type: Sequelize.TEXT,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                field: 'created_at',
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                field: 'updated_at',
            },
            deletedAt: {
                allowNull: true,
                type: Sequelize.DATE,
                field: 'deleted_at',
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('comments');
    },
};
