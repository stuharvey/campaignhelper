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
const validCommands = ["!Testing", "!Sides", "!Players", "!Ante", "!NPCs", "!Start", "!Sit", "!Roll", "!Man", "!Port"]
const prefix = "\\"
const personalities = ['safe', 'standard','risky','chaotic']
const npcNames = ['Anton','Billiam','Clyde','Dom','Emma','Fredrick','Gilly','Hilda','Julia','Karen','Loli']

class RingTide {
  //Asks the questions to setup the Game
  constructor(client) {
    this.startedStatus = 0
  }
  setUpMessage(){
    return 'Ah, Ring Tide.  May ye\'s Port always rest before the Tide\'s Pull.\n\'Fore we start, a few things gotta be answered.\n(!Sides) How many sides on ye dice?\n(!Ante) How much each of yous be tossin\' in the Ocean?\n(!Players) How many people be gatherin\' round the table?\n(!NPCs) Are any of them NPC\'s? If so how many?\n(!Start) Once that\'s all figured out we can begin the game.'
  }

  action(msg, command, details){
    if(!validCommands.includes(command)){
      msg.channel.send('(' + command + ') is nto a valid input for the game Ring Tide')
      return
    }
    //Setting up the game settings
    if(this.startedStatus == 0){
      if(command == "!Sides"){
        if(details > 1){
          msg.channel.send('Rolling with with d' + details + '\s.  Got it.')
          this.diceSides = details
        }
        else{
          msg.channel.send('I\'m afraid d' + details + '\s don\'t exist.')
        }
      }
      else if(command == "!Players"){
        if(details < 2){
          msg.channel.send('You need at least two players for Ring Tide.')
        }
        else{
          msg.channel.send('I\'ll get ' + details + ' seats ready.')
          this.seats = details
        }
      }
      else if(command == "!Ante"){
        if(details > 0){
          msg.channel.send('Everyone\'s tossing ' + details + ' into the ocean.')
          this.ante = details
        }else{
          msg.channel.send('Negative coins ain\'t a thing I\'ve ever heard of mate.')
        }
      }
      else if(command == "!NPCs"){
        if(details > 0){
          msg.channel.send('I\'ll try to find some strangers to fill ' + details + ' seats.')
          this.ai = details
        }
        else if(details == 0){
          msg.channel.send('An invite only table, I like it!')
        }
        else{
          msg.channel.send('Give me a second, I gotta kick ' + (-1*details) + ' patrons out of my Tavern.')
        }
      }
      else if(command == "!Start"){
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
        if(this.ai == null){
          this.ai = 0
        }
        if(readyToStart == 1){
          this.startedStatus = 1
          this.startGame(msg)
        }
      }
      else if(command == "!Testing"){
        this.diceSides = 6
        this.ante = 6
        this.seats = 2
        this.ai = 1
        this.startedStatus = 1
        this.startGame(msg)
      }
      else{
        msg.channel.send('Command not registered.  You\'re currently setting up your game of Ring Tide, valid commands are:\n!Sides -> How many sides are on the dice for the Ring Tide game.\n!Players -> How many seats are there going to be at the table.\n!NPCs -> How many AI opponents will be at the table.\n!Start -> Starts the Ring Tide Game')
      }
    }
    //In-Game Commands
    else{
      if(command == "!Sides" || command == "!Ante" || command == "!Players" || command == "!NPCs"){
        msg.channel.send('Ring Tide settings can\'t be changed mid game.')
      }
      else if(command == "!Sit"){
        this.claimSeat(msg, details)
      }
      else if(this.reservedSeats != null && this.reservedSeats != 0){
        msg.channel.send('The seats don\'t seem to be filled yet.\nThe current seating arrangement is:')
        for(let i = 0; i < this.seats; i++){
          if(this.tableIds[i] == '?'){
            msg.channel.send((i+1) + ' - [Empty]')
          }
          else{
            msg.channel.send((i+1) + ' - [' + this.tableSeats[i] + ']')
          }
        }
      }
      else if(command == "!Roll" || command == "!Man" || command == "!Port"){
        this.playerAction(msg, command, 0)
      }
    }
  }

  startGame(msg){
    this.reservedSeats = this.seats - this.ai
    this.ocean = this.seats * this.ante
    //can these arrays be simplified?
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
      }
      else{
        msg.channel.send(msg.author.id + ' has sat down in seat ' + details)
        this.tableIds[pos] = senderID
        this.tableSeats[pos] = msg.author.username
        this.reservedSeats--
      }
    }
    if(this.reservedSeats == 0){
      for(let i = 0; i < this.seats; i++){
        if(this.tableIds[i] == "?"){
          this.isAI[i] = 1
          //Randomly generates NPC name
          this.tableSeats[i] = npcNames[Math.floor(Math.random() * npcNames.length)]
          //Randomly generates NPC personality
          this.tableIds[i] = personalities[Math.floor(Math.random() * personalities.length)]
          msg.channel.send('Please welcome ' + this.tableSeats[i] + ' to the table, sitting in seat ' + (i+1))
        }
      }
      msg.channel.send('And just like that the seats are filled!\nHere\'s how things are looking:')
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
    this.readyToRoll = 0
    this.playerTurn = (this.captainSeat + 1) % this.seats
    this.activeCrew = this.seats
    this.diceCount = 1
    msg.channel.send('A fresh new Voyage led by Captain ' + this.tableSeats[this.captainSeat] + '\nRight now there\'s ' + this.roundNum + ' coin on the line.  And ' + this.ocean + ' still left in the ocean.\nThe crew looks towards ' + this.tableSeats[this.playerTurn] + '.  (!Man) or (!Port)?')
    if(this.isAI[this.playerTurn] == 1){
      this.playerAction(msg, this.aiDecision(), 1)
    }
  }

  newRound(msg){
    //Checks to see if end game condition is met
    if(this.ocean >= this.activeCrew){
      //Find the next valid Captain
      let nextCaptain = (this.captainSeat + 1) % this.seats
      while(this.manStatus[nextCaptain] == 0){
        nextCaptain = (nextCaptain + 1) % this.seats
      }
      this.captainSeat = nextCaptain
      //Find the next valid sailor
      this.playerTurn = (this.captainSeat + 1) % this.seats
      while(this.manStatus[this.playerTurn] == 0){
        this.playerTurn = (this.playerTurn + 1) % this.seats
      }
      //Sets variables for the new round
      this.roundNum++
      this.readyToRoll = 0
      this.ocean -= this.activeCrew
      this.oceanBuffer += this.activeCrew
      //Ring Tide status readout
      //
      msg.channel.send('The Voyage continues, with ' + this.roundNum + ' coins on the line and ' + this.ocean + ' coin still left in the ocean')
      if(this.diceCount * 2 > this.diceSides){
        msg.channel.send('The waters are looking rough as we\'re rolling ' + this.diceCount + 'd' + this.diceSides + 's')
      }
      else{
        msg.channel.send('It\'s looking to be smooth sailing as we\'re rolling ' + this.diceCount + 'd' + this.diceSides + 's')
      }
      msg.channel.send('And a quick checkin with our sailors shows that:')
      for (let i = 0; i < this.seats; i++) {
        let status
        let captain = ""
        if(this.manStatus[i] == 0){
          status = ' is resting at a port '
        }
        else{
          status = ' is risking it at sea '
        }
        if(this.captainSeat == i){
          captain = "Captain "
        }
        msg.channel.send(captain + this.tableSeats[i] + status + ' with ' + this.winnings[i] + ' coin safely secured.')
      }
      //Status readout complete
      //Initiate who needs to take a turn
      if(this.captainSeat == this.playerTurn){
        msg.channel.send('Think you can solo the sea again Captain ' + this.tableSeats[this.playerTurn] + '.  (!Man) or (!Port)?')
      }
      else{
        msg.channel.send('Now to the action, ' + this.tableSeats[this.playerTurn] + '.  (!Man) or (!Port)?')
      }
      //If an NPC is called on to take a Man/Port Action
      if(this.isAI[this.playerTurn] == 1){
        this.playerAction(msg, this.aiDecision(), 1)
      }
    }
    else{
      endVoyage(msg,"emptyOcean")
    }
  }

  playerAction(msg, input, aiAction){
    //Means it's time to roll the dice.  If it's an AI is captain someone else at the table has to type !Roll
    if(input == "!Roll" && this.readyToRoll == 1 && (this.tableIds[this.playerTurn] == msg.author.id || this.isAI[this.playerTurn] == 1)){
      //If rollDice returns 1 then the ship did not crash
      if(this.rollDice(msg) == 1){
        if(this.ocean >= this.activeCrew){
          //The Voyage continues
          this.newRound(msg)
        }
        else{
          //Not enough coins in the ocean
          this.endVoyage(msg,"emptyOcean")
        }
      }
      else{
        //The Voyage Crashes
        if(this.ocean >= this.seats){
          //A new Voyage begins
          this.newVoyage(msg)
        }
        else{
          //Not enough coins in the ocean
          this.endVoyage(msg,"emptyOcean")
        }
        
      }
    //The game is waiting on a player to !Man or !Port.  It is waiting on the player in seat (this.playerTurn + 1)
    //Add AI override??
    }
    //First are we looking for a player to give a Man or Port Comman
    //Second is the command given from the right player or an aiAction
    //Lastly is the command Man or Port?
    else if(this.readyToRoll == 0 && (this.tableIds[this.playerTurn] == msg.author.id || aiAction == 1) && (input == "!Man" || input == "!Port")){
      if(input == "!Man"){
        //If we were waiting for a command from the Captain, then he's the only active Sailor
        //This should immediately go into the roll phase
        if(this.playerTurn == this.captainSeat){
          msg.channel.send('Man. Bold choice by Captain ' + this.tableSeats[this.captainSeat] + '. The dice are yours to (!Roll).')
          this.readyToRoll = 1
          if(this.isAI[this.captainSeat] == 1){
            msg.channel.send('Captain ' + this.tableSeats[this.captainSeat] + ' is an NPC, someone else needs to enter (!Roll)')
          }
          return
        }
        //If command is from someone who is not a captain, proceed
        else{
          msg.channel.send('Man. ' + this.tableSeats[this.playerTurn] + ' has faith in the Captain ' + this.tableSeats[this.captainSeat])
        }
      }
      //If the Port action is taken
      else if(input == "!Port"){
        this.activeCrew--
        //The coins at stake are permanently gained by the player
        this.winnings[this.playerTurn] += this.roundNum
        //And cannot go tumblingback into the ocean
        this.oceanBuffer -= this.roundNum
        //The player is out for the remainder of the voyage
        this.manStatus[this.playerTurn] = 0
        //If everyone has Ported, the voyage is over
        if(this.activeCrew == 0){
          this.endVoyage(msg,"Ported")
          return
        }
        //Otherwise continue
        else{
          msg.channel.send('Port. Count those coins, that\'s ' + this.roundNum + ' for ' + this.tableSeats[this.playerTurn])
        }
      }
      //If there is only one active crew, then the choice of man or port falls on the captain
      if(this.activeCrew == 1){
        msg.channel.send('Captain ' + this.tableSeats[this.captainSeat] + ', your crew seems to have abandoned you.\nDoes the Voyage continue solo (!Man) or are you ready to anchor it (!Port)?')
        this.playerTurn = this.captainSeat
        if(this.isAI[this.captainSeat] == 1){
          this.playerAction(msg, this.aiDecision(), 1)
        }
        return
      }
      //Gets the next player who hasn't ported
      this.playerTurn = (this.playerTurn + 1) % this.seats
      while(this.manStatus[this.playerTurn] == 0){
        this.playerTurn = (this.playerTurn + 1) % this.seats
      }
      //If this is reached, active players > 1
      //So if it's the captain's turn, it's time to roll
      if(this.playerTurn == this.captainSeat){
        this.readyToRoll = 1
        msg.channel.send('Looks like you\'ve got a crew of ' + (this.activeCrew - 1) + ' Captain ' + this.tableSeats[this.playerTurn] + '.  (!Roll) when you\'re ready!')
        if(this.isAI[this.playerTurn] == 1){
          msg.channel.send('Captain ' + this.tableSeats[this.playerTurn] + ' is an NPC, someone else needs to enter (!Roll)')
        }
      }
      //If it isn't time to roll inform the next player that they need to make an action
      else{
        msg.channel.send('The crew looks towards ' + this.tableSeats[this.playerTurn] + '.  (!Man) or (!Port)?')
        if(this.isAI[this.playerTurn] == 1){
          this.playerAction(msg, this.aiDecision(), 1)
        }
      }

    }
  }

  aiDecision(){
    //Get the Personality and generate a random number
    let personality = this.tableIds[this.playerTurn]
    let randomness = Math.floor(Math.random() * (this.diceSides-2))  
    let odds = this.diceCount / this.diceSides
    if(personality == 'safe'){
      if(odds + (randomness/this.diceSides) > .6){
        return '!Port'
      }
      else{
        return '!Man'
      }
    }
    if(personality == 'standard'){
      if(odds > .4){
        return '!Port'
      }
      else{
        return '!Man'
      }
    }
    if(personality == 'risky'){
      if(odds - (randomness/this.diceSides) > .4){
        return '!Port'
      }
      else{
        return '!Man'
      }
    }
    if(personality == 'chaotic'){
      if(randomness%2 == 0){
        return '!Port'
      }
      else{
        return '!Man'
      }
    }
    return '!Port'
  }

  rollDice(msg){
    let diceArray = []
    msg.channel.send('And the dice are rolled:')
    for (let i = 0; i < this.diceCount; i++) {
      diceArray.push(1 + Math.floor(Math.random() * (this.diceSides)))
      msg.channel.send('[' + diceArray[i] + ']')
    }
    let maxRolled = 0
    for (let i = 0; i < this.diceCount; i++) {
      if(diceArray[i] == 1){
        return 0
      }
      if(diceArray[i] == this.diceSides){
        maxRolled = 1
      }
    }
    msg.channel.send('Success. The Tide won\'t sink y\'all.')
    if(maxRolled == 0){
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
      return
    }
    else if(endMethod == "Crashed"){
      msg.channel.send('The Voyage Crashed. You can\'t escape the Tide.\n' + this.oceanBuffer + ' coin go pouring back into the Ocean.\n')
      this.ocean += this.oceanBuffer
    }
    else if(endMethod == "Ported"){
      msg.channel.send('Port. Everyone got out safely. Even the Captain ' + this.tableSeats[this.captainSeat] + ' escaped with ' + this.roundNum + ' coin')
    }
    for (let i = 0; i < this.seats; i++) {
      this.manStatus[i] = 1
    }
    this.newVoyage(msg)
  }

  endGame(msg){
    msg.channel.send('It looks like there isn\'t enough coin in the ocean for more sailing.\nIt\'s been a pleasure, but that means this game of Ring Tide is concluded.')
    for (let i = 0; i < this.seats; i++) {
      msg.channel.send(this.tableSeats[i] + ' walks away with ' + this.winnings[i] + ' coin.')
    }
    msg.channel.send('And the ocean kept the final ' + this.ocean + ' coin.')
    return
  }
}
module.exports = RingTide