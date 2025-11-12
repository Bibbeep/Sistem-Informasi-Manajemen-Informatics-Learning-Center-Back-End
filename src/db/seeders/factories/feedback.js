const { fakerID_ID: faker } = require('@faker-js/faker');
const models = require('../../models');

const data = async (props = {}) => {
    const defaultProps = {
        email: faker.internet.email(),
        fullName: faker.person.fullName(),
        message: faker.lorem.text(),
    };

    return Object.assign({}, defaultProps, props);
};

module.exports = async (props = {}) => {
    return models.Feedback.create(await data(props));
};
