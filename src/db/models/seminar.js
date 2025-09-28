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
        },
        {
            tableName: 'seminars',
            paranoid: true,
            deletedAt: 'deleted_at',
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
