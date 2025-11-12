'use strict';
module.exports = (sequelize, DataTypes) => {
    const Discussion = sequelize.define(
        'Discussion',
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            adminUserId: {
                allowNull: true,
                type: DataTypes.INTEGER,
                field: 'admin_user_id',
            },
            title: {
                allowNull: false,
                type: DataTypes.STRING,
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
            tableName: 'discussions',
        },
    );

    Discussion.associate = (models) => {
        Discussion.belongsTo(models.User, {
            foreignKey: 'adminUserId',
            as: 'user',
        });

        Discussion.hasMany(models.Comment, {
            foreignKey: 'discussionId',
            as: 'comments',
        });
    };

    return Discussion;
};
