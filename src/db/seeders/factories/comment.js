const { fakerID_ID: faker } = require('@faker-js/faker');
const models = require('../../models');

const data = async (props = {}) => {
    const defaultProps = {
        discussionId: props.discussionId,
        userId: props.userId,
        parentCommentId: props.parentCommentId || null,
        message: faker.lorem.paragraph(),
    };

    return { ...defaultProps, ...props };
};

module.exports = async (props = {}) => {
    return models.Comment.create(await data(props));
};
