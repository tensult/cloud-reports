
export class LogUtil {

    public static setCurrentLogLevel(logLevel) {
        LogUtil.currentLogLevel = logLevel;
    }

    public static log(...params) {
        console.log(...params);
    }

    public static info(...params) {
        if (LogUtil.LogLevel.Info >= LogUtil.currentLogLevel) {
            console.info("[INFO]", ...params);
        }
    }

    public static warn(...params) {
        if (LogUtil.LogLevel.Warn >= LogUtil.currentLogLevel) {
            console.warn("[WARN]", ...params);
        }
    }

    public static error(...params) {
        if (LogUtil.LogLevel.Error >= LogUtil.currentLogLevel) {
            console.error("[ERROR]", ...params);
        }
    }

    private static LogLevel = {
        Error: 3,
        Info: 1,
        Log: 0,
        Off: 100,
        Warn: 2,
    };

    private static currentLogLevel = process.env.LOG_LEVEL || LogUtil.LogLevel.Warn;
}
