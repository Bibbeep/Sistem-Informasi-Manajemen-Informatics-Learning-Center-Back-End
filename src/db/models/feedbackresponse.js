'use strict';
module.exports = (sequelize, DataTypes) => {
    const FeedbackResponse = sequelize.define(
        'FeedbackResponse',
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            feedbackId: {
                type: DataTypes.INTEGER,
                field: 'feedback_id',
                allowNull: false,
            },
            adminUserId: {
                type: DataTypes.INTEGER,
                field: 'admin_user_id',
                allowNull: false,
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
        },
        {
            tableName: 'feedback_responses',
        },
    );

    FeedbackResponse.associate = (models) => {
        FeedbackResponse.belongsTo(models.Feedback, {
            foreignKey: 'feedbackId',
            as: 'feedback',
        });
        FeedbackResponse.belongsTo(models.User, {
            foreignKey: 'adminUserId',
            as: 'user',
        });
    };

    return FeedbackResponse;
};
