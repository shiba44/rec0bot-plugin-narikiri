import * as log4js from '@log4js-node/log4js-api';
import * as path from 'path';
import type {BotProxy} from './bot-proxy.interface.ts';
import type {MessageContext} from './message-context.interface.ts';

let mBot: BotProxy;
let logger: log4js.Logger;
let narikiri_username: {[userId: string]: string | undefined} = {};
let narikiri_icon_emoji: {[userId: string]: string | undefined} = {};


export const init = async (bot: BotProxy, options: {[key: string]: any}): Promise<void> => {
  mBot = bot;
  logger = options.logger || console;
  const { default: metadata } = await import(path.resolve(import.meta.dirname, 'package.json'), { with: { type: "json" } });

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

  if (action == 'list') {
    var message_array = [];
    for (let [regesterdUserId, name] of Object.entries(narikiri_username)) {
      if (name != undefined) {
        const icon_emoji = narikiri_icon_emoji[regesterdUserId] || ':sunglasses:';
        message_array.push(`${icon_emoji} ${name}`);
      }
    }
    if (message_array.length == 0) {
      await mBot.sendTalk(userId, "登録されているユーザーはいません");
    } else {
      await mBot.sendTalk(userId, message_array.join('\n'));
    }
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
