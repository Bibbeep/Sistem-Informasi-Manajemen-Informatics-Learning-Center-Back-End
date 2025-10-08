const cron = require('node-cron');
const chalk = require('chalk');
const { Op } = require('sequelize');
const { Invoice, Enrollment, sequelize } = require('../db/models');

class SchedulerService {
    /**
     * Start cron job to check whether invoice's paymentDueDatetime is past expiration and change its status for every minute (* * * * *)
     * @static
     */
    static start() {
        console.log(chalk.blue('[Cron Job]'), 'Job is starting');

        cron.schedule('* * * * *', async () => {
            try {
                await sequelize.transaction(async (t) => {
                    const expiredInvoices = await Invoice.findAll(
                        {
                            where: {
                                status: 'Unverified',
                                paymentDueDatetime: {
                                    [Op.lte]: new Date(),
                                },
                            },
                        },
                        {
                            transaction: t,
                        },
                    );

                    if (expiredInvoices.length > 0) {
                        const enrollmentIds = expiredInvoices.map((invoice) => {
                            return invoice.enrollmentId;
                        });

                        await Invoice.update(
                            {
                                status: 'Expired',
                            },
                            {
                                where: {
                                    id: expiredInvoices.map((invoice) => {
                                        return invoice.id;
                                    }),
                                },
                                transaction: t,
                            },
                        );

                        await Enrollment.update(
                            {
                                status: 'Expired',
                            },
                            {
                                where: {
                                    id: enrollmentIds,
                                },
                                transaction: t,
                            },
                        );
                    }
                });
            } catch (err) {
                console.error('[Cron Job] Error:', err);
            }
        });
    }
}

module.exports = SchedulerService;
