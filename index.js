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

bot.onText(/\/publish/, (msg) => {
  bot.sendMessage(msg.chat.id, 'You want to publish a new quote');
});
