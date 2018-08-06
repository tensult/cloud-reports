
export class LogUtil {

    private static LogLevel = {
        Error: 3,
        Warn: 2,
        Info: 1,
        Log: 0,
        Off: 100
    }

    private static currentLogLevel = LogUtil.LogLevel.Warn;

    static setCurrentLogLevel(logLevel) {
        LogUtil.currentLogLevel = logLevel;
    }

    static log(...params) {
        console.log(...params);
    }

    static info(...params) {
        if (LogUtil.LogLevel.Info >= LogUtil.currentLogLevel) {
            console.info("[INFO]", ...params);
        }
    }

    static warn(...params) {
        if (LogUtil.LogLevel.Warn >= LogUtil.currentLogLevel) {
            console.warn("[WARN]", ...params);
        }
    }

    static error(...params) {
        if (LogUtil.LogLevel.Error >= LogUtil.currentLogLevel) {
            console.error("[ERROR]", ...params);
        }
    }
}

