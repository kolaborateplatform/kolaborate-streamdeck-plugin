export declare class WebSocketManager {
    private ws;
    private pluginUUID;
    constructor(port: number, pluginUUID: string, registerEvent: string, info: string);
    private register;
    send(event: string, context: string, payload?: any): void;
    showAlert(context: string): void;
    showOk(context: string): void;
    setTitle(context: string, title: string): void;
    setState(context: string, state: number): void;
    onMessage(callback: (message: any) => void): void;
}
