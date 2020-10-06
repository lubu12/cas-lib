'use strict';

const { createLogger, format, transports } = require('winston');
const { combine, printf } = format;
const moment = require('moment-timezone');

// Need to have .env file at application root folder with NODE_ENV
// Run Log.initialize(yourLogFilePath) when app starts
//
class Log {
  static errorLogFilePath; dbErrorLogFilePath; errorLogger; dbWriteLogger; showConsole;

  constructor() { }

  // default errorLogFilePath is required
  // DbErrorLogFilePath is optional, it is only needed for DBWrite type
  //
  static initialize(errorLogFilePath, dbErrorLogFilePath, showConsole) {
    if (!errorLogFilePath) { throw new Error("no-error-logfile-path-specified"); }
    Log.errorLogFilePath = errorLogFilePath;
    if (dbErrorLogFilePath) { Log.dbErrorLogFilePath = dbErrorLogFilePath; }
    Log.showConsole = showConsole ? showConsole : false;
  }

  static get errorFormat() {
    return printf(({ level, message, label, timestamp })=> {
      return `${timestamp} [${label}] ${level}: ${message}`;
    });
  }

  static get appendTimestamp() {
    return format((info, opts)=> {
      if(opts.tz){ info.timestamp = moment().tz(opts.tz).format(); }
      return info;
    });
  }

  static createLog(type, maxsize) {
    // define the custom settings for each transport (file, console)
    //
    var options = {
      file: {
        level: 'error',
        filename: type === "DBWrite" ? Log.dbErrorLogFilePath : Log.errorLogFilePath,
        // filename: Log.logFilePath,
        handleExceptions: true,
        json: true,
        maxsize: maxsize ? maxsize : 5242880, // 5MB
        colorize: false
      }
    };

    // instantiate a new Winston Logger with the settings defined above
    //
    let myLogger = createLogger({
      format: combine(
        Log.appendTimestamp({ tz: Intl.DateTimeFormat().resolvedOptions().timeZone }),
        Log.errorFormat
      ),
      transports: [
        new transports.File(options.file),
      ],
      exitOnError: false, // do not exit on handled exceptions
    });

    if (type === "DBWrite") { Log.dbWriteLogger = myLogger; }
    else { Log.errorLogger = myLogger; }
  }

  // ShowConsole should be set to false at production environment
  //
  static async log(urlPath, err, show, type) {
    if (type === "DBWrite" && !Log.dbWriteLogger) { Log.createLog(type); }
    else if (!Log.errorLogger) { Log.createLog(); }

    // remove all line breaks with a space and remove extra spaces
    err = typeof err === 'undefined' ? "undefined" : err;
    const message = typeof err.stack !== 'undefined' ? err.stack.replace(/(\r\n|\n|\r)/gm," ").replace(/\s+/g," ") : err;

    if (type === "DBWrite") { Log.dbWriteLogger.error({ label:urlPath, message:message }); }
    else { Log.errorLogger.error({ label:urlPath, message:message }); }

    // By default, error log will be shown at console for development environment. It can be overriden by using show parameter at log function.
    //
    if (typeof show === 'undefined' ? Log.showConsole : show) { console.log(err); }
  }
}

module.exports = Log;