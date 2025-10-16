const { fakerID_ID: faker } = require('@faker-js/faker');
const models = require('../../models');

const data = async (props = {}) => {
    const defaultProps = {
        adminUserId: props.adminUserId,
        title: faker.lorem.sentence(),
    };

    return { ...defaultProps, ...props };
};

module.exports = async (props = {}) => {
    return models.Discussion.create(await data(props));
};
