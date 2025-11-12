'use strict';
module.exports = (sequelize, DataTypes) => {
    const Certificate = sequelize.define(
        'Certificate',
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
            },
            userId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                field: 'user_id',
            },
            title: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            credential: {
                allowNull: false,
                type: DataTypes.STRING(13),
            },
            documentUrl: {
                allowNull: true,
                type: DataTypes.TEXT,
                field: 'document_url',
            },
            issuedAt: {
                allowNull: false,
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                field: 'issued_at',
            },
            expiredAt: {
                allowNull: true,
                type: DataTypes.DATE,
                field: 'expired_at',
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
            tableName: 'certificates',
        },
    );

    Certificate.associate = (models) => {
        Certificate.belongsTo(models.Enrollment, {
            foreignKey: 'enrollmentId',
            as: 'enrollment',
        });

        Certificate.belongsTo(models.User, {
            foreignKet: 'userId',
            as: 'user',
        });
    };

    return Certificate;
};
