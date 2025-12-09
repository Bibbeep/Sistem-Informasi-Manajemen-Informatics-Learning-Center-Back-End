const cron = require('node-cron');
const chalk = require('chalk');
const { Op } = require('sequelize');
const { Invoice, Enrollment, sequelize } = require('../db/models');

class SchedulerService {
    static cronJob = null;

    /**
     * Start cron job to check whether invoice's paymentDueDatetime is past expiration and change its status for every minute (* * * * *)
     * @static
     */
    static start() {
        if (this.cronJob) {
            return;
        }

        console.log(chalk.blue('[Cron Job]'), 'Job is starting');

        this.cronJob = cron.schedule('* * * * *', async () => {
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

                        await Enrollment.destroy({
                            where: {
                                id: enrollmentIds,
                            },
                            transaction: t,
                        });
                    }
                });
            } catch (err) {
                console.error('[Cron Job] Error:', err);
            }
        });
    }

    /**
     * Stop the running cron job
     * @static
     */
    static stop() {
        if (this.cronJob) {
            console.log(chalk.blue('[Cron Job]'), 'Job is stopping');
            this.cronJob.destroy();
            this.cronJob = null;
        }
    }
}

module.exports = SchedulerService;
