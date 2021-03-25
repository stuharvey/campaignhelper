const Discord = require('discord.js')

const DISCORD_KEY = process.env.DISCORD_KEY
const TAVERN_CHANNEL = "test-channel"

const client = new Discord.Client();


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  console.info(msg)
  if (msg.channel !== TAVERN_CHANNEL) return
  console.info(msg)
});

client.login(DISCORD_KEY);