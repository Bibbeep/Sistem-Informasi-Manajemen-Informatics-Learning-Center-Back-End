'use strict';
module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define(
        'Course',
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
            tableName: 'courses',
            paranoid: true,
            deletedAt: 'deleted_at',
        },
    );

    Course.associate = (models) => {
        Course.belongsTo(models.Program, {
            foreignKey: 'programId',
            as: 'program',
        });
    };

    return Course;
};
