'use strict';
module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define(
        'Comment',
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            discussionId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                field: 'discussion_id',
            },
            userId: {
                allowNull: true,
                type: DataTypes.INTEGER,
                field: 'user_id',
            },
            parentCommentId: {
                allowNull: true,
                type: DataTypes.INTEGER,
                field: 'parent_comment_id',
            },
            message: {
                allowNull: false,
                type: DataTypes.TEXT,
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
            tableName: 'comments',
            paranoid: true,
            deletedAt: 'deletedAt',
        },
    );

    Comment.associate = (models) => {
        Comment.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });

        Comment.belongsTo(models.Discussion, {
            foreignKey: 'discussionId',
            as: 'discussion',
        });

        Comment.belongsTo(models.Comment, {
            foreignKey: 'parentCommentId',
            as: 'parentComment',
        });

        Comment.hasMany(models.Comment, {
            foreignKey: 'parentCommentId',
            as: 'replies',
        });

        Comment.hasMany(models.Like, {
            foreignKey: 'commentId',
            as: 'likes',
        });
    };

    return Comment;
};
