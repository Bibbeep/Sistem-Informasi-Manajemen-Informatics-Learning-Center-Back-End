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
            userId: {
                allowNull: true,
                type: DataTypes.INTEGER,
                field: 'user_id',
            },
            title: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            mainContent: {
                allowNull: false,
                type: DataTypes.TEXT,
                field: 'main_content',
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
            foreignKey: 'userId',
            as: 'user',
        });

        Discussion.hasMany(models.Comment, {
            foreignKey: 'discussionId',
            as: 'comments',
        });
    };

    return Discussion;
};
