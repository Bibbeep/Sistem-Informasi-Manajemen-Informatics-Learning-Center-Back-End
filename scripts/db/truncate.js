const map = require('lodash/map');
const models = require('../../src/db/models');

module.exports = async function truncate() {
    return await Promise.all(
        map(Object.keys(models), (key) => {
            if (['sequelize', 'Sequelize'].includes(key)) return null;
            return models[key].destroy({ where: {}, force: true });
        }),
    );
};
