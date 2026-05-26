export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

export class Logger {
  private static formatMessage(level: LogLevel, namespace: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | Meta: ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] [${namespace}] ${message}${metaStr}`;
  }

  public static info(namespace: string, message: string, meta?: any) {
    console.log(this.formatMessage(LogLevel.INFO, namespace, message, meta));
  }

  public static warn(namespace: string, message: string, meta?: any) {
    console.warn(this.formatMessage(LogLevel.WARN, namespace, message, meta));
  }

  public static error(namespace: string, message: string, error?: any, meta?: any) {
    const combinedMeta = {
      ...meta,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    };
    console.error(this.formatMessage(LogLevel.ERROR, namespace, message, combinedMeta));
  }

  public static debug(namespace: string, message: string, meta?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this.formatMessage(LogLevel.DEBUG, namespace, message, meta));
    }
  }
}
