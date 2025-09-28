'use strict';
module.exports = (sequelize, DataTypes) => {
    const Program = sequelize.define(
        'Program',
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            title: {
                allowNull: false,
                type: DataTypes.STRING(60),
            },
            description: {
                allowNull: false,
                type: DataTypes.TEXT,
            },
            thumbnailUrl: {
                allowNull: true,
                type: DataTypes.TEXT,
                field: 'thumbnail_url',
            },
            availableDate: {
                allowNull: false,
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                field: 'available_date',
            },
            type: {
                allowNull: false,
                type: DataTypes.ENUM(
                    'Course',
                    'Seminar',
                    'Workshop',
                    'Competition',
                ),
            },
            priceIdr: {
                allowNull: false,
                type: DataTypes.INTEGER,
                field: 'price_idr',
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
            tableName: 'programs',
            paranoid: true,
            deletedAt: 'deleted_at',
        },
    );

    Program.associate = (models) => {
        Program.hasOne(models.Course, {
            foreignKey: 'programId',
            as: 'course',
        });

        Program.hasOne(models.Seminar, {
            foreignKey: 'programId',
            as: 'seminar',
        });
    };

    return Program;
};
