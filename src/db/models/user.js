'use strict';
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
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
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            hashedPassword: {
                allowNull: false,
                type: DataTypes.STRING(60),
                field: 'hashed_password',
            },
            fullName: {
                allowNull: false,
                type: DataTypes.STRING,
                field: 'full_name',
            },
            memberLevel: {
                allowNull: false,
                type: DataTypes.ENUM('Basic', 'Premium'),
                field: 'member_level',
                defaultValue: 'Basic',
            },
            role: {
                allowNull: false,
                type: DataTypes.ENUM('User', 'Admin'),
                defaultValue: 'User',
            },
            pictureUrl: {
                allowNull: true,
                type: DataTypes.TEXT,
                field: 'picture_url',
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
            tableName: 'users',
        },
    );

    User.associate = (models) => {
        User.hasMany(models.FeedbackResponse, {
            foreignKey: 'adminUserId',
            as: 'feedbackResponses',
        });

        User.hasMany(models.Enrollment, {
            foreignKey: 'userId',
            as: 'enrollments',
            onDelete: 'CASCADE',
        });

        User.hasMany(models.Certificate, {
            foreignKey: 'userId',
            as: 'certificates',
        });

        User.hasMany(models.Discussion, {
            foreignKey: 'userId',
            as: 'discussions',
        });

        User.hasMany(models.Comment, {
            foreignKey: 'userId',
            as: 'comments',
        });

        User.hasMany(models.Like, {
            foreignKey: 'userId',
            as: 'likes',
        });
    };

    return User;
};
