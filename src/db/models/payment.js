'use strict';
module.exports = (sequelize, DataTypes) => {
    const Payment = sequelize.define(
        'Payment',
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            invoiceId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                field: 'user_program_invoice_id',
            },
            amountPaidIdr: {
                allowNull: false,
                type: DataTypes.INTEGER,
                field: 'amount_paid_idr',
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
            tableName: 'user_program_payments',
        },
    );

    Payment.associate = (models) => {
        Payment.belongsTo(models.Invoice, {
            foreignKey: 'invoiceId',
            as: 'invoice',
        });
    };

    return Payment;
};
