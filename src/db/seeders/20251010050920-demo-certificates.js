/* eslint-disable no-unused-vars */
'use strict';
const { fakerID_ID: faker } = require('@faker-js/faker');
const { Enrollment, Program } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const completedEnrollments = await Enrollment.findAll({
            where: {
                status: 'Completed',
            },
            include: [
                {
                    model: Program,
                    as: 'program',
                },
            ],
        });

        const typeToCredential = {
            Course: 'CRS',
            Seminar: 'SMN',
            Workshop: 'WRS',
            Competition: 'CMP',
        };

        const certificates = completedEnrollments.map((enrollment) => {
            const createdAt = faker.date.past();
            const programType = enrollment.program.type;
            const credentialPrefix = typeToCredential[programType];

            const credential = `${credentialPrefix}${String(
                enrollment.program.id,
            ).padStart(4, '0')}-U${String(enrollment.userId).padStart(4, '0')}`;

            const issuedAt = enrollment.completedAt || new Date();

            return {
                user_program_enrollment_id: enrollment.id,
                user_id: enrollment.userId,
                title: `${enrollment.program.title} Certificate of Completion`,
                credential,
                document_url: faker.internet.url(),
                issued_at: issuedAt,
                expired_at:
                    programType === 'Course'
                        ? null
                        : faker.date.future({
                              years: faker.number.int({ min: 3, max: 5 }),
                              refDate: issuedAt,
                          }),
                created_at: createdAt,
                updated_at: faker.date.between({
                    from: createdAt,
                    to: new Date(),
                }),
            };
        });

        if (certificates.length > 0) {
            await queryInterface.bulkInsert('certificates', certificates, {});
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('certificates', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });
    },
};
