const Discord = require('discord.js')
const RingTide = require('./RingTide')

const DISCORD_KEY = process.env.DISCORD_KEY

const client = new Discord.Client();

client.login(DISCORD_KEY);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  //client.channels.cache.get('test-channel').send('The Tavern is open for Business')
});

client.on('message', recieveInput)

//game = new RingTide(client)

var game
function recieveInput(msg){
  let sender = msg.author.id
  var tavernChannel = client.channels.cache.get('test-channel')
  if(sender !== client.user.id && msg.content.startsWith("!")){
    let command = msg.content.split(" ")[0]
    if(command == "!Help"){
      msg.channel.send('Sorry, S.O.L.')
    }else if(command == "!Game"){
      game = configGame(msg, msg.content.split(" ")[1])
    }else if(command == "!Rules"){
      if(game != null){
        //game.rules()
      }else{
        //error?
      }
    }else{
      game.action(msg, command, msg.content.split(" ")[1])
    }
  }
}

function configGame(msg, gameType){
  if(gameType == "RingTide"){
    game = new RingTide()
    msg.channel.send(game.setUpMessage())
    return game
  }else{
    msg.channel.send('Sorry, that Game isn\'t supported by the Campaign Helper yet.\nPlease recheck spelling and remove spaces (ex. Ring Tide -> RingTide)')
  }
}
