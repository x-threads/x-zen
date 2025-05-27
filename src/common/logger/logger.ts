import chalk from "chalk";
import { ILogger } from "./interfaces/logger.interface";

interface LoggerOptions {
    timestamp?: boolean;
    context?: string | Symbol;
}

/**
 * Singleton Logger class implementing the ILogger interface.
 * Provides methods for logging messages at various levels (log, error, warn, info, debug)
 * with colored output using chalk.
 *
 * Usage:
 * ```typescript
 * const logger = Logger.getInstance();
 * logger.log('This is a log message');
 * logger.error('This is an error message');
 * ```
 *
 * @remarks
 * - Uses the singleton pattern to ensure only one instance exists.
 * - Outputs colored messages to the console.
 *
 * @example
 * Logger.getInstance().info('Application started');
 */
export class Logger implements ILogger {
    private logger;
    private context?: string | Symbol;
    private timestamp?: boolean;

    constructor(options: LoggerOptions) {
        this.logger = console.log;
        this.context = options.context;
        this.timestamp = options.timestamp;
    }

    log(message: string): void {
        if (this.timestamp) {
            const timestamp = new Date().toLocaleString();
            this.logger(chalk.green(`${timestamp} - [${this.context}] - ${message}`));
            return;
        }
        this.logger(chalk.green(`(${this.context}) - ${message}`));
    }

    error(message: string): void {
        if (this.timestamp) {
            const timestamp = new Date().toLocaleString();
            this.logger(chalk.red(`${timestamp} - [${this.context}] - ${message}`));
            return;
        }
        this.logger(chalk.red(`(${this.context}) - ${message}`));
    }

    warn(message: string): void {
        if (this.timestamp) {
            const timestamp = new Date().toLocaleString();
            this.logger(chalk.yellow(`${timestamp} - [${this.context}] - ${message}`));
            return;
        }
        this.logger(chalk.yellow(`(${this.context}) - ${message}`));
    }

    info(message: string): void {
        if (this.timestamp) {
            const timestamp = new Date().toLocaleString();
            this.logger(chalk.blue(`${timestamp} - [${this.context}] - ${message}`));
            return;
        }
        this.logger(chalk.blue(`(${this.context}) - ${message}`));
    }

    debug(message: string): void {
        if (this.timestamp) {
            const timestamp = new Date().toLocaleString();
            this.logger(chalk.magenta(`${timestamp} - [${this.context}] - ${message}`));
            return;
        }
        this.logger(chalk.magenta(`(${this.context}) - ${message}`));
    }
}
