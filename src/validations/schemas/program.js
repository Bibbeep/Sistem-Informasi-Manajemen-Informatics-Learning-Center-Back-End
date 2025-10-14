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
    id: Joi.number().integer().positive(),
    isAvailable: Joi.boolean(),
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
    availableDate: Joi.date().iso().greater('now').required(),
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

// Request body for PATCH /api/v1/programs/:programId
const programUpdate = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    availableDate: Joi.date().iso().greater('now').optional(),
    type: Joi.string()
        .valid('Course', 'Seminar', 'Workshop', 'Competition')
        .required(),
    priceIdr: Joi.number().integer().min(0).optional(),
    isOnline: Joi.bool()
        .when('type', {
            is: 'Course',
            then: Joi.forbidden(),
        })
        .optional(),
    videoConferenceUrl: Joi.string()
        .uri()
        .when('isOnline', {
            is: Joi.exist(),
            then: Joi.when('isOnline', {
                is: true,
                then: Joi.required(),
            }),
            otherwise: Joi.optional(),
        }),
    locationAddress: Joi.string().when('isOnline', {
        not: Joi.exist(),
        then: Joi.when('isOnline', {
            is: false,
            then: Joi.required(),
        }),
        otherwise: Joi.optional(),
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
        then: Joi.optional(),
        otherwise: Joi.forbidden(),
    }),
})
    .unknown(false)
    .min(2);

// Query param for GET /api/v1/programs/:programId/modules
const moduleQueryParam = Joi.object({
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().default(10),
    sort: Joi.string()
        .regex(/^-?(id|createdAt)$/)
        .default('id'),
});

// Request body for POST /api/v1/programs/:programId/modules/:moduleId
const modulePayload = Joi.object({
    numberCode: Joi.number().integer().positive().required(),
    youtubeUrl: Joi.string().uri().required(),
}).unknown(false);

// Request body for PATCH /api/v1/programs/:programId/modules/:moduleId
const moduleUpdate = Joi.object({
    numberCode: Joi.number().integer().positive().optional(),
    youtubeUrl: Joi.string().uri().optional(),
})
    .unknown(false)
    .min(1);

module.exports = {
    programQueryParam,
    program,
    programUpdate,
    moduleQueryParam,
    modulePayload,
    moduleUpdate,
};
