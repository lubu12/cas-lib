'use strict';

const jwt = require('jsonwebtoken');

/**
 * Asynchronously sign JWT
 * 
 * @param {string} secretKey Secret key to sign JWT
 * @param {string} expiration Expiration on JWT, e.g, "5m"
 * @param {number} status HTTP response status code, e.g, 200
 * @param {object} reqJSON Request object
 * @returns {promise} Promise with JWT signed object
 */
const signJWT = async (secretKey, expiration, status, reqJSON)=> {
  // Everything is caught, no need to use .catch when calling this function
  try {
    var response;
    let token = jwt.sign({
      data: reqJSON
    }, secretKey, { expiresIn: expiration });

    response = {
      status: status,
      data: token
    };
  } catch (err) {
    response = {
      status: 500,
      data: err
    };
  }
  
  return Promise.resolve(response);
}

/**
 * Synchronously sign JWT
 * 
 * @param {string} secretKey Secret key to sign JWT
 * @param {string} expiration Expiration on JWT, e.g, "5m"
 * @param {number} status HTTP response status code, e.g, 200
 * @param {object} reqJSON Request object
 * @returns {promise} Promise with JWT signed object
 */
const signJWTSync = (secretKey, expiration, status, reqJSON)=> {
  // Everything is caught, no need to use try... catch when calling this function
  try {
    var response;
    let token = jwt.sign({
      data: reqJSON
    }, secretKey, { expiresIn: expiration });

    response = {
      status: status,
      data: token
    }
  } catch (err) {
    response = {
      status: 500,
      data: err
    }
  }

  return response;
}

module.exports = {
  signJWT,
  signJWTSync
};