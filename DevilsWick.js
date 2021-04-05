const validCommands = ["!Testing", "!Add", "!Sit", "!Start", "!NPCs", "!Burn"]

class DevilsWick {

     //Asks the questions to setup the Game
    constructor(client) {
        this.startedStatus = 0
        this.diceMap = new Map()
        this.tableSeats = []
        this.tableIds = []
        this.playerTurn = 0
    }

    setUpMessage(msg){
        return 'Devil\'s Wick'
  
    }

    action(msg, command, details){
        if(!validCommands.includes(command)){
            msg.channel.send('(' + command + ') is nto a valid input for the game Devil\'s Wick')
            return
        }
        if(this.startedStatus == 0){
            if(command == "!Add"){
                this.addDice(msg, details)
            }
            if(command == "!Sit"){
                this.sit(msg, 0, 'NA')
            }
            if(command == "!NPCs"){
                this.sit(msg, 1 , details)
            }
            if(command == "!Start"){
                if(this.tableSeats.length < 1){
                    msg.channel.send('You need at least two players for Devil\'s Wick.')
                }else if(diceMap.keys().length <= 0 && endGameCheck() == 0){
                    msg.channel.send('Add some dice to the lot so you can start.')
                }else{
                    this.startedStatus == 0
                    //start game
                }
            }
        }
        //Burn is the only remaining command
        else if(command == "!Burn"){
            this.rollDice(msg)
        }
    }

    addDice(msg, dice){
        let diceCount = dice.split('d')[0]
        let diceSize = dice.split('d')[1]
        let stringBuilder = dice
        if(this.diceMap.has(diceSize)){
            this.diceMap.set(diceSize, diceCount)
            stringBuilder += ' added to the lot.'
        }else{
            var total =  diceCount + this.diceMap.get(diceSize)
            if(total >= 0)
            this.diceMap.set(diceSize, total)
            if(diceCount >= 0){
                stringBuilder += ' added to the lot.'
            }else{
                stringBuilder += ' subtracted from the lot.'
            }
        }
        let alldice = diceMap.keys()
        stringBuilder += '\nThe current lot looks like:\n'
        for(let i = 0; i < alldice.length; i++){
            let key = alldice.next().value
            stringBuilder += '[' + alldice.get(key) + 'd' + key + ']'
            if(i+1 != alldice.length){
                stringBuilder += ' '
            }
        }

    }

    sit(msg, isAI, details){
        if(isAi == 1){
            this.tableSeats.push(details)
            this.tablesIds.push("999")
        }else{
            let checkAgainst = msg.author.id
            for(let i = 0; i < this.tableIds.length; i++){
                if(this.tableIds[i] == checkAgainst){
                    msg.channel.reply('You\'re already in the game.')
                    return
                }
            }
            //check if they are already seated
            this.tableSeats.push(msg.author.id)
            this.tablesIds.push(msg.guild.member(msg.author).nickname)
        } 
    }

    rollDice(msg){
        let alldice = diceMap.keys()
        stringBuilder += 'Let\'s see if Person Burns the Wick:'
        for(let i = 0; i < alldice.length; i++){
            let key = alldice.next().value
            let count = alldice.get(key)
            let tempCount = alldice.get(key)
            if(count > 0){
                stringBuilder += '\nRolling the d' + key + 's: '
            }
            for(let j = 0; j < count;j++){
                let roll = 1 + Math.floor(Math.random() * (key))
                if(roll == 1){
                    stringBuilder += '[' + Burned + ']'
                    tempCount--
                }else{
                    stringBuilder += '[' + roll + ']'
                }
                if((j+1) != count){
                    stringBuilder += '-'
                }
            }
            alldice.set(key,tempCount)
            msg.channel.send(stringBuilder)
        }
        if(endGameCheck() == 1){
            //next player's turn
        }else{
            //PERSON burned the wick
        }
    }

    endGameCheck(){
        let alldice = diceMap.keys()
        for(let i = 0; i < alldice.length; i++){
            if(alldice.get(alldice.next().value) > 0){
                return 0
            }
        }
        return 1
    }

    rules(msg){
        return 'A dice game designed for pooling lots that supports any number of players.  To begin a collection of dice is chosen.  Going clockwise, players roll the dice and remove any ones rolled.  This continues until someone “Burns the Wick” (rolls ones on all their dice/has no dice to pass to the next player).  Historically this player is the person chosen for whatever purpose the game was started for; in gambling halls they are the big winner.'
    }
}