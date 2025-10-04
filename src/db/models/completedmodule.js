'use strict';
module.exports = (sequelize, DataTypes) => {
    const CompletedModule = sequelize.define(
        'CompletedModule',
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            courseModuleId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                field: 'course_module_id',
            },
            enrollmentId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                field: 'user_program_enrollment_id',
            },
            completedAt: {
                allowNull: false,
                type: DataTypes.DATE,
                field: 'completed_at',
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
            tableName: 'user_completed_modules',
        },
    );

    CompletedModule.associate = (models) => {
        CompletedModule.belongsTo(models.Enrollment, {
            foreignKey: 'enrollmentId',
            as: 'enrollment',
        });
    };

    return CompletedModule;
};
