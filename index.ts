import {Logger} from '@log4js-node/log4js-api';
import * as path from 'path';
import {BotProxy} from './bot-proxy.interface';
import {MessageContext} from './message-context.interface';

let mBot: BotProxy;
let logger: Logger;
let metadata: {[key: string]: string};
let narikiri_username: {[userId: string]: string | undefined} = {};
let narikiri_icon_emoji: {[userId: string]: string | undefined} = {};


export const init = async (bot: BotProxy, options: {[key: string]: any}): Promise<void> => {
  mBot = bot;
  logger = options.logger || console;
  metadata = await import(path.resolve(__dirname, 'package.json'));

  logger.info(`${metadata.name} plugin v${metadata.version} has been initialized.`);
};

export const onStart = () => {
  logger.debug('onStart()');
};

export const onStop = () => {
  logger.debug('onStop()');
};

export const onMessage = async (message: string, context: MessageContext, data: {[key: string]: any}) => {
  // ignore bot message
  const userId = context.userId;
  if (userId == undefined) {
    return;
  }

  const splited_message = message.split(' ');
  if (splited_message.length < 3) {
    return;
  }

  const ChannelId = await mBot.getChannelId(process.env.REC0_ENV_NARIKIRI_CHANNEL || 'narikiri');

  const [prefix, action, ...trimmed_message] = splited_message;
  if (action == 'reset') {
    narikiri_username[userId] = undefined;
    narikiri_icon_emoji[userId] = undefined;
  } else if (action == 'set') {
    const username = trimmed_message[0];
    const icon_emoji = trimmed_message[1];
    if (username != null) {
      narikiri_username[userId] = username;
    }
    if (icon_emoji != null) {
      narikiri_icon_emoji[userId] = icon_emoji;
    }
    await mBot.sendTalk(ChannelId, `名前が${narikiri_username[userId]}、アイコンが${narikiri_icon_emoji[userId]}のユーザが登録されました`);
  } else if (action == 'send') {
    if (trimmed_message != null) {
      const username = narikiri_username[userId] || '名無し';
      const icon_emoji = narikiri_icon_emoji[userId] || ':sunglasses:';
      const options = {username: username, icon_emoji: icon_emoji};
      await mBot.sendTalk(ChannelId, `${trimmed_message}`, options);
    }
  }
};

export const onPluginEvent = (eventName: string, value?: any, fromId?: string) => {
  // Nop
};
