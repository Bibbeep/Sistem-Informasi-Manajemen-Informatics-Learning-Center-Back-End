const { fakerID_ID: faker } = require('@faker-js/faker');
const models = require('../../models');

const data = async (props = {}) => {
    const isOnline = faker.datatype.boolean();
    const defaultProps = {
        programId: props.programId,
        isOnline: isOnline,
        videoConferenceUrl: isOnline ? faker.internet.url() : null,
        locationAddress: isOnline ? null : faker.location.streetAddress(),
        speakerNames: Array.from(
            { length: faker.number.int({ min: 1, max: 4 }) },
            () => {
                return faker.person.fullName();
            },
        ),
    };
    return Object.assign({}, defaultProps, props);
};

module.exports = async (props = {}) => {
    return models.Seminar.create(await data(props));
};
