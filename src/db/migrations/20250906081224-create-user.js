/* eslint-disable no-unused-vars */
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            email: {
                allowNull: false,
                type: Sequelize.STRING,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            hashedPassword: {
                allowNull: false,
                type: Sequelize.STRING(60),
                field: 'hashed_password',
            },
            fullName: {
                allowNull: false,
                type: Sequelize.STRING,
                field: 'full_name',
            },
            memberLevel: {
                allowNull: false,
                type: Sequelize.ENUM('Basic', 'Premium'),
                field: 'member_level',
                defaultValue: 'Basic',
            },
            role: {
                allowNull: false,
                type: Sequelize.ENUM('User', 'Admin'),
                defaultValue: 'User',
            },
            pictureUrl: {
                allowNull: true,
                type: Sequelize.TEXT,
                field: 'picture_url',
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
        await queryInterface.dropTable('users');
    },
};
