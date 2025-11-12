const { faker } = require('@faker-js/faker');
const models = require('../../models');

const data = async (props = {}) => {
    const defaultProps = {
        enrollmentId: props.enrollmentId,
        userId: props.userId,
        title: `${faker.lorem.words(3)} Certificate of Completion`,
        credential: faker.string.alphanumeric(13).toUpperCase(),
        documentUrl: faker.internet.url(),
        issuedAt: new Date(),
        expiredAt: faker.date.future(),
    };
    return { ...defaultProps, ...props };
};

module.exports = async (props = {}) => {
    return models.Certificate.create(await data(props));
};
