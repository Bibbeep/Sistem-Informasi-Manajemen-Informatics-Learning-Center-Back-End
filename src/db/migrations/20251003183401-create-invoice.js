/* eslint-disable no-unused-vars */
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('user_program_invoices', {
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
            virtualAccountNumber: {
                allowNull: true,
                type: Sequelize.STRING(18),
                field: 'virtual_account_number',
            },
            amountIdr: {
                allowNull: false,
                type: Sequelize.INTEGER,
                field: 'amount_idr',
            },
            paymentDueDatetime: {
                allowNull: true,
                type: Sequelize.DATE,
                field: 'payment_due_datetime',
            },
            status: {
                allowNull: false,
                type: Sequelize.ENUM('Unverified', 'Verified', 'Expired'),
                defaultValue: 'Unverified',
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
        await queryInterface.dropTable('user_program_invoices');
    },
};
