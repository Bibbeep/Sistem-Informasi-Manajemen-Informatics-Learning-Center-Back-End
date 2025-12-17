const fs = require('fs');
const path = require('path');
const {
    User,
    Program,
    Enrollment,
    Invoice,
    Discussion,
    Comment,
    Certificate,
} = require('../models');

const seedDatabase = async () => {
    try {
        const users = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, '../data/users.json'),
                'utf-8',
            ),
        );
        const programs = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, '../data/programs.json'),
                'utf-8',
            ),
        );
        const enrollments = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, '../data/enrollments.json'),
                'utf-8',
            ),
        );
        const invoices = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, '../data/invoices.json'),
                'utf-8',
            ),
        );
        const discussions = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, '../data/discussions.json'),
                'utf-8',
            ),
        );
        const comments = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, '../data/comments.json'),
                'utf-8',
            ),
        );
        const certificates = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, '../data/certificates.json'),
                'utf-8',
            ),
        );

        await User.bulkCreate(users, { ignoreDuplicates: true });
        await Program.bulkCreate(programs, { ignoreDuplicates: true });
        await Enrollment.bulkCreate(enrollments, { ignoreDuplicates: true });
        await Invoice.bulkCreate(invoices, { ignoreDuplicates: true });
        await Discussion.bulkCreate(discussions, { ignoreDuplicates: true });
        await Comment.bulkCreate(comments, { ignoreDuplicates: true });
        await Certificate.bulkCreate(certificates, { ignoreDuplicates: true });

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        process.exit();
    }
};

seedDatabase();
