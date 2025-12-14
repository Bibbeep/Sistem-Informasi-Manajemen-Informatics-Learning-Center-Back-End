const { fakerID_ID: faker } = require('@faker-js/faker');
const models = require('../../models');

const data = async (props = {}) => {
    const defaultProps = {
        userId: props.userId,
        title: faker.lorem.sentence(),
        mainContent: faker.lorem.paragraphs(),
    };

    return { ...defaultProps, ...props };
};

module.exports = async (props = {}) => {
    return models.Discussion.create(await data(props));
};
