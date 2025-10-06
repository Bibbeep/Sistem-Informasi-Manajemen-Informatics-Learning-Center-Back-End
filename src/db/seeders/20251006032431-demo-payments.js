/* eslint-disable no-unused-vars */
'use strict';
const { fakerID_ID: faker } = require('@faker-js/faker');
const { Invoice } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const verifiedInvoices = await Invoice.findAll({
            where: {
                status: 'Verified',
            },
        });

        const payments = verifiedInvoices.map((invoice) => {
            const createdAt = faker.date.between({
                from: invoice.createdAt,
                to: new Date(),
            });

            return {
                user_program_invoice_id: invoice.id,
                amount_paid_idr: invoice.amountIdr,
                created_at: createdAt,
                updated_at: createdAt,
            };
        });

        if (payments.length > 0) {
            await queryInterface.bulkInsert(
                'user_program_payments',
                payments,
                {},
            );
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('user_program_payments', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });
    },
};
