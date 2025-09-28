const { fakerID_ID: faker } = require('@faker-js/faker');
const models = require('../../models');

const data = async (props = {}) => {
    const defaultProps = {
        title: faker.lorem.words(5),
        description: faker.lorem.paragraph(),
        thumbnailUrl: faker.image.url(),
        availableDate: faker.date.future(),
        type: faker.helpers.arrayElement([
            'Course',
            'Seminar',
            'Workshop',
            'Competition',
        ]),
        priceIdr: faker.number.int({ min: 100000, max: 5000000 }),
    };

    return Object.assign({}, defaultProps, props);
};

module.exports = async (props = {}) => {
    return models.Program.create(await data(props));
};
