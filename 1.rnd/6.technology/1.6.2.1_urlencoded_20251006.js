/*!
 * body-parser
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 * @private
 */

const createError = require('http-errors')
const debug = require('debug')('body-parser:urlencoded')
const isFinished = require('on-finished').isFinished
const read = require('../read')
const typeis = require('type-is')
const qs = require('qs')
const { getCharset, normalizeOptions } = require('../utils')

/**
 * Module exports.
 */

module.exports = urlencoded

/**
 * Create a middleware to parse urlencoded bodies.
 *
 * @param {object} [options]
 * @return {function}
 * @public
 */

function urlencoded (options) {
  const { inflate, limit, verify, shouldParse } = normalizeOptions(options, 'application/x-www-form-urlencoded')

  const defaultCharset = options?.defaultCharset || 'utf-8'
  if (defaultCharset !== 'utf-8' && defaultCharset !== 'iso-8859-1') {
    throw new TypeError('option defaultCharset must be either utf-8 or iso-8859-1')
  }

  // create the appropriate query parser
  const queryparse = createQueryParser(options)

  function parse (body, encoding) {
    return body.length
      ? queryparse(body, encoding)
      : {}
  }

  return function urlencodedParser (req, res, next) {
    if (isFinished(req)) {
      debug('body already parsed')
      next()
      return
    }

    if (!('body' in req)) {
      req.body = undefined
    }

    // skip requests without bodies
    if (!typeis.hasBody(req)) {
      debug('skip empty body')
      next()
      return
    }

    debug('content-type %j', req.headers['content-type'])

    // determine if request should be parsed
    if (!shouldParse(req)) {
      debug('skip parsing')
      next()
      return
    }

    // assert charset
    const charset = getCharset(req) || defaultCharset
    if (charset !== 'utf-8' && charset !== 'iso-8859-1') {
      debug('invalid charset')
      next(createError(415, 'unsupported charset "' + charset.toUpperCase() + '"', {
        charset: charset,
        type: 'charset.unsupported'
      }))
      return
    }

    // read
    read(req, res, next, parse, debug, {
      encoding: charset,
      inflate,
      limit,
      verify
    })
  }
}

/**
 * Get the extended query parser.
 *
 * @param {object} options
 */

function createQueryParser (options) {
  const extended = Boolean(options?.extended)
  let parameterLimit = options?.parameterLimit !== undefined
    ? options?.parameterLimit
    : 1000
  const charsetSentinel = options?.charsetSentinel
  const interpretNumericEntities = options?.interpretNumericEntities
  const depth = extended ? (options?.depth !== undefined ? options?.depth : 32) : 0

  if (isNaN(parameterLimit) || parameterLimit < 1) {
    throw new TypeError('option parameterLimit must be a positive number')
  }

  if (isNaN(depth) || depth < 0) {
    throw new TypeError('option depth must be a zero or a positive number')
  }

  if (isFinite(parameterLimit)) {
    parameterLimit = parameterLimit | 0
  }

  return function queryparse (body, encoding) {
    const paramCount = parameterCount(body, parameterLimit)

    if (paramCount === undefined) {
      debug('too many parameters')
      throw createError(413, 'too many parameters', {
        type: 'parameters.too.many'
      })
    }

    const arrayLimit = extended ? Math.max(100, paramCount) : 0

    debug('parse ' + (extended ? 'extended ' : '') + 'urlencoding')
    try {
      return qs.parse(body, {
        allowPrototypes: true,
        arrayLimit: arrayLimit,
        depth: depth,
        charsetSentinel: charsetSentinel,
        interpretNumericEntities: interpretNumericEntities,
        charset: encoding,
        parameterLimit: parameterLimit,
        strictDepth: true
      })
    } catch (err) {
      if (err instanceof RangeError) {
        throw createError(400, 'The input exceeded the depth', {
          type: 'querystring.parse.rangeError'
        })
      } else {
        throw err
      }
    }
  }
}

/**
 * Count the number of parameters, stopping once limit reached
 *
 * @param {string} body
 * @param {number} limit
 * @api private
 */

function parameterCount (body, limit) {
  const len = body.split('&').length

  return len > limit ? undefined : len - 1
}
