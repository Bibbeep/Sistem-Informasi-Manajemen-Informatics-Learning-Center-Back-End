const { fakerID_ID: faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const models = require('../../models');

const data = async (props = {}, plainPassword) => {
    const hashedPassword = await bcrypt.hash(
        plainPassword ||
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

module.exports = async (props = {}, plainPassword) => {
    return models.User.create(await data(props, plainPassword));
};
