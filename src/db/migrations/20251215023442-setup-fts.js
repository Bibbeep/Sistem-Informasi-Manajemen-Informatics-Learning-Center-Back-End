'use strict';
const vectorName = '_search';
const searchObjects = {
    programs: ['title', 'description'],
    discussions: ['title', 'main_content'],
    feedbacks: ['full_name', 'email', 'message'],
    users: ['full_name', 'email'],
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.transaction((t) => {
            return Promise.all(
                Object.keys(searchObjects).map((table) => {
                    return queryInterface.sequelize
                        .query(
                            `ALTER TABLE "${table}" ADD COLUMN "${vectorName}" TSVECTOR;`,
                            { transaction: t },
                        )
                        .then(() => {
                            return queryInterface.sequelize.query(
                                `UPDATE "${table}" SET "${vectorName}" = to_tsvector('english', ${searchObjects[table].join(" || ' ' || ")});`,
                                { transaction: t },
                            );
                        })
                        .then(() => {
                            return queryInterface.sequelize.query(
                                `CREATE INDEX ${table}_search ON "${table}" USING gin("${vectorName}");`,
                                { transaction: t },
                            );
                        })
                        .then(() => {
                            return queryInterface.sequelize.query(
                                `
                                CREATE TRIGGER ${table}_vector_update
                                BEFORE INSERT OR UPDATE ON "${table}"
                                FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger("${vectorName}", 'pg_catalog.english', ${searchObjects[table].join(', ')});
                                `,
                                { transaction: t },
                            );
                        });
                }),
            );
        });
    },

    async down(queryInterface) {
        await queryInterface.sequelize.transaction((t) => {
            return Promise.all(
                Object.keys(searchObjects).map((table) => {
                    return queryInterface.sequelize
                        .query(
                            `DROP TRIGGER ${table}_vector_update ON "${table}";`,
                            { transaction: t },
                        )
                        .then(() => {
                            return queryInterface.sequelize.query(
                                `DROP INDEX ${table}_search;`,
                                { transaction: t },
                            );
                        })
                        .then(() => {
                            return queryInterface.sequelize.query(
                                `ALTER TABLE "${table}" DROP COLUMN "${vectorName}";`,
                                { transaction: t },
                            );
                        });
                }),
            );
        });
    },
};
