export namespace Collect {
    export interface Params {
        moduleNames?: string | Array<string>,
        pagination?: {
            size?: number,
            from?: number
        }
    }
}