
export class LogUtil {

    public static setCurrentLogLevel(logLevel) {
        LogUtil.currentLogLevel = logLevel;
    }

    public static log(...params) {
        this.printStack(params[0]);
        console.log(...params);
    }

    public static info(...params) {
        if (LogUtil.LogLevel.Info >= LogUtil.currentLogLevel) {
            this.printStack(params[0]);
            console.info("[INFO]", ...params);
        }
    }

    public static warn(...params) {
        if (LogUtil.LogLevel.Warn >= LogUtil.currentLogLevel) {
            this.printStack(params[0]);
            console.warn("[WARN]", ...params);
        }
    }

    public static error(...params) {
        if (LogUtil.LogLevel.Error >= LogUtil.currentLogLevel) {
            this.printStack(params[0]);
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

    private static currentLogLevel = LogUtil.LogLevel.Warn;

    private static printStack(params: any[]) {
        if (!params || !params.length) {
            return;
        }
        for (const param of params) {
            if (param && param.stack) {
                console.log("StackTrace:\n", param.stack);
            }
        }
    }
}
