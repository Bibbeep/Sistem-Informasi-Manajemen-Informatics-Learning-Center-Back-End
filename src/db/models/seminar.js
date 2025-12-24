'use strict';
module.exports = (sequelize, DataTypes) => {
    const Seminar = sequelize.define(
        'Seminar',
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            programId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                field: 'program_id',
            },
            isOnline: {
                allowNull: false,
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                field: 'is_online',
            },
            startDate: {
                allowNull: false,
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                field: 'start_date',
            },
            endDate: {
                allowNull: true,
                type: DataTypes.DATE,
                field: 'end_date',
            },
            videoConferenceUrl: {
                allowNull: true,
                type: DataTypes.TEXT,
                field: 'video_conference_url',
            },
            locationAddress: {
                allowNull: true,
                type: DataTypes.STRING,
                field: 'location_address',
            },
            speakerNames: {
                allowNull: true,
                type: DataTypes.ARRAY(DataTypes.STRING(60)),
                field: 'speaker_names',
            },
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE,
                field: 'created_at',
            },
            updatedAt: {
                allowNull: false,
                type: DataTypes.DATE,
                field: 'updated_at',
            },
            deletedAt: {
                allowNull: true,
                type: DataTypes.DATE,
                field: 'deleted_at',
            },
        },
        {
            tableName: 'seminars',
            paranoid: true,
            deletedAt: 'deletedAt',
        },
    );

    Seminar.associate = (models) => {
        Seminar.belongsTo(models.Program, {
            foreignKey: 'programId',
            as: 'program',
        });
    };

    return Seminar;
};
