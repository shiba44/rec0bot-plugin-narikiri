export interface BotProxy {
    getBotUserId(): Promise<string>;
    getChannelList(): Promise<any[]>;
    getChannelId(channelName: string): Promise<string>;
    getUserList(): Promise<any[]>;
    sendTalk(channelId: string, text: string, options?: {[k: string]: any}): Promise<any>;
    editTalk(channelId: string, textId: string, text: string, options?: {[k: string]: any}): Promise<any>;
    sendFile(channelId: string, fileName: string, buffer: Buffer): Promise<any>;
    firePluginEvent(targetId: string, eventName: string, value?: any, fromId?: string): Promise<any>;
}
