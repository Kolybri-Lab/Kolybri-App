const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;
const originalConsoleWarn = console.warn;
const originalConsoleDebug = console.debug;

let logsEnabled = false;

export const isLogsEnabled = (): boolean => logsEnabled;

export const setLogsEnabled = (enabled: boolean): void => {
    logsEnabled = enabled;
};

export const toggleLogs = (): boolean => {
    logsEnabled = !logsEnabled;
    return logsEnabled;
};

export const logger = {
    log: (...args: any[]) => {
        if (logsEnabled) {
            originalConsoleLog(...args);
        }
    },
    info: (...args: any[]) => {
        if (logsEnabled) {
            originalConsoleInfo(...args);
        }
    },
    warn: (...args: any[]) => {
        if (logsEnabled) {
            originalConsoleWarn(...args);
        }
    },
    error: (...args: any[]) => {
        console.error(...args);
    },
    debug: (...args: any[]) => {
        if (logsEnabled) {
            originalConsoleDebug(...args);
        }
    },
};

export function initLogger(): void {
    const isDev =
        typeof __DEV__ !== "undefined"
            ? __DEV__
            : process.env.NODE_ENV !== "production";
    if (!isDev) {
        console.log = () => {};
        console.debug = () => {};
        console.info = () => {};
    }
}

export default logger;

