const Discord = require('discord.js')
const RingTide = require('./RingTide')
const DevilsKiss = require('./DevilsKiss')
const DevilsWick = require('./DevilsWick')

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
      msg.channel.send('Welcome to the Tavern.\nTo start a game type `!Game` and then the game\'s name without spaces.\nFor a list of valid games type `!Games`\nOnce in a game, type `!Rules` for the game\'s rules.')
    }else if(command == "!Games"){
      msg.channel.send('The current games supported by the Tavern are:\nRing Tide Type `!Game RingTide` to start this game.')
    }else if(command == "!Game"){
        game = configGame(msg, msg.content.split(" ")[1])
    }else if(command == "!Rules"){
      if(game != null){
        msg.channel.send(game.rules(msg))
      }else{
        msg.channel.send('No Game Selected')
      }
    }else{
      if(game != null){
        game.action(msg, command, msg.content.split(" ")[1])
      }else{
        //Not Valid
      }
    }
  }
}

function configGame(msg, gameType){
  if(gameType == "RingTide"){
    game = new RingTide()
    msg.channel.send(game.setUpMessage())
    return game
  }
  else if(gameType == "DevilsKiss"){
    game = new DevilsKiss()
    msg.channel.send(game.setUpMessage())
    return game
  }
  else if(gameType == "DevilsWick"){
    game = new DevilsWick()
    msg.channel.send(game.setUpMessage())
    return game
  }
  else{
    msg.channel.send('Sorry, that Game isn\'t supported by the Campaign Helper yet.\nPlease recheck spelling and remove spaces (ex. Ring Tide -> RingTide)')
  }
}
