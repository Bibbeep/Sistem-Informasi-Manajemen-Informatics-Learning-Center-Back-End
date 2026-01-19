'use strict';
module.exports = (sequelize, DataTypes) => {
    const Signature = sequelize.define(
        'Signature',
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            isDefault: {
                allowNull: false,
                type: DataTypes.BOOLEAN,
                field: 'is_default',
                default: false,
            },
            name: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            title: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            imageUrl: {
                allowNull: true,
                type: DataTypes.TEXT,
                field: 'image_url',
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
            tableName: 'certificate_signatures',
        },
    );

    Signature.associate = (models) => {
        Signature.hasMany(models.Certificate, {
            foreignKey: 'signature1Id',
            as: 'certificates',
        });

        Signature.hasMany(models.Certificate, {
            foreignKey: 'signature2Id',
            as: 'certificates2',
        });
    };

    return Signature;
};
