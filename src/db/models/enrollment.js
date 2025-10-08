'use strict';
module.exports = (sequelize, DataTypes) => {
    const Enrollment = sequelize.define(
        'Enrollment',
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
            userId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                field: 'user_id',
            },
            status: {
                allowNull: false,
                type: DataTypes.ENUM(
                    'Unpaid',
                    'In Progress',
                    'Completed',
                    'Expired',
                ),
                defaultValue: 'Unpaid',
            },
            progressPercentage: {
                allowNull: false,
                type: DataTypes.DECIMAL(5, 2),
                defaultValue: 0,
                field: 'progress_percentage',
            },
            completedAt: {
                allowNull: true,
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
            deletedAt: {
                allowNull: true,
                type: DataTypes.DATE,
                field: 'deleted_at',
            },
        },
        {
            tableName: 'user_program_enrollments',
            paranoid: true,
            deletedAt: 'deletedAt',
        },
    );

    Enrollment.associate = (models) => {
        Enrollment.belongsTo(models.Program, {
            foreignKey: 'programId',
            as: 'program',
        });

        Enrollment.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });

        Enrollment.hasMany(models.CompletedModule, {
            foreignKey: 'enrollmentId',
            as: 'completedModules',
        });

        Enrollment.hasOne(models.Invoice, {
            foreignKey: 'enrollmentId',
            as: 'invoice',
        });
    };

    return Enrollment;
};
