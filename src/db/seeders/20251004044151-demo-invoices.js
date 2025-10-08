/* eslint-disable no-unused-vars */
'use strict';
const { fakerID_ID: faker } = require('@faker-js/faker');
const { User, Program, Enrollment, Sequelize } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const invoicesToCreate = [];

        const users = await User.findAll();
        const programs = await Program.findAll({
            where: {
                priceIdr: {
                    [Sequelize.Op.gt]: 0,
                },
            },
        });
        const existingEnrollments = await Enrollment.findAll();
        const enrollmentSet = new Set(
            existingEnrollments.map((e) => {
                return `${e.userId}-${e.programId}`;
            }),
        );

        for (const user of users) {
            const program = faker.helpers.arrayElement(programs);
            if (program) {
                const enrollmentKey = `${user.id}-${program.id}`;

                if (!enrollmentSet.has(enrollmentKey)) {
                    const createdAt = faker.date.past();
                    const newEnrollment = await Enrollment.create({
                        userId: user.id,
                        programId: program.id,
                        status: 'Unpaid',
                        createdAt: createdAt,
                        updatedAt: createdAt,
                    });

                    invoicesToCreate.push({
                        user_program_enrollment_id: newEnrollment.id,
                        virtual_account_number: faker.finance.accountNumber(18),
                        amount_idr: program.priceIdr,
                        payment_due_datetime: faker.date.future({
                            refDate: createdAt,
                        }),
                        status: 'Unverified',
                        created_at: createdAt,
                        updated_at: createdAt,
                    });

                    enrollmentSet.add(enrollmentKey);
                }
            }
        }

        const usersForExpired = faker.helpers.shuffle(users).slice(0, 50);
        for (const user of usersForExpired) {
            const program = faker.helpers.arrayElement(programs);
            if (program) {
                const enrollmentKey = `${user.id}-${program.id}`;

                if (!enrollmentSet.has(enrollmentKey)) {
                    const createdAt = faker.date.past();
                    const newEnrollment = await Enrollment.create({
                        userId: user.id,
                        programId: program.id,
                        status: 'Expired',
                        createdAt: createdAt,
                        updatedAt: createdAt,
                    });

                    invoicesToCreate.push({
                        user_program_enrollment_id: newEnrollment.id,
                        virtual_account_number: faker.finance.accountNumber(18),
                        amount_idr: program.priceIdr,
                        payment_due_datetime: faker.date.past({
                            refDate: createdAt,
                        }),
                        status: 'Expired',
                        created_at: createdAt,
                        updated_at: createdAt,
                    });

                    enrollmentSet.add(enrollmentKey);
                }
            }
        }

        const paidEnrollments = await Enrollment.findAll({
            where: {
                status: {
                    [Sequelize.Op.ne]: 'Unpaid',
                },
            },
            include: [
                {
                    model: Program,
                    as: 'program',
                    where: {
                        priceIdr: {
                            [Sequelize.Op.gt]: 0,
                        },
                    },
                },
            ],
        });

        for (const enrollment of paidEnrollments) {
            const createdAt = enrollment.createdAt;
            invoicesToCreate.push({
                user_program_enrollment_id: enrollment.id,
                virtual_account_number: faker.finance.accountNumber(18),
                amount_idr: enrollment.program.priceIdr,
                payment_due_datetime: createdAt,
                status: 'Verified',
                created_at: createdAt,
                updated_at: faker.date.between({
                    from: createdAt,
                    to: new Date(),
                }),
            });
        }

        if (invoicesToCreate.length > 0) {
            await queryInterface.bulkInsert(
                'user_program_invoices',
                invoicesToCreate,
                {},
            );
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('user_program_invoices', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });
    },
};
