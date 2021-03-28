/**
 * Ring Tide: A dice game best played with a large group.  
 * After agreeing on a set of dice (d6s are referred to as “Rough Waters” whereas d12s are considered “Smooth Sailing”) and a “Captain” (the first player to roll), the entire buy-in goes into a single pile known as “The Ocean.”  The game then takes place in “Voyages” with each voyage having a series of “Rounds.”  At the beginning of each round all players still apart of the Voyage take a coin from the Ocean and then moving counterclockwise from the Captain, choose whether to “Man” or “Port” (The round’s Captain must always “Man” if at least one other player chooses to “Man”).  
 * Those players that “Port” conclude their current “Voyage.” The Captain then rolls the appropriate number of dice (initially a single die).  
 * If any of the dice rolls a “one,”  then the Voyage is concluded and all the players still a part of the Voyage must return their coins from the current Voyage to the Ocean (A new Voyage then begins).  
 * If the captain doesn’t roll a one, but does roll the max die value on one of their dice, then the number of dice for the next round remains the same, whereas if neither a one or a max value is rolled on any of the dice, the number of dice rolled is increased by one.  
 * Regardless the Captain role always rotates clockwise to the next player apart of the Voyage.  
 * The game concludes when there are not enough coins in the center of the table for everyone in the voyage to take a coin (the house profits these “spare coins”)
 */

const TAVERN_CHANNEL = "test-channel"
const validCommands = ["!Sides", "!Players", "!Ante", "!NPCs", "!Start", "!Sit", "!Roll", "!Man", "!Port"]
const prefix = "\\"

class RingTide {
  //Asks the questions to setup the Game
  constructor(client) {
    this.startedStatus = 0
    /*
    this.client = client
    this.sendText('Ah, Ring Tide.  May ye\'s Port always rest before the Tide\'s Pull.\n\nBut before we get to Voyaging, a couple of questions.\nHow fairs the weather?  Seas looking rough or smooth?\n-Enter the type of the dice you are playing with (ex. d6)\n')
    this.diceSides = 8
    this.sendText('And the coin?  How much is each of you adding to the ocean?\n-Enter how much each player is adding to the ocean/pot.\n')
    this.buyIn = 10
    this.sendText('A couple of ye I recongize, how many of y\'all are joining the table?\n-Enter the number of player controlled gamblers.\n')  
    this.numPCs = 3
    this.sendText('Any extra spots for other gamblers?\n-Enter the number of AI controled gamblers. (Not functional yet)\n')
    this.numNPCs= 0
    this.seats = this.numPCs + this.numNPCs
    this.ocean = this.buyIn * this.seats
    this.sendText('So a table for '+ this.seats +'. That\'s a good crew size!\nNow pucker down and pick your seats. You\'ve all got coin to win.\n-Each player should enter a seat number between 1 and ' + this.seats + '\n') 
    this.tableSeats = []
    this.personality = []
    let iTwist = Math.floor(Math.random() * (3))
    for (let i = 0; i < this.seats; i++) {
      //Who is seated at position i
      let seatRan = (iTwist + i) % 3
      let gambler
      let type
      if(seatRan == 0){
        gambler = "Alice"
        type = "safe"
      }else if(seatRan == 1){
        gambler = "Bob"
        type = "risky"
      }else{
        gambler = "Carl"
        type = "standard"
      }
      this.tableSeats.push(gambler)
      this.personality.push(type)

    }
    this.sendText('Looks like everything\s set.  Time to begin the game!\n')

    //Captain is always seated at position zero
    this.captainSeat = 0;
    //Array to store winnings
    this.winnings = []
    for (let i = 0; i < this.seats; i++) {
      this.winnings.push(0)
    }

    this.Voyages()
  }

Voyages(){
  //Is the Ocean big enough for a Voyage?
  while(this.ocean >= this.seats){
    //Start of a Voyage
    //Set the Status of each player
    this.manStatus = []
    //Everyone starts with "Man"
    //Status: 1 = Man, 0 = Port
    for (let i = 0; i < this.seats; i++) {
      this.manStatus.push(1)
    }
    
    //States Captain
    this.Rounds()
    this.captainSeat =  (this.captainSeat + this.seats + 1) % this.seats
  }
  sendText('\nLooks like the Ocean isn\'t big enough for any more sailing.\nCount your coins. The house took the ' + this.ocean + ' left on the table.')
  for (let i = 0; i < this.seats; i++) {
    sendText(this.tableSeats[i] + ' walked away with ' + this.winnings[i] + ' coin.')
  }
}

Rounds(){
  //Coins that could go back in the Ocean
  this.oceanBuffer = 0
  //Coins "leaving" the Ocean each round
  this.activePlayers = this.seats
  //How many Rounds there have been in the Voyage
  this.roundNum = 0
  //Number of Dice that are rolled in a given round
  this.diceCount = 1
  //Voyage Status: 0 = Smooth Sailing, 1 = Crashed
  this.voyageStatus = 0
  //Who will be the next captain
  let newCaptain = this.captainSeat
  //Loops for the Rounds of a Voyage
  while(this.ocean >= this.activePlayers && this.voyageStatus == 0){
    this.roundNum++;
    this.ocean -= this.activePlayers;
    if(this.roundNum == 1){
      this.sendText('A new Voyage! 1 coin in your pocket and ' + this.ocean + ' left in the ocean ripe for taking.')
    }else{
      this.sendText('A new round, with ' + this.roundNum + ' coins on the line and ' + this.ocean + ' coin still left in the ocean')
      if(this.diceCount * 2 > this.diceSides){
        this.sendText('The waters are looking rough as we\'re rolling ' + this.diceCount + 'd' + this.diceSides)
      }else{
        this.sendText('It\'s looking to be smooth sailing as we\'re rolling ' + this.diceCount + 'd' + this.diceSides)
      }
    }
    this.sendText('')
    for (let i = 0; i < this.seats; i++) {
      let status = ""
      if(this.manStatus[i] == 0){
        status = " is safely at port and has safely secured "
    }else{
      if(this.roundNum == 1){
        status = " sets out for the new Voyage having safely secured "
      }else{
        status = " is still fighting the tide and has safely secured "
      }
    }
    if(i == this.captainSeat){
      this.sendText("Captain " + this.tableSeats[i] + status + this.winnings[i] + " coin")
    }else{

      this.sendText(this.tableSeats[i] + status + this.winnings[i] + " coin")
  }
    }
    this.sendText("")
    this.oceanBuffer += this.activePlayers;
    this.sendText('Let\'s give a toast to Captain ' + this.tableSeats[this.captainSeat] + '\nSecure the coins with "Port" or risk it for more with "Man"\n')
   
    //Non-Captain players decide to Man or Port
    for (let i = 0; i < this.seats - 1; i++) {
      let seatPos = (this.captainSeat + i + 1) % this.seats;
      if(this.manStatus[seatPos] == 1){
        this.sendText(this.tableSeats[seatPos] +', Man or Port?\n-' + this.tableSeats[seatPos] +', please enter /man or /port\n')
        let input
        if(this.personality[seatPos] == 'real'){
          input = 0
        }else{
          input = this.aiChoice(this.tableSeats[seatPos], this.personality[seatPos])
        }
        if(input == 0){
          //If they Port
          this.sendText('Port. Count those coins, that\'s ' + this.roundNum + ' for ' + this.tableSeats[seatPos] + '\n')
          this.manStatus[seatPos] = 0
          this.oceanBuffer -= this.roundNum 
          this.winnings[seatPos] += this.roundNum
        }else{
          this.sendText('Man. ' + this.tableSeats[seatPos] + ' has faith in the Captain ' + this.tableSeats[this.captainSeat] + '.\n')
          //Sets the next Captain
          newCaptain = seatPos
        }
      }
    }
    
    //Captain's choice
    this.activePlayers = 0
    for (let i = 0; i < this.seats; i++) {
      this.activePlayers += this.manStatus[i];
    }
    if(this.activePlayers == 1){
      this.sendText('Captain ' + this.tableSeats[this.captainSeat] + ', your crew seems to have abandoned you.\nDoes the Voyage continue solo?\n-' + this.tableSeats[this.captainSeat] + ', please enter /man or /port\n')
      let input
        if(this.personality[this.captainSeat] == 'real'){
          input = 0
        }else{
          input = this.aiChoice(this.tableSeats[this.captainSeat], this.personality[this.captainSeat])
        }
      if(input == 0){
        this.manStatus[this.captainSeat] = 0
        this.oceanBuffer -= this.roundNum 
        this.winnings[this.captainSeat] += this.roundNum
      }else{
        this.sendText('Man. Bold choice by Captain ' + this.tableSeats[this.captainSeat] +'\n')
      }
    }

    //Is there a Voyage?
    if(this.manStatus[this.captainSeat] == 1){
      this.sendText('Captain ' + this.tableSeats[this.captainSeat] + ', roll those dice when you\'re ready\n-' + this.tableSeats[this.captainSeat] + ', please enter /roll to continue\n')
      if(this.rollDice() == 0){
        this.sendText('The Voyage Crashed. You can\'t escape the Tide.\n' + this.oceanBuffer + ' coin go pouring back into the Ocean.\n')
        this.voyageStatus = 1;
        this.ocean += this.oceanBuffer
      }else{
        if(this.activePlayers <= this.ocean){
          this.captainSeat = newCaptain
        }
        
      }

    }else{
      this.sendText('Port. Everyone got out safely, even the Captain.\n')
      this.voyageStatus = 1;
      this.oceanBuffer = 0;
    }
    if(this.activePlayers > this.ocean){
      if(this.voyageStatus == 0){
        for (let i = 0; i < this.seats; i++) {
          this.winnings[i] += this.roundNum * this.manStatus[i]
        }
      }
      this.voyageStatus == 1
    }
  }
}

rollDice(){
  let diceArray = []
  this.sendText('And the dice are rolled:')
  for (let i = 0; i < this.diceCount; i++) {
    diceArray.push(1 + Math.floor(Math.random() * (this.diceSides)))
    this.sendText('[' + diceArray[i] + ']')
  }
  let maxRolled = 1
  for (let i = 0; i < this.diceCount; i++) {
    if(diceArray[i] == 1){
      return 0
    }
    if(diceArray[i] == this.diceSides){
      maxRolled = 0
    }
  }
  this.sendText('A Succesful Voyage. The Tide won\'t sink y\'all.')
  if(maxRolled == 1){
    this.sendText('But the Tide gets stronger. Roll an additional d' + this.diceSides + ' next round.\n')
    this.diceCount++
  }
  return 1
}

//Determines how an NPC behaves based on their assigned personality
aiChoice(name, personality){
  let randomness = Math.floor(Math.random() * (this.diceSides-2))  
  let odds = this.diceCount / this.diceSides
  if(personality == "safe"){
    if(odds + (randomness/this.diceSides) > .6){
      if(odds - (randomness/this.diceSides) < 0){
        if(randomness > 1){
          this.sendText(name + ' "Can never be too safe."')
        }else{
          this.sendText(name + ' "I\'m just not feeling it."')
        }
      }
      return 0
    }else{
      return 1
    }
  }
  if(personality == "standard"){
    if(odds > .4){
      return 0
    }else{
      return 1
    }
  }
  if(personality == "risky"){
    if(odds >= .7){
      if(randomness%2 == 0){
        this.sendText(name + ' "Never tell me the odds!"')
      }else{
        this.sendText(name + ' "I\'m just feeling lucky!"')
      }
    }
    if(odds - (randomness/this.diceSides) > .4){
      return 0
    }else{
      return 1
    }
  }
  if(personality == "chaotic"){
    return randomness % 2
  }
  return 0;
}
sendText(text){
  return 1;
}
*/
}
setUpMessage(){
  return 'Ah, Ring Tide.  May ye\'s Port always rest before the Tide\'s Pull.\n\'Fore we start, a few things gotta be answered.\n(!Sides) How many sides on ye dice?\n(!Ante) How much each of yous be tossin\' in the Ocean?\n(!Players) How many people be gatherin\' round the table?\n(!NPCs) Are any of them NPC\'s? If so how many?\n(!Start) Once that\'s all figured out we can begin the game.'
}

action(msg, command, details){
  if(!validCommands.includes(command)){
    msg.channel.send('Not a Valid Command')
    return 0
  }
  //Setting up the game settings
  if(this.startedStatus == 0){
    if(command == "!Sides"){
      if(details > 1){
        msg.channel.send('Rolling with with d' + details + '\s.  Got it.')
        this.diceSides = details
      }else{
        msg.channel.send('I\'m afraid d' + details + '\s don\'t exist.')
      }
    }else if(command == "!Players"){
      if(details < 2){
        msg.channel.send('You need at least two players for Ring Tide.')
      }else{
        msg.channel.send('I\'ll get ' + details + ' seats ready.')
        this.seats = details
      }
    }else if(command == "!Ante"){
      if(details > 0){
        msg.channel.send('Everyone\'s tossing ' + details + ' into the ocean.')
        this.ante = details
      }else{
        msg.channel.send('Negative coins ain\'t a thing I\'ve ever heard of mate.')
      }
    }else if(command == "!NPCs"){
      if(details > 0){
        msg.channel.send('I\'ll try to find some strangers to fill ' + details + ' seats.')
        this.ai = details
      }else if(details == 0){
        msg.channel.send('An invite only table, I like it!')
      }else{
        msg.channel.send('Give me a second, I gotta kick ' + (-1*details) + ' patrons out of my Tavern.')
      }
    }else if(command == "!Start"){
      let readyToStart = 1
      if(this.diceSides == null){
        msg.channel.send('You gotta choose some dice, else there\'s nothing to roll with.')
        readyToStart = 0
      }
      if(this.ante == null){
        msg.channel.send('We can\'t play with an empty ocean.  People\'ve got to ante something.')
        readyToStart = 0
      }
      if(this.seats == null){
        msg.channel.send('Can\'t be starting a game if I don\'t know how many of ye\'s be playing.')
        readyToStart = 0
      }
      if(this.seats == null){
        this.seats = 0
      }
      if(readyToStart == 1){
        this.startedStatus = 1
        this.startGame(msg)
      }
    }else{
      msg.channel.send('Command not registered.  You\'re currently setting up your game of Ring Tide, valid commands are:\n!Sides -> How many sides are on the dice for the Ring Tide game.\n!Players -> How many seats are there going to be at the table.\n!NPCs -> How many AI opponents will be at the table.\n!Start -> Starts the Ring Tide Game')
    }
  }
  //In-Game Commands
  else{
    if(command == "!Sides" || command == "!Players" || command == "!NPCs"){
      //Invalid Input
    }else if(command == "!Sit"){
      this.claimSeat(msg, details)
    }else if(this.reservedSeats != null & this.reservedSeats == 0){
      msg.channel.send('The seats don\'t seem to be filled yet.\nThe current seating arrangement is:')
      for(let i = 0; i < this.seats; i++){
        if(this.tableIds[i] == '?'){
          msg.channel.send((i+1) + ' - [Empty]')
        }else{
          msg.channel.send((i+1) + ' - [' + tableSeats[i] + ']')
        }
      }
    }else if(command == "!Roll" || command == "!Man" || command == "!Port"){
      this.playerAction(msg, command)
    }
  }
}

startGame(msg){
  this.reservedSeats = this.seats - this.ai
  this.ocean = this.seats * this.ante
  this.isAI = []
  this.tableIds = []
  this.tableSeats = []
  this.winnings = []
  this.manStatus = []
  for (let i = 0; i < this.seats; i++) {
    this.isAI.push(0)
    this.tableIds.push("?")
    this.tableSeats.push("?")
    this.winnings.push(0)
    this.manStatus.push(1)
  }
  msg.channel.send('One last thing before we start.  Where\'s everyone sitting?\nThere are ' + this.seats + ' seats so enter (!Sit) and a number between 1 and ' + this.seats + ' to claim a spot.')
}

claimSeat(msg, details){
  let pos = details - 1
  let senderID = msg.author.id
  let alreadySeated = 0
  for(let i = 0; i < this.seats; i++){
    if(this.tableIds[i] == senderID){
      msg.reply('You\'re already sitting at seat ' + (i+1))
      alreadySeated = 1
    }
  }
  if(alreadySeated == 0){
    if(this.tableIds[pos] != "?"){
      msg.channel.send('It looks like seat ' + details + ' is already occupied.')
    }else{
      msg.channel.send(msg.author.id + ' has sat down in seat ' + details)
      this.tableIds[pos] = senderID
      this.tableSeats[pos] = msg.author.name
      this.reservedSeats--
    }
  }
  if(this.reservedSeats == 0){
    for(let i = 0; i < this.seats; i++){
      if(this.tableIds[i] != "?"){
        this.isAI[i] = 1
        this.tableSeats[i] = "Alice" //Add AI
        this.tableIds[i] = "risky" //Add AI personality
        msg.channel.send('Please welcome ' + this.tableSeats[i] + ' to the table, sitting in seat ' + (i+1))
      }
    }
    msg.reply('And just like that the seats are filled!\nHere\'s how things are looking:')
    for(let i = 0; i < this.seats; i++){
      msg.channel.send((i+1) + ' - [' + this.tableSeats[i] + ']')
    }

    this.captainSeat = 0
    this.newVoyage(msg)
  }
}

newVoyage(msg){
  this.roundNum = 1
  this.oceanBuffer = this.seats
  this.ocean -= this.seats
  this.readyToRoll == 0
  this.playerTurn = (this.captainSeat + 1) % this.seats
  this.activeCrew = this.seats
  msg.channel.send('A fresh new Voyage led by Captain ' + this.tableSeats[this.captainSeat] + '\nRight now there\'s ' + this.roundNum + ' coin on the line.  And ' + this.ocean + ' still left in the ocean.\nThe crew looks towards ' + this.tableSeats[this.playerTurn] + '.  (!Man) or (!Port)?')
}

newRound(){

}

playerAction(msg, input){
  //Means it's time to roll the dice.  If it's an AI is captain someone else at the table has to type !Roll
  if(input == "!Roll" && this.readyToRoll == 1 && (this.tableIds[this.playerTurn] == msg.author.id || this.isAI[this.playerTurn] == 1)){
    //If rollDice returns 1 then the ship did not crash
    if(this.rollDice(msg) == 1){
      if(this.activeCrew >= this.ocean){
        //The Voyage continues
        this.newRound()
      }else{
        //Not enough coins in the ocean
        this.endVoyage(msg,"emptyOcean")
      }
    }else{
      //The Voyage Crashes
      if(this.seats >= this.ocean){
        //A new Voyage begins
        this.newVoyage(msg)
      }else{
        //Not enough coins in the ocean
        this.endVoyage(msg,"emptyOcean")
      }
      
    }
  //The game is waiting on a player to !Man or !Port.  It is waiting on the player in seat (this.playerTurn + 1)
  }else if(this.readyToRoll == 0 && this.tableIds[this.playerTurn] == msg.author.id && (input == "!Man" || input == "!Port")){
    if(input == "!Man"){
      if(this.playerTurn == this.captainSeat){
        this.sendText('Man. Bold choice by Captain ' + this.tableSeats[this.captainSeat])
      }
      else{
        msg.reply('Man. ' + this.tableSeats[this.playerTurn] + ' has faith in the Captain ' + this.tableSeats[this.captainSeat])
        this.readyToRoll == 1
      }
    }else if(input == "!Port"){
      this.activeCrew--
      this.oceanBuffer -= this.roundNum
      this.winnings[this.playerTurn] += this.roundNum
      this.manStatus[this.playerTurn] = 0
      if(this.playerTurn == this.captainSeat){
        this.endVoyage(msg,"Ported")
      }else{
        msg.reply('Port. Count those coins, that\'s ' + this.roundNum + ' for ' + this.tableSeats[this.playerTurn])
      }
    }
    this.playerTurn = (this.playerTurn + 1) % this.seats
    //If there is only one active crew, then the choice of man or port falls on the captain
    if(this.activeCrew == 1){
      msg.channel.send('Captain ' + this.tableSeats[this.captainSeat] + ', your crew seems to have abandoned you.\nDoes the Voyage continue solo (!Man) or are you ready to anchor it (!Port)?')
      this.playerTurn = this.captainSeat
      return
    }
    while(this.manStatus[this.playerTurn] == 0){
      this.playerTurn = (this.playerTurn + 1) % this.seats
    }
    if(this.playerTurn == this.captainSeat){
      msg.channel.send('Looks like you\'ve got a crew of ' + this.activeCrew + ' Captain ' + this.tableSeats[this.playerTurn] + '.  (!Roll) when you\'re ready!')
    }else{
      msg.channel.send('The crew looks towards ' + this.tableSeats[this.playerTurn] + '.  (!Man) or (!Port)?')
    }

  }
}

rollDice(msg){
  let diceArray = []
  msg.channel.send('And the dice are rolled:')
  for (let i = 0; i < this.diceCount; i++) {
    diceArray.push(1 + Math.floor(Math.random() * (this.diceSides)))
    msg.channel.send('[' + diceArray[i] + ']')
  }
  let maxRolled = 1
  for (let i = 0; i < this.diceCount; i++) {
    if(diceArray[i] == 1){
      this.endVoyage(msg, "Crashed")
      return 0
    }
    if(diceArray[i] == this.diceSides){
      maxRolled = 0
    }
  }
  msg.channel.send('A Succesful Voyage. The Tide won\'t sink y\'all.')
  if(maxRolled == 1){
    msg.channel.send('But the Tide gets stronger. Roll an additional d' + this.diceSides + ' next round.\n')
    this.diceCount++
  }
  return 1
}

endVoyage(msg, endMethod){
  if(endMethod == "emptyOcean"){
    for (let i = 0; i < this.seats; i++) {
      this.winnings[i] += this.manStatus[i] * this.roundNum
    }
    this.endGame(msg)
  }else if(endMethod == "Crashed"){
    msg.channel.send('The Voyage Crashed. You can\'t escape the Tide.\n' + this.oceanBuffer + ' coin go pouring back into the Ocean.\n')
    this.ocean += this.oceanBuffer
  }else if(endMethod == "Ported"){
    msg.channel.send('Port. Everyone got out safely. Even the Captain ' + this.tableSeats[this.captainSeat] + ' escaped with ' + this.roundNum + ' coin')
  }
  for (let i = 0; i < this.seats; i++) {
    this.manStatus.push(1)
  }
  this.oceanBuffer = 0
  this.roundNum = 0
  this.captainSeat =  (this.captainSeat + this.seats + 1) % this.seats
}

endGame(msg){
  msg.channel.send('It looks like there isn\'t enough coin in the ocean for more sailing.\nIt\'s been a pleasure, but that means this game of Ring Tide is concluded.')
  for (let i = 0; i < this.seats; i++) {
    msg.channel.send(this.this.tableSeats[i] + ' walks away with ' + this.winnings[i] + ' coin.')
  }
  msg.channel.send('And the ocean kept the final ' + this.ocean + ' coin.')
  this.inputNeeded = "GameOver"
}
}
module.exports = RingTide