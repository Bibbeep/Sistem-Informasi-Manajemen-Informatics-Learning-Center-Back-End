'use strict';
module.exports = (sequelize, DataTypes) => {
    const Like = sequelize.define(
        'Like',
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            commentId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                field: 'comment_id',
                references: {
                    model: 'comments',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            userId: {
                allowNull: true,
                type: DataTypes.INTEGER,
                field: 'user_id',
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
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
            tableName: 'comment_likes',
        },
    );

    Like.associate = (models) => {
        Like.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });

        Like.belongsTo(models.Comment, {
            foreignKey: 'commentId',
            as: 'comment',
        });
    };

    return Like;
};
