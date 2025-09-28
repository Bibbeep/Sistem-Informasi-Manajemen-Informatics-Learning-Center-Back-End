'use strict';
module.exports = (sequelize, DataTypes) => {
    const Workshop = sequelize.define(
        'Workshop',
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
            facilitatorNames: {
                allowNull: true,
                type: DataTypes.ARRAY(DataTypes.STRING(60)),
                field: 'facilitator_names',
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
            tableName: 'workshops',
            paranoid: true,
            deletedAt: 'deletedAt',
        },
    );

    Workshop.associate = (models) => {
        Workshop.belongsTo(models.Program, {
            foreignKey: 'programId',
            as: 'program',
        });
    };

    return Workshop;
};
