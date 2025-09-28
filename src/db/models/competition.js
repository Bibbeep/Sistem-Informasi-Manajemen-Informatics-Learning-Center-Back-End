'use strict';
module.exports = (sequelize, DataTypes) => {
    const Competition = sequelize.define(
        'Competition',
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
            contestRoomUrl: {
                allowNull: true,
                type: DataTypes.TEXT,
                field: 'contest_room_url',
            },
            locationAddress: {
                allowNull: true,
                type: DataTypes.STRING,
                field: 'location_address',
            },
            hostName: {
                allowNull: true,
                type: DataTypes.STRING,
                field: 'host_name',
            },
            totalPrize: {
                allowNull: false,
                type: DataTypes.INTEGER,
                field: 'total_prize',
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
            tableName: 'competitions',
            paranoid: true,
            deletedAt: 'deleted_at',
        },
    );

    Competition.associate = (models) => {
        Competition.belongsTo(models.Program, {
            foreignKey: 'programId',
            as: 'program',
        });
    };

    return Competition;
};
