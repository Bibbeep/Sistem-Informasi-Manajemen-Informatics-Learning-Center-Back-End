const models = require('../../models');

const data = async (props = {}) => {
    const defaultProps = {
        commentId: props.commentId,
        userId: props.userId,
    };

    return { ...defaultProps, ...props };
};

module.exports = async (props = {}) => {
    return models.Like.create(await data(props));
};
