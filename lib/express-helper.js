'use strict';

const Notifier = require('notifier-slack-sns');
const Cognito = require('aws-cognito-ops');
const { callAPIWithoutJWT: callAPI } = require("./cas-axios");

/**
 * Set accessToken by stored credentials
 * 
 * @param {boolean} [reset=false] Set true to reset accesstoken
 * @returns {promise} Promise with access token string
 */
const getAccessToken = async (reset = false)=> {
  if (reset || typeof Cognito.accessToken === "undefined" || (Date.now() - (Cognito.tokenTs || 0) - Number(Cognito.accessTokenExp) * 1000) > 0) {
    const result = await Cognito.getTokenByAPI(Cognito.username, Cognito.password, false);
  
    Cognito.tokenTs = Date.now();
    Cognito.accessToken = result;
  }

  return Promise.resolve(Cognito.accessToken);
}

/**
 * Call API service
 * 
 * @param {string} apiUrl Api url string
 * @param {string} method Request method, E.g, "GET", "POST" and etc
 * @param {string} path API url path
 * @param {object} [body] Request body
 * @param {string} [accessToken] Authorization access token
 * @returns {promise} Promise with response object
 */
const callApi = async (apiUrl, method, path, body, accessToken)=> {
  accessToken = accessToken ?? await getAccessToken();

  let error, result = await callAPI(method, `${apiUrl}${path}`, body, { Authorization: `Bearer ${accessToken}` }).catch(err => error = err);

  // If return 401 unauthorized, reset accesstoken and try again
  //
  if (error?.response?.status === 401) {
    accessToken = await getAccessToken(true);
    error = undefined;
    result = await callAPI(method, `${apiUrl}${path}`, body, { Authorization: `Bearer ${accessToken}` }).catch(err => error = err);
  }

  if (typeof error !== "undefined") { return Promise.reject(rejectMsg(error?.response?.data ?? error, error?.response?.status)); }

  return Promise.resolve(result);
}

/**
 * Call API service with form parameters
 * 
 * @param {string} apiUrl Api url string
 * @param {string} method Request method, E.g, "GET", "POST" and etc
 * @param {string} path API url path
 * @param {object} body Request body object
 * @returns {promise} Promise with response object
 */
const callApiWithForm = async (apiUrl, method, path, body)=> {
  let error, result = await callAPI(method, `${apiUrl}${path}`, new URLSearchParams(body).toString(), { "Content-Type": "application/x-www-form-urlencoded" }).catch(err => error = err);
  if (typeof error !== "undefined") { return Promise.reject(rejectMsg(error?.response?.data ?? error, error?.response?.status)); }

  return Promise.resolve(result);
}

/**
 * Response handler with support to send notification on error
 * 
 * ```
 * res: ExpressJS response object
 * next: ExpressJS next function for using ExpressJS error handler
 * (Required if async procedure) promise: Promise for handler to response (for async procedure)
 * (Required if sync procedure) result: Result for handler to response (for sync procedure)
 * (Optional) error: Result for handler to response (for sync procedure)
 * (Optional) error_message_prefix: Error prefix for message to notification channel
 * (Optional) status_code_threshold: Status code threshold to send notification. Default is 500. To turn off notifier, use 600
 * (Optional) default_notify_channel: Default notification channel if error.channel is not set.  Default is "slack"
 * (Optional) success_status: Set a different response http status code other than 200.
 * ```
 * 
 * @param {object} obj
 * @param {object} obj.res ExpressJS response object
 * @param {function} obj.next ExpressJS next function for using ExpressJS error handler
 * @param {promise} [obj.promise] Promise for handler to response (for async procedure)
 * @param {object} [obj.result] Result for handler to response (for sync procedure)
 * @param {object} [obj.error] Error for handler to response (for sync procedure)
 * @param {string} [obj.error_message_prefix] Error prefix for message to notification channel
 * @param {number} [obj.status_code_threshold=500] Status code threshold to send notification. Default is 500. To turn off notifier, use 600
 * @param {string} [obj.default_notify_channel=slack] Default notification channel if error.channel is not set.  Default is `slack`
 * @param {number} [obj.success_status=200] Set a different response http status code other than 200.
 * @returns 
 */
const handleRes = async ({ res, next, promise, result, error, error_message_prefix, status_code_threshold = 500, default_notify_channel = "slack", success_status = 200 })=> {
  try {
    if (promise) { result = await promise.catch(err => error = err); }

    if (typeof error !== "undefined") {
      if (typeof error.status === "undefined") {
        const errMessage = error.message ?? error;
        error = { message: (typeof errMessage !== "string" ? JSON.stringify(errMessage) : errMessage) };
      }
      error.status = error.status || 500;

      if (error.status >= status_code_threshold) {
        const resError = error.message ?? error;
        await Notifier.sendSystemErrorMsg(error.channel || default_notify_channel, `${error_message_prefix ? error_message_prefix + " | " : ""}${typeof resError === "string" ? resError : JSON.stringify(resError)}`);
      }
      return Promise.reject(error);
    }
  
    res.status(success_status).json(result);
  } catch (err) { next(err); }
}

/**
 * Return object for error return
 * 
 * @param {object|string} error Error object or message
 * @param {number} [status] Http status code
 * @param {object} [stack] Error stack object
 * @param {object} [options] Optional message to pass back
 * @returns {object} Error object for return
 */
const rejectMsg = (error, status, stack, options)=> {
  let result;
  if (typeof status !== "undefined") {
    result = { status: status, message: error };
    if (typeof stack !== "undefined") { result.stack = stack; }
  }
  else { result = { status: error.status || 500, message: error.message || (typeof error === "string" ? error: JSON.stringify(error)), stack: error.stack || error }; }
 
  if (typeof options !== "undefined") { result = { ...result, ...options }; }
  return result;
}

/**
 * Custom exception with custom status code
 * 
 * @param {string} message Error message string
 * @param {number} status Status code
 * @returns {error} Error object
 */
function CustomException(message, status = 500) {
  const error = new Error(message);
  error.status = status;
  return error;
}
CustomException.prototype = Object.create(Error.prototype);

module.exports = {
  getAccessToken,
  callApi,
  callApiWithForm,
  handleRes,
  rejectMsg,
  CustomException
};