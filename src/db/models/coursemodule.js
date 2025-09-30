'use strict';
module.exports = (sequelize, DataTypes) => {
    const CourseModule = sequelize.define(
        'CourseModule',
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            courseId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                field: 'course_id',
            },
            numberCode: {
                allowNull: false,
                type: DataTypes.INTEGER,
                field: 'number_code',
            },
            materialUrl: {
                allowNull: true,
                type: DataTypes.TEXT,
                field: 'material_url',
            },
            youtubeUrl: {
                allowNull: false,
                type: DataTypes.TEXT,
                field: 'youtube_url',
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
            tableName: 'course_modules',
            paranoid: true,
            deletedAt: 'deletedAt',
        },
    );

    CourseModule.associate = (models) => {
        CourseModule.belongsTo(models.Course, {
            foreignKey: 'courseId',
            as: 'course',
        });
    };

    return CourseModule;
};
