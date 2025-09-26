const map = require('lodash/map');
const models = require('../../src/db/models');
const { redisClient } = require('../../src/configs/redis');

module.exports = async function truncate() {
    await redisClient.flushDb();

    return await Promise.all(
        map(Object.keys(models), (key) => {
            if (['sequelize', 'Sequelize'].includes(key)) return null;
            return models[key].destroy({
                where: {},
                truncate: true,
                cascade: true,
                restartIdentity: true,
                force: true,
            });
        }),
    );
};
