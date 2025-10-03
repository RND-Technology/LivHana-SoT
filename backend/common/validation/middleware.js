/**
 * Optimized: 2025-10-02
 * RPM: 1.6.2.3.backend-common-optimization
 * Session: Elephant Strategy Batch 1
 *
 * Provides reusable request validation middleware for any HTTP surface.
 */
const COMMON_VALIDATION_OPTIONS = Object.freeze({
  abortEarly: false,
  stripUnknown: true,
  convert: true
});

const formatErrors = (details = []) =>
  details.map((detail) => ({
    field: detail.path.join('.'),
    message: detail.message,
    type: detail.type
  }));

const createValidator = ({ schema, sourceKey, errorMessage, assignSanitizedValue = true }) => {
  return (req, res, next) => {
    const candidate = req?.[sourceKey] ?? {};

    const { error, value } = schema.validate(candidate, COMMON_VALIDATION_OPTIONS);

    if (error) {
      return res.status(400).json({
        success: false,
        error: errorMessage,
        details: formatErrors(error.details)
      });
    }

    if (assignSanitizedValue) {
      req[sourceKey] = value;
    }

    next();
  };
};

export const validateBody = (schema) =>
  createValidator({
    schema,
    sourceKey: 'body',
    errorMessage: 'Validation failed'
  });

export const validateQuery = (schema) =>
  createValidator({
    schema,
    sourceKey: 'query',
    errorMessage: 'Invalid query parameters'
  });

export const validateParams = (schema) =>
  createValidator({
    schema,
    sourceKey: 'params',
    errorMessage: 'Invalid URL parameters'
  });

export const validateHeaders = (schema) =>
  createValidator({
    schema,
    sourceKey: 'headers',
    errorMessage: 'Invalid headers',
    assignSanitizedValue: false
  });

export default { validateBody, validateQuery, validateParams, validateHeaders };
