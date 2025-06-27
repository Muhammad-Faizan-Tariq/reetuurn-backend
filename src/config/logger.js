import morgan from 'morgan';
import chalk from 'chalk';


morgan.token('datetime', () => {
    const now = new Date();
    return chalk.gray(`[${now.toISOString().replace('T', ' ').substring(0, 19)}]`);
});


morgan.token('methodColor', (req) => {
    const method = req.method;
    switch (method) {
        case 'GET':
            return chalk.green(method);
        case 'POST':
            return chalk.blue(method);
        case 'PUT':
            return chalk.yellow(method);
        case 'DELETE':
            return chalk.red(method);
        default:
            return chalk.white(method);
    }
});


morgan.token('statusColor', (req, res) => {
    const status = res.statusCode;
    if (status >= 500) return chalk.red(status);
    if (status >= 400) return chalk.yellow(status);
    if (status >= 300) return chalk.cyan(status);
    return chalk.green(status);
});

morgan.token('urlColor', (req) => chalk.magenta(req.originalUrl));
morgan.token('responseTimeColor', (req, res, digits) => {
    const time = res.getHeader('X-Response-Time');
    return chalk.white(`${time || '0.000'} ms`);
});


const logFormat = ':datetime :methodColor :urlColor :statusColor :responseTimeColor - -';


const logger = morgan(logFormat);

export default logger;