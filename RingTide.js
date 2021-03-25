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

class RingTide {
  constructor(pot, numPlayers, client) {
    this.pot = pot

    client.on('message', msg => {
      if (msg.channel.name !== TAVERN_CHANNEL) return
      // console.info(msg)

      if (msg.content.startsWith("updatePot")) {
        const newPot = parseInt(msg.content.split(" ")[1])
        this.updatePot(newPot)
      }
      if (msg.content === "pot") {
        console.info(this.pot)
      }
    })
  }

  updatePot(newPot) {
    this.pot = newPot
  }
}

module.exports = RingTide