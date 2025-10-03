const { fakerID_ID: faker } = require('@faker-js/faker');
const models = require('../../models');

const data = async (props = {}) => {
    const defaultProps = {
        userId: props.userId,
        programId: props.programId,
    };

    const status = faker.helpers.arrayElement([
        'Unpaid',
        'In Progress',
        'Completed',
    ]);
    let progressPercentage = 0;
    let completedAt = null;

    if (status === 'Completed') {
        progressPercentage = 100;
        completedAt = faker.date.past();
    } else if (status === 'In Progress') {
        progressPercentage = faker.number.float({
            min: 1,
            max: 99,
            fractionDigits: 2,
        });
    }

    return {
        ...defaultProps,
        status,
        progressPercentage,
        completedAt,
        ...props,
    };
};

module.exports = async (props = {}) => {
    return models.Enrollment.create(await data(props));
};
