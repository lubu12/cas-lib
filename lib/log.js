'use strict';

const { createLogger, format, transports } = require('winston');
const { combine, printf } = format;
const moment = require('moment-timezone');

// Need to have .env file at application root folder with NODE_ENV
// Run Log.initialize(yourLogFilePath) when app starts
//
class Log {
  /**
   * @class
   * @classdesc Log class by Winston
   */
  constructor() { }

  /**
   * Initialize Log class
   * 
   * @param {string} errorLogFilePath Error log file path
   * @param {string} [dbErrorLogFilePath] Database log file path, required for DBWrite type
   * @param {boolean} [showConsole=false] Default showing error at console log setting
   */
  static initialize(errorLogFilePath, dbErrorLogFilePath, showConsole= false) {
    if (!errorLogFilePath) { throw new Error("no-error-logfile-path-specified"); }
    Log.errorLogFilePath = errorLogFilePath;
    if (dbErrorLogFilePath) { Log.dbErrorLogFilePath = dbErrorLogFilePath; }
    Log.showConsole = showConsole;
  }

  /**
   * Get the customized error log format
   */
  static get errorFormat() {
    return printf(({ level, message, label, timestamp })=> {
      return `${timestamp} [${label}] ${level}: ${message}`;
    });
  }

  /**
   * Append the timestamp at log message
   */
  static get appendTimestamp() {
    return format((info, opts)=> {
      if(opts.tz) { info.timestamp = moment().tz(opts.tz).format(); }
      return info;
    });
  }

  /**
   * instantiate a new Winston Logger with the settings defined above
   * 
   * @param {string} [type] Log type, "DBWrite"
   * @param {number} [maxsize=5242880] Default log file size is 5242880 bytes, i.e., 5MB
   */
  static createLog(type, maxsize = 5242880) {
    let myLogger = createLogger({
      format: combine(
        Log.appendTimestamp({ tz: Intl.DateTimeFormat().resolvedOptions().timeZone }),
        Log.errorFormat
      ),
      transports: [
        new transports.File({
          level: 'error',
          filename: type === "DBWrite" ? Log.dbErrorLogFilePath : Log.errorLogFilePath,
          handleExceptions: true,
          json: true,
          maxsize: maxsize,
          colorize: false
        }),
      ],
      exitOnError: false, // do not exit on handled exceptions
    });

    if (type === "DBWrite") { Log.dbWriteLogger = myLogger; }
    else { Log.errorLogger = myLogger; }
  }

  /**
   * Log the error
   * 
   * @param {string} urlPath URL path of the error occurs
   * @param {object} err Error object
   * @param {boolean} [show] Override default setting
   * @param {string} [type] Log type, "DBWrite"
   */
  static async log(urlPath, err, show, type) {
    if (type === "DBWrite" && !Log.dbWriteLogger) { Log.createLog(type); }
    else if (!Log.errorLogger) { Log.createLog(); }

    // if JSON.stringify fails, remove all line breaks with a space and remove extra spaces
    //
    let message = typeof err === "undefined" ? "undefined" : err.stack || err;
    try { message = JSON.stringify(message); } catch (e) { message = message.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g," "); }

    if (type === "DBWrite") { Log.dbWriteLogger.error({ label: urlPath, message: message }); }
    else { Log.errorLogger.error({ label: urlPath, message: message }); }

    // By default, error log will be shown at console for development environment. It can be overriden by using show parameter at log function.
    //
    if (typeof show === 'undefined' ? Log.showConsole : show) { console.log(err); }
  }
}

module.exports = Log;