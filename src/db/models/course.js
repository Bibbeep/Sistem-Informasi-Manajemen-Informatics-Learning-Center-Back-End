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
            deletedAt: {
                allowNull: true,
                type: DataTypes.DATE,
                field: 'deleted_at',
            },
        },
        {
            tableName: 'courses',
            paranoid: true,
            deletedAt: 'deletedAt',
        },
    );

    Course.associate = (models) => {
        Course.belongsTo(models.Program, {
            foreignKey: 'programId',
            as: 'program',
        });

        Course.hasMany(models.CourseModule, {
            foreignKey: 'courseId',
            as: 'modules',
        });
    };

    return Course;
};
