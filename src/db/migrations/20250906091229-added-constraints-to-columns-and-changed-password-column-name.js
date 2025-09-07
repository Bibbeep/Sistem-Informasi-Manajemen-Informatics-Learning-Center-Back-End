/* eslint-disable no-unused-vars */
'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.renameColumn(
            'users',
            'password',
            'hashed_password',
        );
        await queryInterface.renameColumn('users', 'fullName', 'full_name');
        await queryInterface.renameColumn(
            'users',
            'memberLevel',
            'member_level',
        );
        await queryInterface.renameColumn('users', 'pictureUrl', 'picture_url');
        await queryInterface.renameColumn('users', 'createdAt', 'created_at');
        await queryInterface.renameColumn('users', 'updatedAt', 'updated_at');

        await queryInterface.changeColumn('users', 'email', {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        });

        await queryInterface.changeColumn('users', 'hashed_password', {
            type: DataTypes.STRING(60),
            allowNull: false,
        });

        await queryInterface.changeColumn('users', 'full_name', {
            type: DataTypes.STRING,
            allowNull: false,
        });

        await queryInterface.sequelize.query(`
			ALTER TYPE "enum_users_memberLevel" RENAME TO "enum_users_member_level";
		`);

        await queryInterface.changeColumn('users', 'member_level', {
            type: DataTypes.ENUM('Basic', 'Premium'),
            allowNull: false,
            defaultValue: 'Basic',
        });

        await queryInterface.changeColumn('users', 'role', {
            type: DataTypes.ENUM('User', 'Admin'),
            allowNull: false,
            defaultValue: 'User',
        });

        await queryInterface.changeColumn('users', 'picture_url', {
            type: DataTypes.TEXT,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.renameColumn(
            'users',
            'hashed_password',
            'password',
        );
        await queryInterface.renameColumn('users', 'full_name', 'fullName');
        await queryInterface.renameColumn(
            'users',
            'member_level',
            'memberLevel',
        );
        await queryInterface.renameColumn('users', 'picture_url', 'pictureUrl');
        await queryInterface.renameColumn('users', 'created_at', 'createdAt');
        await queryInterface.renameColumn('users', 'updated_at', 'updatedAt');

        await queryInterface.changeColumn('users', 'email', {
            type: DataTypes.STRING,
            allowNull: true,
            unique: false,
        });

        await queryInterface.changeColumn('users', 'password', {
            type: DataTypes.STRING,
            allowNull: true,
        });

        await queryInterface.changeColumn('users', 'fullName', {
            type: DataTypes.STRING,
            allowNull: true,
        });

        await queryInterface.sequelize.query(`
			ALTER TYPE "enum_users_member_level" RENAME TO "enum_users_memberLevel";
		`);

        await queryInterface.changeColumn('users', 'memberLevel', {
            type: DataTypes.ENUM('Basic', 'Premium'),
            allowNull: true,
            defaultValue: null,
        });

        await queryInterface.changeColumn('users', 'role', {
            type: DataTypes.ENUM('User', 'Admin'),
            allowNull: true,
            defaultValue: null,
        });

        await queryInterface.changeColumn('users', 'pictureUrl', {
            type: DataTypes.STRING,
            allowNull: true,
        });
    },
};
