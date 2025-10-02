/**
 * Input Validation Schemas using Joi
 * Prevents injection attacks and ensures data integrity
 */

import Joi from 'joi';

/**
 * Age Verification Schema
 */
const ageVerificationSchema = Joi.object({
  birthdate: Joi.date()
    .iso()
    .max('now')
    .required()
    .messages({
      'date.base': 'Birthdate must be a valid date',
      'date.max': 'Birthdate cannot be in the future',
      'any.required': 'Birthdate is required'
    }),
  metadata: Joi.object({
    sessionId: Joi.string().uuid().optional(),
    referrer: Joi.string().uri().optional(),
    userAgent: Joi.string().max(500).optional()
  }).optional()
});

/**
 * User Registration Schema
 */
const userRegistrationSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .max(255)
    .required()
    .messages({
      'string.email': 'Must be a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
      'string.min': 'Password must be at least 8 characters',
      'any.required': 'Password is required'
    }),
  firstName: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .pattern(/^[a-zA-Z\s'-]+$/)
    .required(),
  lastName: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .pattern(/^[a-zA-Z\s'-]+$/)
    .required(),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Phone number must be in E.164 format'
    })
});

/**
 * Login Schema
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required(),
  password: Joi.string()
    .min(8)
    .max(128)
    .required()
});

/**
 * Membership Schema
 */
const membershipSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  tier: Joi.string()
    .valid('free', 'bronze', 'silver', 'gold', 'platinum')
    .required(),
  startDate: Joi.date().iso().default(() => new Date()),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).optional(),
  autoRenew: Joi.boolean().default(true),
  paymentMethod: Joi.object({
    type: Joi.string().valid('card', 'ach', 'crypto').required(),
    last4: Joi.string().length(4).pattern(/^\d+$/).optional(),
    expiryMonth: Joi.number().min(1).max(12).optional(),
    expiryYear: Joi.number().min(new Date().getFullYear()).optional()
  }).optional()
});

/**
 * BigQuery Query Schema
 */
const bigQuerySchema = Joi.object({
  query: Joi.string()
    .max(10000)
    .required()
    .messages({
      'string.max': 'Query must not exceed 10000 characters'
    }),
  parameters: Joi.array()
    .items(Joi.object({
      name: Joi.string().required(),
      value: Joi.any().required(),
      type: Joi.string().valid('STRING', 'INT64', 'FLOAT64', 'BOOL', 'DATE', 'TIMESTAMP').required()
    }))
    .max(100)
    .optional(),
  maxResults: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .default(1000),
  timeoutMs: Joi.number()
    .integer()
    .min(1000)
    .max(300000)
    .default(30000)
});

/**
 * Product/Item ID Schema
 */
const itemIdSchema = Joi.object({
  itemId: Joi.string()
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .max(255)
    .required()
    .messages({
      'string.pattern.base': 'Item ID contains invalid characters'
    })
});

/**
 * Pagination Schema
 */
const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20),
  sortBy: Joi.string()
    .pattern(/^[a-zA-Z_]+$/)
    .max(50)
    .optional(),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('asc')
});

/**
 * Raffle Entry Schema
 */
const raffleEntrySchema = Joi.object({
  userId: Joi.string().uuid().required(),
  raffleId: Joi.string().uuid().required(),
  entries: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(1),
  metadata: Joi.object({
    source: Joi.string().max(100).optional(),
    referralCode: Joi.string().pattern(/^[A-Z0-9]{6,12}$/).optional()
  }).optional()
});

/**
 * Compliance Query Schema
 */
const complianceQuerySchema = Joi.object({
  startDate: Joi.date()
    .iso()
    .max('now')
    .optional(),
  endDate: Joi.date()
    .iso()
    .max('now')
    .greater(Joi.ref('startDate'))
    .optional(),
  metric: Joi.string()
    .valid('ageVerification', 'productCompliance', 'texasCompliance', 'all')
    .default('all')
});

/**
 * UUID Parameter Schema
 */
const uuidParamSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Must be a valid UUID',
      'any.required': 'ID is required'
    })
});

/**
 * Date Range Schema
 */
const dateRangeSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required()
}).messages({
  'date.greater': 'End date must be after start date'
});

export {
  ageVerificationSchema,
  userRegistrationSchema,
  loginSchema,
  membershipSchema,
  bigQuerySchema,
  itemIdSchema,
  paginationSchema,
  raffleEntrySchema,
  complianceQuerySchema,
  uuidParamSchema,
  dateRangeSchema
};
// Last optimized: 2025-10-02
