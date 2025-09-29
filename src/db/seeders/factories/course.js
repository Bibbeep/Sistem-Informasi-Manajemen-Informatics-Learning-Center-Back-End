const { fakerID_ID: faker } = require('@faker-js/faker');
const models = require('../../models');

const data = async (props = {}) => {
    const defaultProps = {
        programId: props.programId,
    };
    return Object.assign({}, defaultProps, props);
};

module.exports = async (props = {}) => {
    const course = await models.Course.create(await data(props));
    const moduleCount = faker.number.int({ min: 3, max: 7 });

    for (let i = 1; i <= moduleCount; i++) {
        await models.CourseModule.create({
            courseId: course.id,
            numberCode: i,
            materialUrl: faker.internet.url(),
            youtubeUrl: `https://www.youtube.com/watch?v=${faker.string.alphanumeric(11)}`,
        });
    }
    return course;
};
