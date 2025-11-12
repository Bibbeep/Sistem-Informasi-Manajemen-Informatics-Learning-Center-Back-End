/* eslint-disable no-unused-vars */
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('certificates', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            enrollmentId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                field: 'user_program_enrollment_id',
                references: {
                    model: 'user_program_enrollments',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            userId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                field: 'user_id',
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            title: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            credential: {
                allowNull: false,
                type: Sequelize.STRING(13),
            },
            documentUrl: {
                allowNull: true,
                type: Sequelize.TEXT,
                field: 'document_url',
            },
            issuedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
                field: 'issued_at',
            },
            expiredAt: {
                allowNull: true,
                type: Sequelize.DATE,
                field: 'expired_at',
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
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('certificates');
    },
};
