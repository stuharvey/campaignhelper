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
const prefix = "\\"

class RingTide {
  //Asks the questions to setup the Game
  constructor(client) {
    sendText('Ah, Ring Tide.  May ye\'s Port always rest before the Tide\'s Pull.\n\nBut before we get to Voyaging, a couple of questions.\nHow fairs the weather?  Seas looking rough or smooth?\n-Enter the type of the dice you are playing with (ex. d6)\n')
    this.diceSides = 8
    sendText('And the coin?  How much is each of you adding to the ocean?\n-Enter how much each player is adding to the ocean/pot.\n')
    this.buyIn = 10
    sendText('A couple of ye I recongize, how many of y\'all are joining the table?\n-Enter the number of player controlled gamblers.\n')  
    this.numPCs = 3
    sendText('Any extra spots for other gamblers?\n-Enter the number of AI controled gamblers. (Not functional yet)\n')
    this.numNPCs= 0
    this.seats = this.numPCs + this.numNPCs
    this.ocean = this.buyIn * this.seats
    sendText('So a table for '+ this.seats +'. That\'s a good crew size!\nNow pucker down and pick your seats. You\'ve all got coin to win.\n-Each player should enter a seat number between 1 and ' + this.seats + '\n') 
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
    sendText('Looks like everything\s set.  Time to begin the game!\n')

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
      sendText('A new Voyage! 1 coin in your pocket and ' + this.ocean + ' left in the ocean ripe for taking.')
    }else{
      sendText('A new round, with ' + this.roundNum + ' coins on the line and ' + this.ocean + ' coin still left in the ocean')
      if(this.diceCount * 2 > this.diceSides){
        sendText('The waters are looking rough as we\'re rolling ' + this.diceCount + 'd' + this.diceSides)
      }else{
        sendText('It\'s looking to be smooth sailing as we\'re rolling ' + this.diceCount + 'd' + this.diceSides)
      }
    }
    sendText('')
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
      sendText("Captain " + this.tableSeats[i] + status + this.winnings[i] + " coin")
    }else{

      sendText(this.tableSeats[i] + status + this.winnings[i] + " coin")
  }
    }
    sendText("")
    this.oceanBuffer += this.activePlayers;
    sendText('Let\'s give a toast to Captain ' + this.tableSeats[this.captainSeat] + '\nSecure the coins with "Port" or risk it for more with "Man"\n')
   
    //Non-Captain players decide to Man or Port
    for (let i = 0; i < this.seats - 1; i++) {
      let seatPos = (this.captainSeat + i + 1) % this.seats;
      if(this.manStatus[seatPos] == 1){
        sendText(this.tableSeats[seatPos] +', Man or Port?\n-' + this.tableSeats[seatPos] +', please enter /man or /port\n')
        let input
        if(this.personality[seatPos] == 'real'){
          input = 0
        }else{
          input = this.aiChoice(this.tableSeats[seatPos], this.personality[seatPos])
        }
        if(input == 0){
          //If they Port
          sendText('Port. Count those coins, that\'s ' + this.roundNum + ' for ' + this.tableSeats[seatPos] + '\n')
          this.manStatus[seatPos] = 0
          this.oceanBuffer -= this.roundNum 
          this.winnings[seatPos] += this.roundNum
        }else{
          sendText('Man. ' + this.tableSeats[seatPos] + ' has faith in the Captain ' + this.tableSeats[this.captainSeat] + '.\n')
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
      sendText('Captain ' + this.tableSeats[this.captainSeat] + ', your crew seems to have abandoned you.\nDoes the Voyage continue solo?\n-' + this.tableSeats[this.captainSeat] + ', please enter /man or /port\n')
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
        sendText('Man. Bold choice by Captain ' + this.tableSeats[this.captainSeat] +'\n')
      }
    }

    //Is there a Voyage?
    if(this.manStatus[this.captainSeat] == 1){
      sendText('Captain ' + this.tableSeats[this.captainSeat] + ', roll those dice when you\'re ready\n-' + this.tableSeats[this.captainSeat] + ', please enter /roll to continue\n')
      if(this.rollDice() == 0){
        sendText('The Voyage Crashed. You can\'t escape the Tide.\n' + this.oceanBuffer + ' coin go pouring back into the Ocean.\n')
        this.voyageStatus = 1;
        this.ocean += this.oceanBuffer
      }else{
        if(this.activePlayers <= this.ocean){
          this.captainSeat = newCaptain
        }
        
      }

    }else{
      sendText('Port. Everyone got out safely, even the Captain.\n')
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
  sendText('And the dice are rolled:')
  for (let i = 0; i < this.diceCount; i++) {
    diceArray.push(1 + Math.floor(Math.random() * (this.diceSides)))
    sendText('[' + diceArray[i] + ']')
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
  sendText('A Succesful Voyage. The Tide won\'t sink y\'all.')
  if(maxRolled == 1){
    sendText('But the Tide gets stronger. Roll an additional d' + this.diceSides + ' next round.\n')
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
          sendText(name + ' "Can never be too safe."')
        }else{
          sendText(name + ' "I\'m just not feeling it."')
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
        sendText(name + ' "Never tell me the odds!"')
      }else{
        sendText(name + ' "I\'m just feeling lucky!"')
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
}

function sendText(text){
  console.log(text)
  return 1;
}

module.exports = RingTide