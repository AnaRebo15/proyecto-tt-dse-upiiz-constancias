const { createLogger, format, transports } = require('winston');
const { combine, printf } = format;
const moment = require('moment-timezone');
const path = require('path');

const timezoned = () => moment().tz('America/Mexico_City').format();

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
    format: combine(
        format.timestamp({ format: timezoned }),
        myFormat
    ),
    transports: [
        new transports.File({ filename: path.join(__dirname, '../../logs/eventos.log') })
    ]
});

module.exports = logger;