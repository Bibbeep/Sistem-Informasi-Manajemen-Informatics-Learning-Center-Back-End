const { fakerID_ID: faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const models = require('../../models');

const data = async (props = {}) => {
    const hashedPassword = await bcrypt.hash(
        faker.internet.password({
            length: faker.number.int({
                min: 8,
                max: 72,
            }),
        }),
        10,
    );

    const defaultProps = {
        email: faker.internet.email(),
        hashedPassword,
        fullName: faker.person.fullName(),
        memberLevel: faker.helpers.arrayElement(['Basic', 'Premium']),
        role: faker.helpers.arrayElement(['User', 'Admin']),
        pictureUrl: faker.internet.url(),
    };

    return Object.assign({}, defaultProps, props);
};

module.exports = async (props = {}) => {
    return models.User.create(await data(props));
};
