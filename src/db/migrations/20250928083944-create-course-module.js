/* eslint-disable no-unused-vars */
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('course_modules', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            courseId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                field: 'course_id',
                references: {
                    model: 'courses',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            numberCode: {
                allowNull: false,
                type: Sequelize.INTEGER,
                field: 'number_code',
            },
            materialUrl: {
                allowNull: true,
                type: Sequelize.TEXT,
                field: 'material_url',
            },
            markdownUrl: {
                allowNull: true,
                type: Sequelize.TEXT,
                field: 'markdown_url',
            },
            youtubeUrl: {
                allowNull: false,
                type: Sequelize.TEXT,
                field: 'youtube_url',
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
        await queryInterface.dropTable('course_modules');
    },
};
