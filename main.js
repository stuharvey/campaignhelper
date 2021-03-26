const Discord = require('discord.js')
const RingTide = require('./RingTide')

const DISCORD_KEY = process.env.DISCORD_KEY

const client = new Discord.Client();


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

let game = null

client.on('message', msg => {
  // don't do anything here for now
  
});

new RingTide(client)


//client.login(DISCORD_KEY);