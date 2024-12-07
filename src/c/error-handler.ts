export type ErrorCallback = (error: Error) => void;

export interface IErrorHandler {
    setCallback(errorCallback: ErrorCallback): void;
}

export class ErrorHandler implements IErrorHandler {
    private errorCallback: ErrorCallback | null = null;

    constructor() {
        console.log('ErrorHandler constructor');
    }

    public setCallback(errorCallback: ErrorCallback): void {
        this.errorCallback = errorCallback;
    }

    public error(error: Error): void {
        console.error(error);
        if (this.errorCallback) {
            this.errorCallback(error);
        }
    }
}