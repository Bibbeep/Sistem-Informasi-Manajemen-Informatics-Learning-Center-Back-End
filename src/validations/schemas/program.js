const Joi = require('joi');

// Query param for GET /api/v1/programs
const programQueryParam = Joi.object({
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().default(10),
    sort: Joi.string()
        .regex(/^-?(id|createdAt|price|availableDate)$/)
        .custom((value) => {
            if (value.includes('price')) {
                return value + 'Idr';
            }

            return value;
        })
        .default('id'),
    type: Joi.string()
        .valid('course', 'seminar', 'workshop', 'competition', 'all')
        .default('all'),
    'price.gte': Joi.number().integer().min(0).default(0),
    'price.lte': Joi.number().integer().positive(),
});

// Request body for POST /api/v1/programs
const program = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    availableDate: Joi.date().iso().required(),
    type: Joi.string()
        .valid('Course', 'Seminar', 'Workshop', 'Competition')
        .required(),
    priceIdr: Joi.number().integer().min(0).required(),
    isOnline: Joi.bool().when('type', {
        not: 'Course',
        then: Joi.required(),
        otherwise: Joi.forbidden(),
    }),
    videoConferenceUrl: Joi.string()
        .uri()
        .when('type', {
            not: 'Course',
            then: Joi.when('isOnline', {
                is: true,
                then: Joi.required(),
            }),
            otherwise: Joi.forbidden(),
        }),
    locationAddress: Joi.string().when('type', {
        not: 'Course',
        then: Joi.when('isOnline', {
            is: false,
            then: Joi.required(),
        }),
        otherwise: Joi.forbidden(),
    }),
    contestRoomUrl: Joi.string().uri().when('type', {
        is: 'Competition',
        then: Joi.optional(),
        otherwise: Joi.forbidden(),
    }),
    speakerNames: Joi.array().items(Joi.string().max(60)).max(10).when('type', {
        is: 'Seminar',
        then: Joi.optional(),
        otherwise: Joi.forbidden(),
    }),
    facilitatorNames: Joi.array()
        .items(Joi.string().max(60))
        .max(10)
        .when('type', {
            is: 'Workshop',
            then: Joi.optional(),
            otherwise: Joi.forbidden(),
        }),
    hostName: Joi.string().when('type', {
        is: 'Competition',
        then: Joi.optional(),
        otherwise: Joi.forbidden(),
    }),
    totalPrize: Joi.number().integer().min(0).when('type', {
        is: 'Competition',
        then: Joi.required(),
        otherwise: Joi.forbidden(),
    }),
}).unknown(false);

module.exports = {
    programQueryParam,
    program,
};
