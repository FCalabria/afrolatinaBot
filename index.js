require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Twitter = require('twitter');

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: true,
});
const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

function getRandomTweet(tweets, from) {
  let filteredTweets;
  switch (from) {
    case 'afrolatina':
      filteredTweets = tweets.filter(tweet => tweet.entities.hashtags.length === 0);
      break;
    case undefined:
      filteredTweets = tweets;
      break;
    default:
      filteredTweets = tweets;
      break;
  }
  if (filteredTweets.length === 0) {
    return null;
  }
  const randomId = Math.floor(Math.random() * (filteredTweets.length - 2));
  const tweet = filteredTweets[randomId];
  return {
    id: tweet.id_str,
    text: tweet.text,
    date: new Date(tweet.created_at),
  };
}

function responseTweet(chatId, tweet) {
  const date = tweet.date.toLocaleDateString();
  const text = `${tweet.text}\n[${date}](https://twitter.com/LaAfrolatina/status/${tweet.id})`;
  bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
}

function getTweetFlow(chatId, fallbackMsg, from) {
  client.get('statuses/user_timeline', { userId: '3420274348', count: 200 }, (error, params, response) => {
    if (response) {
      const tweet = getRandomTweet(JSON.parse(response.body), from);
      if (tweet) {
        responseTweet(chatId, tweet);
      } else {
        bot.sendMessage(chatId, fallbackMsg);
      }
    } else {
      bot.sendMessage(chatId, fallbackMsg);
      console.log(error);
    }
  });
}

bot.onText(/\/random/, (msg) => {
  getTweetFlow(msg.chat.id, 'Error chungo :S');
});

bot.onText(/\/afrolatina/, (msg) => {
  getTweetFlow(msg.chat.id, 'La afrolatina está poco habladora hoy', 'afrolatina');
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

function getAuthorAndPublish(chatId, forceReply, tweet) {
  bot.sendMessage(chatId, '¿Quién ha sido?', forceReply)
    .then((textResponse) => {
      bot.onReplyToMessage(textResponse.chat.id, textResponse.message_id, (hastagResponse) => {
        const editedTweet = tweet;
        editedTweet.hastag = hastagResponse.text;
        publishTweet(editedTweet, chatId);
      });
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
      getAuthorAndPublish(chatId, forceReply, tweet);
    }
  });
});
