'use strict';
module.exports = (sequelize, DataTypes) => {
    const Invoice = sequelize.define(
        'Invoice',
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            enrollmentId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                field: 'user_program_enrollment_id',
                references: {
                    model: 'user_program_enrollments',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            virtualAccountNumber: {
                allowNull: true,
                type: DataTypes.STRING(18),
                field: 'virtual_account_number',
            },
            amountIdr: {
                allowNull: false,
                type: DataTypes.INTEGER,
                field: 'amount_idr',
            },
            paymentDueDatetime: {
                allowNull: true,
                type: DataTypes.DATE,
                field: 'payment_due_datetime',
            },
            status: {
                allowNull: false,
                type: DataTypes.ENUM('Unverified', 'Verified', 'Expired'),
                defaultValue: 'Unverified',
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
            tableName: 'user_program_invoices',
            paranoid: true,
            deletedAt: 'deletedAt',
        },
    );

    Invoice.associate = (models) => {
        Invoice.belongsTo(models.Enrollment, {
            foreignKey: 'enrollmentId',
            as: 'enrollment',
        });
    };

    return Invoice;
};
