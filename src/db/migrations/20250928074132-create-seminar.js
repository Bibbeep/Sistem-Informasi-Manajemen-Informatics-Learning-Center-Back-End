/* eslint-disable no-unused-vars */
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('seminars', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            programId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                field: 'program_id',
                references: {
                    model: 'programs',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            isOnline: {
                allowNull: false,
                type: Sequelize.BOOLEAN,
                defaultValue: true,
                field: 'is_online',
            },
            startDate: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
                field: 'start_date',
            },
            endDate: {
                allowNull: true,
                type: Sequelize.DATE,
                field: 'end_date',
            },
            videoConferenceUrl: {
                allowNull: true,
                type: Sequelize.TEXT,
                field: 'video_conference_url',
            },
            locationAddress: {
                allowNull: true,
                type: Sequelize.STRING,
                field: 'location_address',
            },
            speakerNames: {
                allowNull: true,
                type: Sequelize.ARRAY(Sequelize.STRING(60)),
                field: 'speaker_names',
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
        await queryInterface.dropTable('seminars');
    },
};
