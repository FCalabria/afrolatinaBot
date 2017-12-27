require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TOKEN, { polling: true });

bot.onText(/\/random/, (msg) => {
  bot.sendMessage(msg.chat.id, 'You asked for a random quote');
});

bot.onText(/\/afrolatina/, (msg) => {
  bot.sendMessage(msg.chat.id, 'You asked for a Afrolatina quote');
});

bot.onText(/\/guest/, (msg) => {
  bot.sendMessage(msg.chat.id, 'You asked for a guest quote');
});

function publishTweet(tweet, chatId) {
  const fullTweet = tweet.hastag
    ? `"${tweet.text}" #${tweet.hastag}`
    : tweet.text;
  bot.sendMessage(chatId, `Tweet para publicar: ${fullTweet}`);
}
function isAfrolatina(chatId) {
  bot.sendMessage(chatId, '¿Ha sido la Afrolatina?', {
    reply_markup: {
      inline_keyboard: [[
        { text: 'Sí', callback_data: 0 },
        { text: 'No', callback_data: 1 },
      ]],
    },
  });
}
bot.onText(/\/publish/, (msg) => {
  const forceReply = { reply_markup: { force_reply: true } };
  const chatId = msg.chat.id;
  const tweet = {
    text: '',
    hastag: '',
  };
  bot.sendMessage(chatId, '¡Frase nueva!¡Guay!');
  bot.sendMessage(chatId, '¿Qué han dicho?', forceReply)
    .then((textResponse) => {
      bot.onReplyToMessage(textResponse.chat.id, textResponse.message_id, (sentenceMsg) => {
        tweet.text = sentenceMsg.text;
        isAfrolatina(chatId);
      });
    });
  bot.on('callback_query', (response) => {
    if (response.data === '0') {
      publishTweet(tweet, chatId);
    } else {
      bot.sendMessage(chatId, '¿Quién ha sido?', forceReply)
        .then((textResponse) => {
          bot.onReplyToMessage(textResponse.chat.id, textResponse.message_id, (hastagResponse) => {
            tweet.hastag = hastagResponse.text;
            publishTweet(tweet, chatId);
          });
        });
    }
  });
});

