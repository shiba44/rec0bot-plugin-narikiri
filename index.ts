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

export const onMessage = async (received_message: string, context: MessageContext, data: {[key: string]: any}) => {
  // ignore bot message
  const userId = context.userId;
  if (userId == undefined) {
    return;
  }

  const ChannelId = await mBot.getChannelId(process.env.REC0_ENV_NARIKIRI_CHANNEL || 'narikiri');

  const [prefix, action, ...word_array] = received_message.split(' ');

  if (action == 'reset') {
    narikiri_username[userId] = undefined;
    narikiri_icon_emoji[userId] = undefined;
    await mBot.sendTalk(userId, "ユーザー情報がリセットされました");
    return;
  }

  if (word_array.length == 0) {
    return;
  }

  if (action == 'set') {
    narikiri_username[userId] = word_array[0];
    if (word_array.length >= 2) {
      narikiri_icon_emoji[userId] = word_array[1];
    }
    await mBot.sendTalk(userId, `名前が${narikiri_username[userId]}、アイコンが${narikiri_icon_emoji[userId]}のユーザが登録されました`);
    return;
  }

  if (action == 'send') {
    const message = word_array.join(' ');

    const username = narikiri_username[userId] || '名無し';
    const icon_emoji = narikiri_icon_emoji[userId] || ':sunglasses:';
    const options = {username: username, icon_emoji: icon_emoji};

    await mBot.sendTalk(ChannelId, `${message}`, options);
  }

};

export const onPluginEvent = (eventName: string, value?: any, fromId?: string) => {
  // Nop
};
