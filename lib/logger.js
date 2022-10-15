'use strict';

const { MongoDBToolSet } = require('mongodb-ops');
const Notifier = require('notifier-slack-sns');

module.exports = class Logger extends MongoDBToolSet {
  /**
   * @class
   * @classdesc Logger class to store and manage all requests to api services
   */
  constructor() { super(Logger.collectionName, Logger.connString); }

  /**
   * Log method to insert a log record for new request
   * 
   * @param {string} urlPath Request url path
   * @param {object} [requestData] Request body data object
   * @param {string} [method] Request http method
   * @param {boolean} [notifyError=true] Set true to notify error to SNS and Slack if configured. Default is true
   * @param {boolean} [rejectErr=false] Set true to return Promise.reject when error occurs. Default is false if notifyError is true. If notifyError is false, rejectErr will set true by system.
   * @returns {promise}
   */
  static async log(urlPath, requestData, method, notifyError = true, rejectErr = false) {
    let error;
    const result = await Logger.insertOne(Logger.collectionName, {
      ts: new Date(),
      url_path: urlPath,
      method,
      request: JSON.stringify(requestData)
    }, Logger.connString).catch(err => error = err);

    if (typeof error !== "undefined") {
      if (notifyError) { await Notifier.sendSystemErrorMsg("all", errorMsgFormatter(error)); }
      else { rejectErr = true; }

      if (rejectErr) { return Promise.reject(error); }
    }

    return Promise.resolve(result);
  }

  /**
   * Update error information to the exist log record
   * 
   * @param {string} id Log object id
   * @param {number} statusCode Response status code
   * @param {string} errorMsg Error message string
   * @param {boolean} [notifyError=true] Set true to notify error to SNS and Slack if configured. Default is true
   * @param {boolean} [rejectErr=false] Set true to return Promise.reject when error occurs. Default is false if notifyError is true. If notifyError is false, rejectErr will set true by system.
   * @returns {promise}
   */
  static async error(id, statusCode, errorMsg, notifyError = true, rejectErr = false) {
    let error;
    const result = await Logger.updateOne(Logger.collectionName, {
      $set: {
        status_code: statusCode,
        error: errorMsg
      }
    }, { _id: MongoDBToolSet.getObjectId(id) }, Logger.connString).catch(err => error = err);

    if (typeof error !== "undefined") {
      if (notifyError) { await Notifier.sendSystemErrorMsg("all", errorMsgFormatter(error)); }
      else { rejectErr = true; }

      if (rejectErr) { return Promise.reject(error); }
    }

    return Promise.resolve(result);
  }

  /**
   * Get log by query
   * 
   * @param {object} obj
   * @param {object} [obj.query] Query filter {@link https://docs.mongodb.com/manual/core/document/#document-query-filter}
   * @param {object} [obj.projection] Projection {@link https://docs.mongodb.com/manual/reference/method/db.collection.find/#find-projection}
   * @param {object} [obj.sort] Sort filter {@link https://docs.mongodb.com/manual/reference/method/cursor.sort/#cursor.sort} 
   * @param {object} [obj.pagination] Pagination `E.g., { startIndex: 11, endIndex: 20 }`
   * @returns {promise} Promise with object array
   */
  static async getDataByFilter({ query, projection, sort, pagination }) { return Promise.resolve(await MongoDBToolSet.getDataByFilter(Logger.collectionName, query, projection, sort, pagination, Logger.connString)); }

  /**
   * List record with optional no. of data counts
   * 
   * @param {object} obj
   * @param {object} [obj.query] Query filter {@link https://docs.mongodb.com/manual/core/document/#document-query-filter}
   * @param {object} [obj.projection] Projection {@link https://docs.mongodb.com/manual/reference/method/db.collection.find/#find-projection}
   * @param {object} [obj.sort] Sort filter {@link https://docs.mongodb.com/manual/reference/method/cursor.sort/#cursor.sort} 
   * @param {object} [obj.pagination] Pagination `E.g., { startIndex: 11, endIndex: 20 }`  
   * @param {boolean|string} [obj.show_count] Set true to return the data with total_count which is the record count on the data by query
   * @returns {promise} Promise with sync data object or array
   */
  static async list({ query, projection, sort, pagination, show_count }) {
    if (["true", true].includes(show_count)) {
      return Promise.resolve({
        total_count: await MongoDBToolSet.getDataCount(Logger.collectionName, query, Logger.connString),
        data: await Logger.getDataByFilter({ query, projection, sort, pagination })
      });
    }
    else { return Promise.resolve(await Logger.getDataByFilter({ query, projection, sort, pagination })); }
  }
}

/**
 * Error Message Formatter
 * 
 * @param {object} error Error
 * @returns {string} Error message
 */
const errorMsgFormatter = (error)=> {
  const message = error.message ?? error;
  return typeof message !== "string" ? JSON.stringify(message) : message;
}