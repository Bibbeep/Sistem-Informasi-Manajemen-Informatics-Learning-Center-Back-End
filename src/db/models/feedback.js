'use strict';
module.exports = (sequelize, DataTypes) => {
    const Feedback = sequelize.define(
        'Feedback',
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            email: {
                allowNull: false,
                type: DataTypes.STRING,
                validate: {
                    isEmail: true,
                },
            },
            fullName: {
                allowNull: false,
                type: DataTypes.STRING,
                field: 'full_name',
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
            tableName: 'feedbacks',
        },
    );

    Feedback.associate = (models) => {
        Feedback.hasMany(models.FeedbackResponse, {
            foreignKey: 'feedbackId',
            as: 'responses',
        });
    };

    return Feedback;
};
