'use strict';

const jwt = require('jsonwebtoken');

// Signing JWT on response json Async
const signJWT = async (secretKey, expiration, status, reqJSON)=>{
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

// Signing JWT on response json Sync
const signJWTSync = (secretKey, expiration, status, reqJSON)=>{
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