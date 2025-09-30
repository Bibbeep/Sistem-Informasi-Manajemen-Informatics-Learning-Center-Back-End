const { fakerID_ID: faker } = require('@faker-js/faker');
const models = require('../../models');

const data = async (props = {}) => {
    const isOnline = faker.datatype.boolean();
    const defaultProps = {
        programId: props.programId,
        isOnline: isOnline,
        videoConferenceUrl: isOnline ? faker.internet.url() : null,
        contestRoomUrl: isOnline ? faker.internet.url() : null,
        locationAddress: isOnline ? null : faker.location.streetAddress(),
        hostName: faker.company.name(),
        totalPrize: faker.number.int({ min: 1000000, max: 50000000 }),
    };
    return Object.assign({}, defaultProps, props);
};

module.exports = async (props = {}) => {
    return models.Competition.create(await data(props));
};
