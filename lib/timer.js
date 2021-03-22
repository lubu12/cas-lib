'use strict';

/**
 * Set timeout
 * 
 * @param {number} ms timeout in millisecond
 * @returns {promise}
 */
const timeout = async (ms)=> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  timeout
}