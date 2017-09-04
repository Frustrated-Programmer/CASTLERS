/**
 * Created by elijah on 01-Jul-17.
 */

var kingdoms = ["Ballaphry", "Hootsville", "Treetopia", "TECH-LAND", "THE #1 KING", "#1kingdom", "Shunvilla", "Junkyard", "Peepsville", "You all", "Coco-Factory","Nothing","mud"];
var censoredWords = [];
var gameNumber = 0;
var version = "1.0.0";

var specialIds = {
    previousMessageInGameLog: "",
    gameLog: "344872241345069068",
    subscriberRole: "343089895503298592",
    playerRole: "344256708245323787",
    watchOver: "344261849614909451",
    tattleTale: "344236883754221578",
    server: "342057104699555845",
    announce: "342057720473583617",
    dontSend: ["342057104699555845", "344258099538034688", "344257281568800778"],
    mods: ["244590122811523082"],
    modRoles: ["343089613956579340"],
    FP: "244590122811523082"
};
var save = require("./Save.json");
var rec = require("./records.json");
var fs = require("fs");
var Discord = require("discord.js");
var bot = new Discord.Client();

var BlueTeam = {};
var RedTeam = {};

var highscores = [
    {
        name:"Frustrated Programmer",
        id:244590122811523082,

        totWins: 0,
        totLoses: 0,
        totPlays: 0,

        TeamWins: 0,

        TeamLoses: 0,
        TeamPlays: 0,

        FfaWins: 0,
        FfaLoses: 0,
        FfaPlays: 0,

        KthWins: 0,
        KthLoses: 0,
        KthPlayes: 0,

        TKthWins: 0,
        TKthLoses: 0,
        TKthPlayes: 0
    }
];

var prefix = "";
var defaultPrefix = ">";
var players = [];

var gameSettings = {
    open: false,
    playing: false,
    mode: "FFA",
    minimumAmountOfPlayers: 1,
    lengthOfCode: 5,
    maxPlayers: 12,
    timeNeededToBeHeld: 10,
    factions:false,
    teamShareOne:false,
};

var getPowerLevel = function (p) {
    var power = 0;
    power += players[p].stuff.items.scouter;
    power += players[p].stuff.items.messenger;
    power += players[p].stuff.items.farm;
    power += players[p].stuff.items.antiSpy;
    power += players[p].stuff.items.spyTraining;

    power += players[p].stuff.items.house * 2;
    power += players[p].stuff.items.forge * 2;
    power += players[p].stuff.items.knights * 2;
    power += players[p].stuff.items.batteringRam * 2;
    power += players[p].stuff.items.stoneblockHouse * 2;
    power += players[p].stuff.items.barn * 2;
    power += players[p].stuff.items.treasury * 2;
    power += players[p].stuff.items.moats * 2;

    power += players[p].stuff.items.gates * 3;
    power += players[p].stuff.items.spy * 3;
    power += players[p].stuff.items.bowmen * 3;
    power += players[p].stuff.items.chariots * 3;

    power += players[p].stuff.items.archers * 4;
    power += players[p].stuff.items.catapults * 4;
    power += players[p].stuff.items.moltenIron * 4;
    power += players[p].stuff.items.catapult * 4;

    power += players[p].stuff.items.extraWalls * 5;
    power += players[p].stuff.items.ladderMen * 5;

    power += Math.floor(players[p].stuff.resources.stone / 3);
    power += Math.floor(players[p].stuff.resources.iron);
    power += Math.floor(players[p].stuff.resources.gold / 10);
    power += Math.floor(players[p].stuff.resources.food / 10);
    power += Math.floor(players[p].stuff.resources.people / 2);

    return power;
};
var canBuy = function (s, p, am) {
    if(players[p].faction.toLowerCase() === "defenders"&&s>7&&s<15) {
        return Math.round(shop[s].price.stone / 2) * am <= players[p].stuff.resources.stone &&
            Math.round(shop[s].price.iron / 2) * am <= players[p].stuff.resources.iron &&
            Math.round(shop[s].price.gold / 2) * am <= players[p].stuff.resources.gold &&
            Math.round(shop[s].price.food / 2) * am <= players[p].stuff.resources.food &&
            shop[s].price.workers * am <= players[p].stuff.resources.workers;
    }
    else if(players[p].faction.toLowerCase() === "attackers"&&s>=15) {
        return Math.round(shop[s].price.stone / 2) * am <= players[p].stuff.resources.stone &&
            Math.round(shop[s].price.iron / 2) * am <= players[p].stuff.resources.iron &&
            Math.round(shop[s].price.gold / 2) * am <= players[p].stuff.resources.gold &&
            Math.round(shop[s].price.food / 2) * am <= players[p].stuff.resources.food &&
            shop[s].price.workers * am <= players[p].stuff.resources.workers;
    }
    else if(players[p].faction.toLowerCase() === "marketplace") {
        return Math.round(shop[s].price.stone / 2) * am <= players[p].stuff.resources.stone &&
            Math.round(shop[s].price.iron / 2) * am <= players[p].stuff.resources.iron &&
            Math.round(shop[s].price.gold / 2) * am <= players[p].stuff.resources.gold &&
            Math.round(shop[s].price.food / 2) * am <= players[p].stuff.resources.food &&
            shop[s].price.workers * am <= players[p].stuff.resources.workers;
    }
    else {
        return shop[s].price.stone * am <= players[p].stuff.resources.stone &&
            shop[s].price.iron * am <= players[p].stuff.resources.iron &&
            shop[s].price.gold * am <= players[p].stuff.resources.gold &&
            shop[s].price.food * am <= players[p].stuff.resources.food &&
            shop[s].price.workers * am <= players[p].stuff.resources.workers;
    }
};

var messengers = [];
var waitTimes = [];

var shop = [
    //other
    {
        name: "scouter",
        description: "looks for other players castles",
        price: {stone: 5, gold: 1, iron: 1, food: 0, workers: 1, power: 1}
    },
    {
        name: "messenger",
        description: "allows you to talk with other players(CAN BE KILLED)",
        price: {stone: 0, gold: 5, iron: 5, food: 0, workers: 1, power: 1}
    },
    {
        name: "farm",
        description: "Every time you farm you get 10 more food",
        price: {stone: 10, gold: 20, iron: 1, food: 0, workers: 0, power: 1}
    },
    {
        name: "house",
        description: "Gives you more space for 5 more workers",
        price: {stone: 10, gold: 10, iron: 5, food: 0, workers: 0, power: 2}
    },
    {
        name: "forge",
        description: "Gives you 10 more iron storage",
        price: {stone: 0, gold: 0, iron: 10, food: 0, workers: 0, power: 2}
    },
    {
        name: "stoneblock-house",
        description: "Gives you 20 more stone storage",
        price: {stone: 20, gold: 0, iron: 0, food: 0, workers: 0, power: 2}
    },
    {
        name: "barn",
        description: "Gives you 20 more food storage",
        price: {stone: 20, gold: 20, iron: 5, food: 0, workers: 0, power: 2}
    },
    {
        name: "treasury",
        description: "Gives you 50 more gold storage",
        price: {stone: 0, gold: 50, iron: 0, food: 0, workers: 0, power: 2}
    },
//defense
    {
        name: "anti-spy",
        description: "Chances of catching enemy spy go up by 5%",
        price: {stone: 0, gold: 10, iron: 5, food: 10, workers: 1, power: 1}
    },
    {
        name: "moats",
        description: "Boosts DP by 1",
        price: {stone: 10, gold: 0, iron: 5, food: 0, workers: 0, power: 2}
    },
    {
        name: "gates",
        description: "Boosts DP by 2",
        price: {stone: 15, gold: 20, iron: 5, food: 0, workers: 0, power: 3}
    },
    {
        name: "archers",
        description: "Boosts DP by 3",
        price: {stone: 0, gold: 30, iron: 5, food: 0, workers: 1, power: 4}
    },
    {
        name: "molten-iron",
        description: "Boosts DP by 6 (-2 IRON after every defense)",
        price: {stone: 10, gold: 20, iron: 5, food: 0, workers: 0, power: 4}
    },
    {
        name: "catapult",
        description: "Boosts DP by 4",
        price: {stone: 10, gold: 10, iron: 20, food: 0, workers: 0, power: 4}
    },
    {
        name: "extra-walls",
        description: "Boosts DP by 5",
        price: {stone: 30, gold: 50, iron: 20, food: 0, workers: 1, power: 5}
    },
//attack
    {
        name: "spy",
        description: "Allows you to see other players defenses (CAN BE KILLED)",
        price: {stone: 10, gold: 10, iron: 5, food: 0, workers: 1, power: 3}
    },
    {
        name: "spy-training",
        description: "Chance of succesful spy infiltration go up by 5%",
        price: {stone: 0, gold: 10, iron: 10, food: 0, workers: 0, power: 1}
    },
    {
        name: "knights",
        description: "Raises AP by 1",
        price: {stone: 10, gold: 0, iron: 10, food: 0, workers: 1, power: 2}
    },
    {
        name: "battering-ram",
        description: "raises AP by 3 (if enemy has GATES or EXTRA-WALLS)",
        price: {stone: 15, gold: 20, iron: 5, food: 0, workers: 0, power: 2}
    },
    {
        name: "bowmen",
        description: "raises AP by 4 (deals damage to archers)",
        price: {stone: 15, gold: 10, iron: 10, food: 0, workers: 1, power: 3}
    },
    {
        name: "chariots",
        description: "raises AP by 3 (double against castle)",
        price: {stone: 20, gold: 10, iron: 10, food: 20, workers: 0, power: 3}
    },
    {
        name: "catapults",
        description: "raises AP by 4",
        price: {stone: 20, gold: 30, iron: 5, food: 0, workers: 0, power: 4}
    },
    {
        name: "ladder-men",
        description: "neutralizes 1 EXTRA-WALL per LADDER-MEN",
        price: {stone: 20, gold: 50, iron: 10, food: 0, workers: 1, power: 5}
    }
];
var theStuff = {
    HP: 100,
    flag: false,
    timeHeld: 0,
    alive: true,
    resources: {
        people: 5,
        food: 25,
        gold: 25,
        stone: 10,
        iron: 5,
        workers: 5
    },
    items: {
        //other
        scouter: 0,
        messenger: 0,
        farm: 1,
        house: 1,
        forge: 1,
        stoneblockHouse: 1,
        barn: 2,
        treasury: 1,
        //defense
        antiSpy: 0,
        moats: 0,
        gates: 0,
        archers: 0,
        moltenIron: 0,
        catapult: 0,
        extraWalls: 0,
        //attack
        spy: 0,
        spyTraining: 0,
        knights: 0,
        batteringRam: 0,
        bowmen: 0,
        chariots: 0,
        catapults: 0,
        ladderMen: 0
    }
};
var modesReady = ["FFA", "TDM", "KOTH", "TKOTH"];
//double resources
//cheaper defense itms, boosts antispy/successful interrogation
//chance of success spy/scout boost  cheaper attack itms
//shop items are cheaper
//boost of chance for spying/antispying/scouting/succesful interrogation
var factions=["AGRICULTURE","DEFENDERS","ATTACKERS","MARKETPLACE","LUCKY"];
var saveEverything = function () {
    save.censored = censoredWords;
    save.gameNumber = gameNumber;
    save.prefix = prefix;
    rec.records = highscores;
    save.specialIds = specialIds;
    fs.writeFileSync("./Save.json", JSON.stringify(save));
    console.log("SAVED");
};
var gameOver = function(over){
    gameSettings.playing=false;
    clearInterval(everySecTimer);
    clearInterval(everyMinTimer);
    messengers=[];
    waitTimes=[];
    var txt = "Game Number `" + (gameNumber + 1) + "` Mode: `" + gameSettings.mode + "`\n```";
    for (var i = 0; i < players.length; i++) {
        var team = "";
        var winner = " | LOST";
        if(players[i].stuff.alive){
            winner=" | WON";
        }
        if(!over){
            winner = "";
        }
        if(gameSettings.mode.toLowerCase()==="tdm"||gameSettings.mode.toLowerCase() === "tkoth"){
            team = " | "+players[i].team
        }
        txt += "#" + (i + 1) + " | " + players[i].name + " | " + players[i].attackNum+team+winner+"\n";
        bot.guilds.get(specialIds.server).members.get(players[i].id).removeRole(specialIds.playerRole);
        if(over){
            for(var j =0;j<highscores.length;j++){
                if(players[i].id === highscores[j].id) {
                    highscores[j].name=players[i].name;
                    found = true;
                    highscores[j].totPlays++;
                    var won = players[i].stuff.alive;
                    if(won){
                        highscores.totWins++;
                    }else{
                        highscores.totLoses++;
                    }
                    switch(gameSettings.mode.toLowerCase()){
                        case "ffa": highscores[j].FfaPlays++; if(won){highscores[j].FfaWins++;}else{highscores[j].FfaLoses++;}break;
                        case "tdm": highscores[j].TeamPlays++; if(won){highscores[j].TeamWins++;}else{highscores[j].TeamLoses++;}break;
                        case "koth": highscores[j].KthPlays++; if(won){highscores[j].KthWins++;}else{highscores[j].KthLoses++;}break;
                        case "tkoth": highscores[j].TKthPlays++; if(won){highscores[j].TKthWins++;}else{highscores[j].TKthLoses++;}break;
                    }
                }
            }
            saveEverything();
        }
    }

    players=[];
    bot.channels.get(specialIds.gameLog).fetchMessage(specialIds.previousMessageInGameLog).then(function(m){m.edit(txt+"```")});
    setTimeout(function(){
        purgeMessages(bot.channels.get(specialIds.announce),90);
        purgeMessages(bot.channels.get(specialIds.announce),90);
        purgeMessages(bot.channels.get(specialIds.announce),90);
    },10000);
    gameNumber++;
};

bot.on("ready", function () {
    gameNumber = save.gameNumber;
    bot.user.setGame(defaultPrefix + "help");
    console.log("ready");
    censoredWords = save.censored;
    prefix = save.prefix;
    gameNumber = save.gameNumber;
    highscores = rec.records;
    setInterval(saveEverything, 60000 * 5);//5 mins every autosave
    specialIds = save.specialIds;
});
var spacing = function (text, max) {
    var s = "";
    for (var i = 0; i < text.length - max.length; i++) {
        s += " ";
    }
    return s;
};
var deepClone = function(obj){
    return JSON.parse(JSON.stringify(obj));
};
var purgeMessages=function(channel,amount){
    channel.fetchMessages({limit: amount}).then(function(messages){ channel.bulkDelete(messages)});
};

var everyMinTimer = false;
var everyMin = function () {

    var txt = "Game Number `" + (gameNumber + 1) + "` Mode: `" + gameSettings.mode + "`\n```\n";
    for (var i = 0; i < players.length; i++) {
        if(players[i].name.toLowerCase() === "MIDDLE".toLowerCase()||players[i].name.toLowerCase()==="CENTER".toLowerCase()||players[i].username.toLowerCase() === "MIDDLE".toLowerCase()||players[i].username.toLowerCase()==="CENTER".toLowerCase()){
            return;
        }
        var team = "";
        var dead = " | ALIVE";
        if(gameSettings.mode.toLowerCase()==="tdm"||gameSettings.mode.toLowerCase() === "tkoth"){
            team = " | "+players[i].team
        }


        if(!players[i].stuff.alive){
            dead = " | DEAD";
        }
        txt += "#" + (i + 1) + " | " + players[i].name + " | " + players[i].attackNum+team+dead;
        if (players[i].stuff.alive) {
            if (players[i].stuff.flag) {
                players[i].stuff.timeHeld++;
                bot.channels.get(specialIds.announce).send("Player #" + (i + 1) + " Has held the flag for `" + players[i].stuff.timeHeld + "` out of the needed `" + gameSettings.timeNeededToBeHeld + "`\nThier ATTACK-NUM is `" + players[i].attackNum + "`");
            }
            var gains = {stone: 0, iron: 0, gold: 0, food: 0, workers: 0, eaten: 0, person: "None"};

            //gold
            if (players[i].stuff.resources.gold !== players[i].stuff.items.treasury * 50) {
                if (players[i].stuff.resources.gold * players[i].stuff.resources.people <= players[i].stuff.items.treasury * 50) {
                    gains.gold = players[i].stuff.resources.people * 10;
                    players[i].stuff.resources.gold += players[i].stuff.resources.people * 10;
                } else {
                    gains.gold = players[i].stuff.items.treasury * 50 - players[i].stuff.resources.gold;
                    players[i].stuff.resources.gold = players[i].stuff.items.treasury * 50;
                }
            }

            //eat
            if (players[i].stuff.resources.food >= 2 * players[i].stuff.resources.people) {
                gains.eaten = 2 * players[i].stuff.resources.people;
                players[i].stuff.resources.food -= 2 * players[i].stuff.resources.people;
            }
            else {
                gains.eaten = 2 * players[i].stuff.resources.people - players[i].stuff.resources.food;
                players[i].stuff.resources.food = 0;
                var things = [];

                if (players[i].stuff.resources.workers >= 2) {
                    things.push(0);
                }
                if (players[i].stuff.items.messenger > 0) {
                    things.push(1);
                }
                if (players[i].stuff.items.scouter > 0) {
                    things.push(2);
                }
                if (players[i].stuff.items.antiSpy > 0) {
                    things.push(3);
                }
                if (players[i].stuff.items.archers > 0) {
                    things.push(4);
                }
                if (players[i].stuff.items.spy > 0) {
                    things.push(5);
                }
                if (players[i].stuff.items.knights > 0) {
                    things.push(6);
                }
                if (players[i].stuff.items.bowmen > 0) {
                    things.push(7);
                }
                if (players[i].stuff.items.ladderMen > 0) {
                    things.push(8);
                }

                var r = Math.floor(Math.random() * things.length);
                switch (things[r]) {
                    case 0:
                        players[i].stuff.resources.workers -= 1;
                        gains.person = "Worker";
                        break;
                    case 1:
                        players[i].stuff.items.messenger -= 1;
                        gains.person = "Messenger";
                        break;
                    case 2:
                        players[i].stuff.items.scouter -= 1;
                        gains.person = "Scouter";
                        break;
                    case 3:
                        players[i].stuff.items.antiSpy -= 1;
                        gains.person = "Anti-Spy";
                        break;
                    case 4:
                        players[i].stuff.items.archers -= 1;
                        gains.person = "Archers";
                        break;
                    case 5:
                        players[i].stuff.items.spy -= 1;
                        gains.person = "Spy";
                        break;
                    case 6:
                        players[i].stuff.items.knights -= 1;
                        gains.person = "Knights";
                        break;
                    case 7:
                        players[i].stuff.items.bowmen -= 1;
                        gains.person = "Bowmen";
                        break;
                    case 8:
                        players[i].stuff.items.ladderMen -= 1;
                        gains.person = "Ladder-Men";
                        break;
                    default:
                        gains.person = "Luck";
                        break;
                }
                players[i].stuff.resources.people -= 1;
            }

            //workers
            if (players[i].stuff.resources.people < (players[i].stuff.items.house * 5) && players[i].stuff.resources.food > 0){
                players[i].stuff.resources.workers++;
                players[i].stuff.resources.people++;
                gains.workers = 1;
            }

            //scouters
            if (players[i].stuff.items.scouter > 0) {
                var t = Math.round(Math.random() * 10);
                console.log(t);
                if(players[i].faction.toLowerCase() === "attackers"||players[i].faction.toLowerCase() === "lucky"){
                    t-=2;
                }
                console.log(t);
                if (t < 5) {
                    bot.users.get(players[i].id).send("One of your scouters has returned");
                    var r = Math.floor(Math.random() * players.length);
                    while (r === i || players[r].stuff.alive == false) {
                        r = Math.floor(Math.random() * players.length);
                    }

                    var q = Math.floor(Math.random() * 5);
                    if(players[i].faction.toLowerCase() === "lucky"||players[i].faction.toLowerCase() === "attackers"){
                        if(q!==0){
                            q++;
                        }
                    }
                    if(players[r].faction.toLowerCase() === "lucky"||players[r].faction.toLowerCase() === "defenders"){
                        if(q>1) {
                            q--;
                        }
                    }
                    if (q === 1) {
                        players[i].stuff.items.scouter--;
                        players[i].stuff.resources.people--;
                        var team = "";
                        if (gameSettings.mode.toLowerCase() === "tdm") {
                            team = "\nTeam: " + players[r].team
                        }
                        bot.users.get(players[i].id).send("He was so badly hurt he had barely the time to tell you one of your enemy's information before he died ```css\nAttack-Num: " + players[r].attackNum + "\nPower: " + getPowerLevel(r) + "\nkingdom: " + players[r].kingdom + team + "```\nScouters: `-1`");
                        bot.users.get(players[r].id).send("Your kingdom scouts have reported that a enemy scout has seen your base and has left.\n**BEWARE** someone can now spy, message and attack you");
                    } else {
                        bot.users.get(players[i].id).send("He's found one of your enemy's information. ```css\nAttack-Num: " + players[r].attackNum + "\nPower: " + getPowerLevel(r) + "\nkingdom: " + players[r].kingdom + team + "```");
                    }
                }
            }
            var msg = "You have now gained:```diff\n!====ITEMS====!\n+ Taxed-Gold: " + gains.gold + "\n+ Hired-Workers: " + gains.workers + "\n- Eaten Food: " + gains.eaten;
            if (gains.person !== "None") {
                msg += "\n- Person Starved: " + gains.person + "```\nOne of your people have died because there is no more food, farm more food to keep your workers";
            } else {
                msg += "```";
            }
            bot.users.get(players[i].id).send(msg);
            txt+="\n"
        }
    }

    bot.channels.get(specialIds.gameLog).fetchMessage(specialIds.previousMessageInGameLog).then(function(m){m.edit(txt+"```")});
};
var everySecTimer = false;
var everySec = function () {
    for (var i = 0; i < waitTimes.length; i++) {
        if (waitTimes[i][2] > 0) {
            waitTimes[i][2]--;
        } else {
            waitTimes.splice(i, 1);
        }
    }
    for (var i = 0; i < messengers.length; i++) {
        messengers[i].time--;
        if (messengers[i].time === 0) {
            bot.users.get(players[messengers[i].from].id).send("Your messenger was ignored.");
            bot.users.get(players[messengers[i].to].id).send("You ignored the messenger for too long, He left");
            players[messengers[i].from].stuff.items.messenger++;
            messengers.splice(i, 1);
        }
    }
    if (waitTimes.length === 0 && messengers.length === 0) {
        clearInterval(everySecTimer);
        everySecTimer = false;
    }
};
var attackPlayer = function (A, D) {
    if(!players.length){
        console.log("go");
        return;
    }
    var oldHP = players[D].stuff.HP;
    bot.users.get(players[A].id).send("ARMY HAS ARRIVED AT `" + players[D].kingdom+"`");
    bot.users.get(players[D].id).send("`"+players[A].kingdom + "`'S ARMY HAS ARRIVED AT YOUR CASTLE");
    var attackersTxt = "```diff\n";
    var defendersTxt = "```css\n";
    var AP = 0;
    var DP = 0;
    var attackersItems = {
        knights: players[A].stuff.items.knights,
        batteringRam: players[A].stuff.items.batteringRam,
        bowmen: players[A].stuff.items.bowmen,
        chariots: players[A].stuff.items.chariots,
        catapults: players[A].stuff.items.catapults,
        ladderMen: players[A].stuff.items.ladderMen
    };
    var defendersItems = {
        moats: players[A].stuff.items.moats,
        gates: players[A].stuff.items.gates,
        archers: players[A].stuff.items.archers,
        moltenIron: players[A].stuff.items.moltenIron,
        catapult: players[A].stuff.items.catapult,
        extraWalls: players[A].stuff.items.extraWalls
    };
    var Hadattackers = {
        knights: players[A].stuff.items.knights,
        batteringRam: players[A].stuff.items.batteringRam,
        bowmen: players[A].stuff.items.bowmen,
        chariots: players[A].stuff.items.chariots,
        catapults: players[A].stuff.items.catapults,
        ladderMen: players[A].stuff.items.ladderMen
    };
    var Haddefenders = {
        moats: players[A].stuff.items.moats,
        gates: players[A].stuff.items.gates,
        archers: players[A].stuff.items.archers,
        moltenIron: players[A].stuff.items.moltenIron,
        catapult: players[A].stuff.items.catapult,
        extraWalls: players[A].stuff.items.extraWalls
    };
    if (attackersItems.ladderMen > defendersItems.extraWalls) {
        attackersItems.ladderMen -= defendersItems.extraWalls;
        defendersItems.extraWalls = 0;
        AP += attackersItems.ladderMen
    }
    else {
        var exW = defendersItems.extraWalls;
        defendersItems.extraWalls -= attackersItems.ladderMen;
        attackersItems.ladderMen -= exW;
        DP += defendersItems.extraWalls * 5
    }

    AP += attackersItems.knights;
    if(defendersItems.gates>0||defendersItems.extraWalls>0) {
        AP += attackersItems.batteringRam * 3;
    }
    AP += attackersItems.bowmen * 4;
    AP += attackersItems.chariots * 3;
    AP += attackersItems.catapults * 4;

    DP += defendersItems.moats;
    DP += defendersItems.gates * 2;
    DP += defendersItems.archers * 3;
    DP += defendersItems.moltenIron * 6;
    DP += defendersItems.catapult * 4;
    if (AP > DP) {
        bot.users.get(players[A].id).send("your ATTACK-POWER is greater then your opponent's DEFENSE-POWER\nA sure victory this is! Long live King of " + players[A].kingdom);
        bot.users.get(players[D].id).send("your DEFENSE-POWER is lower then your opponent's ATTACK-POWER\nVery little hope resides with your kingdom now");
    } else if (DP > AP) {
        bot.users.get(players[A].id).send("your ATTACK-POWER is lower then your opponent's DEFENSE-POWER\nIts unlikely that you will win this battle, its too late to call your troops back");
        bot.users.get(players[D].id).send("your DEFENSE-POWER is grater then your opponent's ATTACK-POWER\nDefending your castle will be easy");
    } else {
        bot.users.get(players[A].id).send("your ATTACK-POWER is equal to your opponent's DEFENSE-POWER\nA even match you shall fight");
        bot.users.get(players[D].id).send("your DEFENSE-POWER is equal to your opponent's ATTACK-POWER\nA even match you shall fight");
    }
    if (defendersItems.extraWalls > 0) {
        var tim = defendersItems.extraWalls * 60;
        while (tim > 0) {
            if (attackersItems.batteringRam > 0) {
                while (tim > 0 && attackersItems.batteringRam > 0) {
                    if (tim > 30 && defendersItems.bowmen > 0) {
                        attackersItems.batteringRam--;
                    }
                    tim -= 40;
                }
            }
            else if (attackersItems.catapults > 0) {
                while (tim > 0 && attackersItems.catapults > 0) {
                    if (tim > 30 && defendersItems.bowmen > 0) {
                        attackersItems.catapults--;
                    }
                    tim -= 40;
                }
            }
            else if (attackersItems.chariots > 0) {
                while (tim > 0 && attackersItems.chariots > 0) {
                    if (tim > 30 && defendersItems.bowmen > 0) {
                        attackersItems.chariots--;
                    }
                    tim -= 30;
                }
            }
            else if (attackersItems.knights > 0) {
                while (tim > 0 && attackersItems.knights > 0) {
                    if (tim > 30 && defendersItems.bowmen > 0) {
                        attackersItems.knights--;
                    }
                    tim -= 10;
                }
            }
            else {
                break;
            }
        }
        defendersItems.extraWalls = Math.round((tim / 60) + 30);
    }
    //for each wall(left) a "fake-min" is needed,
    //each batteringRam shortens it by "fake-40-secs", each 30 secs 1 dies
    //(if still some) each catapult shortens it by "fake-40-secs" each 30 secs 1 dies
    //(if still some) each chariot shortens it by "fake-30-secs" each 30 secs 1 dies
    //(if still some) each knight shortens it by "fake-10-secs" each 30 secs 1 dies

    if (attackersItems.catapults > 0) {
        defendersItems.moltenIron -= Math.floor(attackersItems.catapults / 3);
        attackersItems.catapults -= Math.floor(defendersItems.catapult / 3);
    }
    //catapults-=floor(catapult/3)
    //moltenIron -= floor(catapults/3)

    if (defendersItems.moltenIron > 0) {
        var howMany = Math.round(players[D].stuff.resources.iron / 2);
        var ironAt = 0;
        while (howMany > ironAt && ironAt < defendersItems.moltenIron) {
            var ran = Math.round(Math.random() * 3);
            switch (ran) {
                case 0:
                    attackersItems.chariots -= 2;
                    break;
                case 1:
                    attackersItems.bowmen -= 3;
                    break;
                case 2:
                    attackersItems.knights -= 3;
                    break;
                case 3:
                    attackersItems.chariots -= 1;
                    break;
            }
            ironAt++;
        }
        players[D].stuff.resources.iron -= ironAt * 2;
    }
    //each molten iron will randomly kill some chariots/knights/bowmen
    if (defendersItems.moats > 0) {
        var tim = defendersItems.moats * 60;
        if (attackersItems.knights > 0) {
            while (tim > 0 && attackersItems.knights > 0) {
                if (tim > 30 && defendersItems.bowmen > 0) {
                    attackersItems.knights--;
                }
                tim -= 20;
            }
        }
        if (defendersItems.moats > 0 && attackersItems.knights === 0) {
            var batt = attackersItems.batteringRam;
            if (defendersItems.moats > batt) {
                attackersItems.batteringRam = 0;
                defendersItems.moats -= batt;
            }
            else {
                attackersItems.batteringRam -= defendersItems.moats;
                defendersItems.moats -= batt;
            }

            var char = Math.round(attackersItems.chariots / 2);
            if (defendersItems.moats > char) {
                attackersItems.chariots = 0;
                defendersItems.moats -= char;
            }
            else {
                attackersItems.chariots -= defendersItems.moats * 2;
                defendersItems.moats -= char;
            }


        }

    }
    //for each moat a "fake-min" is needed and each knight shortens it by "fake-20-secs", each 30 secs they spend 1 knight gets killed by an archer (if archers exist), EX (chariots cant help)
    //if theres some moats still left 1 battering Ram takes out 1 moat,
    //if theres even more moats still left 2 chariots take out 1 moat,

    if (defendersItems.archers > 0) {
        var subAr = Math.round(defendersItems.archers / 2);
        if (attackersItems.bowmen > 0) {
            defendersItems.archers -= Math.round(attackersItems.bowmen / 2);
            attackersItems.bowmen -= subAr;
            if (defendersItems.archers < 0) {
                defendersItems.archers = 0;
            }
            if (attackersItems.bowmen < 0) {
                attackersItems.bowmen = 0;
            }
        }
        else if (attackersItems.knights > 0) {
            if (attackersItems.knights > subAr) {
                attackersItems.knights -= subAr;
            } else {
                attackersItems.knights = 0;
            }
        }
        else if (attackersItems.chariots > 0) {
            if (attackersItems.chariots > subAr) {
                attackersItems.chariots -= subAr;
            } else {
                attackersItems.chariots = 0;
            }

        }
        else if (attackersItems.batteringRam > 0) {
            if (attackersItems.batteringRam > Math.round(subAr / 2)) {
                attackersItems.batteringRam -= Math.round(subAr / 2);
            } else {
                attackersItems.batteringRam = 0;
            }
        }
        else if (attackersItems.catapults > 0) {
            if (attackersItems.catapults > Math.round(subAr / 2)) {
                attackersItems.catapults -= Math.round(subAr / 2);
            } else {
                attackersItems.catapults = 0;
            }
        }

    }
    //archers take out floor(archers/2) amount of bowmen
    //bowmen take out floor(bowman/2) amount of archers

    if (defendersItems.catapult > 0) {
        var catt = Math.floor(defendersItems.catapult / 3);
        if (attackersItems.catapults > 0) {
            defendersItems.catapult -= Math.floor(attackersItems.catapults / 3);
            attackersItems.catapults -= catt;
            if (defendersItems.catapult < 0) {
                defendersItems.catapult = 0;
            }
            if (attackersItems.catapults < 0) {
                attackersItems.catapults = 0;
            }
        }
        else if (attackersItems.bowmen > 0) {
            defendersItems.catapult -= Math.floor(attackersItems.bowmen / 3);
            attackersItems.bowmen -= catt * 2;

            if (defendersItems.catapult < 0) {
                defendersItems.catapult = 0;
            }
            if (attackersItems.bowmen < 0) {
                attackersItems.bowmen = 0;
            }
        }
        else if (attackersItems.knights > 0) {
            defendersItems.catapult -= Math.floor(attackersItems.knights / 3);
            attackersItems.knights -= catt * 2;

            if (defendersItems.catapult < 0) {
                defendersItems.catapult = 0;
            }
            if (attackersItems.knights < 0) {
                attackersItems.knights = 0;
            }
        }
        else if (attackersItems.chariots > 0) {
            defendersItems.catapult -= Math.floor(attackersItems.chariots / 3);
            attackersItems.chariots -= catt * 2;

            if (defendersItems.catapult < 0) {
                defendersItems.catapult = 0;
            }
            if (attackersItems.chariots < 0) {
                attackersItems.chariots = 0;
            }
        }
        else if (attackersItems.batteringRam > 0) {
            defendersItems.catapult -= Math.floor(attackersItems.batteringRam / 3);
            attackersItems.batteringRam -= catt;

            if (defendersItems.catapult < 0) {
                defendersItems.catapult = 0;
            }
            if (attackersItems.batteringRam < 0) {
                attackersItems.batteringRam = 0;
            }
        }
    }
    //catapults-=floor(catapult/3)
    //catapult-=floor(catapults/3)
    if (defendersItems.gates > 0) {
        var tim = defendersItems.gates * 60;
        while (tim > 0) {
            if (attackersItems.batteringRam > 0) {
                if (tim > 60) {
                    attackersItems.batteringRam--;
                }
                tim -= 30;
            }
            else if (attackersItems.knights > 0) {
                if (tim > 30) {
                    attackersItems.knights--;
                }
                tim -= 10;
            }
            else if (attackersItems.chariots > 0) {
                if (tim > 30) {
                    attackersItems.chariots--;
                }
                tim -= 10
            }
            else {
                break;
            }
        }
    }
    //each gates a "fake-min" is needed
    //each batteringRam shortens it by "fake-30-secs", - for each "fake-min" batteringRam spends 1 batteringRam dies
    //if(gates)each knight shortens it by "fake-10-secs" -  for each 30 secs the knights spend 1 knight dies,
    //if gates still exist, each chariots shortens it by "fake-10-secs" for each 30 secs the chariot dies

    while (defendersItems.archers > 1) {
        var arc = Math.floor(defendersItems.archers / 2);
        if (attackersItems.bowmen <= 1) {
            break;
        }
        defendersItems -= Math.round(attackersItems.bowmen / 2);
        attackersItems -= arc;
    }
    //archers take out floor(archers/2) amount of bowmen
    //bowmen take out floor(bowman/2) amount of archers
    var atk = 0;
    while (players[D].stuff.HP > 0) {
        atk++;
        players[D].stuff.HP -= attackersItems.knights;
        players[D].stuff.HP -= attackersItems.batteringRam * 3;
        players[D].stuff.HP -= attackersItems.chariots * 6;
        players[D].stuff.HP -= attackersItems.catapults * 4;
        if (atk === 2 && defendersItems.archers > 0) {
            atk = 0;
            defendersItems.archers -= Math.floor(attackersItems.bowmen / 2);
            if (attackersItems.knights > 0) {
                attackersItems.knights--;
            }
            if (attackersItems.batteringRam > 0) {
                attackersItems.batteringRam--;
            }
            if (attackersItems.chariots > 0) {
                attackersItems.chariots--;
            }
            if (attackersItems.catapults > 0) {
                attackersItems.catapults--;
            }
            if (attackersItems.bowmen > 0) {
                attackersItems.bowmen--;
            }
        }
        if (attackersItems.knights === 0 && attackersItems.batteringRam === 0 && attackersItems.chariots === 0 && attackersItems.catapults === 0 && attackersItems.bowmen === 0) {
            break;
        }
    }
    attackersTxt += "+ Destroyed " + (Haddefenders.moats - defendersItems.moats) + "/" + Haddefenders.moats + " moats\n";
    attackersTxt += "+ Destroyed " + (Haddefenders.gates - defendersItems.gates) + "/" + Haddefenders.gates + " gates\n";
    attackersTxt += "+ Destroyed " + (Haddefenders.archers - defendersItems.archers) + "/" + Haddefenders.archers + " archers\n";
    attackersTxt += "+ Destroyed " + (Haddefenders.moltenIron - defendersItems.moltenIron) + "/" + Haddefenders.moltenIron + " moltenIron\n";
    attackersTxt += "+ Destroyed " + (Haddefenders.catapult - defendersItems.catapult) + "/" + Haddefenders.catapult + " catapult\n";
    attackersTxt += "+ Destroyed " + (Haddefenders.extraWalls - defendersItems.extraWalls) + "/" + Haddefenders.extraWalls + " extraWalls\n";
    attackersTxt += "- Lost " + (Hadattackers.knights - attackersItems.knights) + "/" + Hadattackers.knights + " knights\n";
    attackersTxt += "- Lost " + (Hadattackers.batteringRam - attackersItems.batteringRam) + "/" + Hadattackers.batteringRam + " batteringRam\n";
    attackersTxt += "- Lost " + (Hadattackers.bowmen - attackersItems.bowmen) + "/" + Hadattackers.bowmen + " bowmen\n";
    attackersTxt += "- Lost " + (Hadattackers.chariots - attackersItems.chariots) + "/" + Hadattackers.chariots + " chariots\n";
    attackersTxt += "- Lost " + (Hadattackers.catapults - attackersItems.catapults) + "/" + Hadattackers.catapults + " catapults\n";
    attackersTxt += "- Lost " + (Hadattackers.ladderMen - attackersItems.ladderMen) + "/" + Hadattackers.ladderMen + " ladderMen\n";
    attackersTxt += "```";


    defendersTxt += "+ Destroyed " + (Hadattackers.knights - attackersItems.knights) + "/" + Hadattackers.knights + " knights\n";
    defendersTxt += "+ Destroyed " + (Hadattackers.batteringRam - attackersItems.batteringRam) + "/" + Hadattackers.batteringRam + " batteringRam\n";
    defendersTxt += "+ Destroyed " + (Hadattackers.bowmen - attackersItems.bowmen) + "/" + Hadattackers.bowmen + " bowmen\n";
    defendersTxt += "+ Destroyed " + (Hadattackers.chariots - attackersItems.chariots) + "/" + Hadattackers.chariots + " chariots\n";
    defendersTxt += "+ Destroyed " + (Hadattackers.catapults - attackersItems.catapults) + "/" + Hadattackers.catapults + " catapults\n";
    defendersTxt += "+ Destroyed " + (Hadattackers.ladderMen - attackersItems.ladderMen) + "/" + Hadattackers.ladderMen + " ladderMen\n";
    defendersTxt += "- Lost " + (Haddefenders.moats - defendersItems.moats) + "/" + Haddefenders.moats + " moats\n";
    defendersTxt += "- Lost " + (Haddefenders.gates - defendersItems.gates) + "/" + Haddefenders.gates + " gates\n";
    defendersTxt += "- Lost " + (Haddefenders.archers - defendersItems.archers) + "/" + Haddefenders.archers + " archers\n";
    defendersTxt += "- Lost " + (Haddefenders.moltenIron - defendersItems.moltenIron) + "/" + Haddefenders.moltenIron + " moltenIron\n";
    defendersTxt += "- Lost " + (Haddefenders.catapult - defendersItems.catapult) + "/" + Haddefenders.catapult + " catapult\n";
    defendersTxt += "- Lost " + (Haddefenders.extraWalls - defendersItems.extraWalls) + "/" + Haddefenders.extraWalls + " extraWalls\n";
    defendersTxt += "```";
    bot.users.get(players[A].id).send(attackersTxt);
    bot.users.get(players[D].id).send(defendersTxt);
    if (players[D].stuff.HP > 0) {
        bot.users.get(players[A].id).send("You have dealt `" + (oldHP - players[D].stuff.HP) + "/" + oldHP + "` damage");
        bot.users.get(players[D].id).send("You have `" + players[D].stuff.HP + "` HP remaining.");
    }
    else {
        bot.users.get(players[A].id).send("You have dealt `" + oldHP - players[D].stuff.HP + "/" + oldHP + "` damage!\nCONGRATULATIONS, as a reward you get all of of your enemy's resources\n```css\nStone: " + players[D].stuff.resources.stone + "\nIron: " + players[D].stuff.resources.iron + "\nGold: " + players[D].stuff.resources.gold + "Food: " + players[D].stuff.resources.food + "```");
        players[A].stuff.resources.stone += players[D].stone;
        players[A].stuff.resources.iron += players[D].iron;
        players[A].stuff.resources.food += players[D].food;
        players[A].stuff.resources.gold += players[D].gold;
        players[D].stone = 20;
        players[D].iron = 10;
        players[D].food = 25;
        players[D].gold = 20;
        if (gameSettings.mode.toLowerCase() !== "tkoth" && gameSettings.mode.toLowerCase() !== "koth") {
            bot.users.get(players[D].id).send("You have been defeated by `" + players[A].name + "` king of `" + players[A].kingdom + "`");
            bot.channels.get(specialIds.announce).send("Player #" + (D + 1) + " has been defeated by the king of " + players[A].kingdom + "\nPlayer #" + (D + 1) + " Was: `" + players[D].name + "` **GG** " + players[D].name);
            players[D].stuff.alive = false;
            bot.guilds.get(specialIds.server).members.get(players[D].id).removeRole(specialIds.playerRole);

        } else {
            if (players[D].stuff.flag) {
                bot.users.get(players[A].id).send("Your enemy had the flag, CONGRATULATIONS you are now the new King Of The Hill");
                bot.users.get(players[D].id).send("You have lost your flag, You held the flag for `" + players[D].stuff.timeHeld + "` minutes out of the `" + gameSettings.timeNeededToBeHeld + "` minutes");
                players[D].stuff.flag = false;
                players[A].stuff.flag = true;
                console.log("ran3");
                bot.channels.get(specialIds.announce).send("Player #" + (D + 1) + " has been defeated by the king of " + players[A].kingdom + "\nPlayer #" + (D + 1) + " Held the flag, Now Player #" + (A + 1) + " Holds the flag, His ATTACK-NUM is: " + players[A].attackNum);
            }
            else {
                bot.users.get(players[A].id).send("Sadly your enemy did not hold the flag");
                bot.channels.get(specialIds.announce).send("Player #" + (D + 1) + " has been defeated by the king of " + players[A].kingdom + "\nPlayer #" + (D + 1) + " Did not hold the flag.");
            }
        }
        console.log("ran4");
        var redAlive=false;
        var bluAlive=false;
        var foundPlay = 0;
        for(var i =0;i<players.length;i++){
            if(players[i].stuff.alive){
                foundPlay++;
                if(gameSettings.mode.toLowerCase()==="tkoth"){
                    if(players[i].team.toLowerCase()==="red"){
                        redAlive=true;
                    }else{
                        bluAlive=true;
                    }
                }
            }
        }
        console.log("ran5");
        if(!(RedTeam.alive&&BlueTeam.alive)&&gameSettings.mode.toLowerCase()==="tdm"){
            gameOver(true);
        }
        if(!(redAlive&&bluAlive)&&gameSettings.mode.toLowerCase()==="tkoth"){
            gameOver(true);
        }
        if(foundPlay===1){
            gameOver(true);
        }
    }
    //main castle has 100 hp (each troop except bowmen takes it AP and uses it as its attack chariots get double AP for attacking main base)for every 2 attacks archers kill 1 of every troop and archers kill floor(bowmen/2) archers

};
var storedTimeForPingCommand;
var commands = [
    {
        names: ["help"],
        description: "gives you all the commands with thier descriptions",
        usage: "help",
        DMcom: false,
        TXTcom: false,
        gameGoing: false,
        openPhase: false,
        ModCommand: false,
        FPcommand: false,
        waitTime: 0,
        does: function (words, message, player) {
            var txt = "**HELP**\n------------";
            var longestLength = 30;
            var getTxt = function(p){
                var t ="";
                if (gameSettings.playing && commands[p].gameGoing && player == null) {
                } else if (commands[p].DMcom && message.channel.type !== "dm") {
                } else if (commands[p].TXTcom && message.channel.type !== "text") {
                } else if (commands[p].FPcommand && message.author.id !== "244590122811523082") {
                } else if (commands[p].ModCommand && checkForMod(message) === false) {
                } else if (commands[p].gameGoing && gameSettings.playing !== true) {
                } else if (commands[p].openPhase && gameSettings.open !== true) {
                } else if (commands[p].waitTime > 0 && checkWaitTimes(false, commands[p].names[0], player)) {
                } else {
                    var spacing = " ";
                    for (var j = 0; j < longestLength - commands[i].usage.length; j++) {
                        spacing += " "
                    }
                    t += "\n`" + prefix + commands[i].usage + spacing + " -` " + commands[i].description;
                }
                return t;
            }
            for (var i = 0; i < Math.round(commands.length/2); i++) {
                txt+=getTxt(i);
            }
            message.channel.send(txt);
            txt = "";
            for (var i = Math.round(commands.length/2); i < commands.length; i++) {
               txt+= getTxt(i);
            }
            message.channel.send(txt);
            message.channel.send("", {
                embed: {
                    color: 0x00C8C8,
                    title: "",
                    fields: [
                        {
                            name: 'SERVER---||---INVITE',
                            value: '[server-link](https://discord.gg/ZCZ4sf5)||[invite link](https://discordapp.com/oauth2/authorize?client_id=332286067828981760&scope=bot&permissions=2080374975)'
                        }
                    ],
                    footer: {
                        text: '©FrustratedProgrammer'
                    }
                }
            });
        }
    },//HELP
    {
        names: ["ping"],
        description: "ping the server and find how long is the response time",
        usage: "pong",
        DMcom: false,
        TXTcom: false,
        gameGoing: false,
        openPhase: false,
        ModCommand: false,
        FPcommand: false,
        waitTime: 0,
        does: function (words, message, player) {
            storedTimeForPingCommand = Date.now();
            message.channel.send("Pong!").then(function(message) {
                message.channel.send("Response time: " + (Date.now() - storedTimeForPingCommand) + "ms");
            });
        }
    },//PING
    {
        names: ["subscribe","sub"],
        description: "subscribe or unsubscribe from getting notifs from the bot",
        usage: "subscribe",
        DMcom: false,
        TXTcom: true,
        gameGoing: false,
        openPhase: false,
        ModCommand: false,
        FPcommand: false,
        waitTime: 0,
        does: function (words, message, player) {
            if (message.member.roles.has(specialIds.subscriberRole)) {
                message.member.removeRole(specialIds.subscriberRole);
                message.reply("Successfully un-subscribed");
            }else{
                message.member.addRole(specialIds.subscriberRole);
                message.reply("Successfully subscribed");
            }
        }
    },//subs
    {
        names: ["save"],
        description: "save everything on the bot",
        usage: "save",
        DMcom: false,
        TXTcom: false,
        gameGoing: false,
        openPhase: false,
        ModCommand: false,
        FPcommand: true,
        waitTime: 0,
        does: function (words, message, player) {
            saveEverything();
            message.channel.send("Saved!");
        }
    },//save
    {
        names: ["close"],
        description: "closes the current game",
        usage: "close",
        DMcom: false,
        TXTcom: false,
        gameGoing: false,
        openPhase: false,
        ModCommand: true,
        FPcommand: false,
        waitTime: 0,
        does: function (words, message, player) {
            console.log(message.author.username+" has close the game");
            if(gameSettings.playing === true){
                gameSettings.playing=false;
                gameOver(false);
            }
            else if(gameSettings.open){
                gameSettings.open = false;
                players = [];
            }
            message.channel.send("Closed");
        }
    },//exit
    {
        names: ["commands", "coms"],
        description: "gives you a list of the commands and their other usages",
        usage: "commands",
        DMcom: false,
        TXTcom: false,
        gameGoing: false,
        openPhase: false,
        ModCommand: false,
        FPcommand: false,
        waitTime: 0,
        does: function (words, message, player) {
            var txt = "**COMMANDS**------------------**ALSO CAN USE**\n`[ITEM]` is a required item||`(ITEM)` is a optional item\n----------------------------------------------------------";
            var spacing = " ";
            var longestLength = 30;
            for (var i = 0; i < commands.length; i++) {
                for (var j = 0; j < longestLength - commands[i].usage.length; j++) {
                    spacing += " "
                }
                var others = "";
                for (var q = 0; q < commands[i].names.length; q++) {
                    others += "`" + prefix + commands[i].names[q] + "` "
                }
                txt += "\n`" + prefix + commands[i].usage + spacing + " -` " + others + "";
                spacing = " ";
            }
            message.channel.send(txt);
        }
    },//COMMANDS
    {
        names: ["factions","facs"],
        description: "changes wether factions be used in the game",
        usage: "factions [TRUE/FALSE]",
        DMcom: false,
        TXTcom: true,
        gameGoing: false,
        openPhase: false,
        ModCommand: true,
        FPcommand: false,
        waitTime: 0,
        does: function (words, message, player) {
            if(words[1]!=null) {
                if (words[1]==="true"){
                    gameSettings.factions=true;
                    message.channel.send("Factions Enabled");
                }
                else if(words[1]==="false"){
                    gameSettings.factions=false;
                    message.channel.send("Factions disabled");
                }
                else{
                    message.channel.send("It has to be `true` or `false`");
                }
            }
            else{
                message.channel.send("You need to inclue `true` or `false` at the end")
            }
        }
    },//faction

    {
        names: ["openGame", "open"],
        description: "opens the game to joining",
        usage: "openGame",
        DMcom: false,
        TXTcom: true,
        gameGoing: false,
        openPhase: false,
        ModCommand: true,
        FPcommand: false,
        waitTime: 0,
        does: function (words, message, player) {
            if (gameSettings.open == false && gameSettings.playing == false) {
                gameSettings.open = true;
                message.channel.send("<@&" + specialIds.subscriberRole + "> || Game is open to joining\n`"+prefix+"join` to join this game");
            }
            else if (gameSettings.playing == true) {
                message.reply("Game is in progress");
            }
            else {
                message.reply("Game is already open");
            }
        }
    },//OPEN
    {
        names: ["changePrefix"],
        description: "changes the prefix",
        usage: "changePrefix [NEW-PREFIX]",
        DMcom: false,
        TXTcom: true,
        gameGoing: false,
        openPhase: false,
        ModCommand: true,
        FPcommand: false,
        waitTime: 0,
        does: function (words, message, player) {
            if (words[1] != null) {
                if (words[1].length > 2) {
                    message.channel.send("Prefix must be 2 or less characters long")
                } else {
                    prefix = words[1];
                    message.channel.send("Prefix is changed to: `" + prefix + "`\nThe default prefix `" + defaultPrefix + "` wont change, so if you ever forget the prefix, go ahead and use `" + defaultPrefix + "`");
                }
            } else {
                message.channel.send("You need to add the new prefix")
            }
        }
    },//CHANGE PREFIX
    {
        names: ["modesList", "mList"],
        description: "shows you the list of all the mdoes choosable",
        usage: "modesList",
        DMcom: false,
        TXTcom: false,
        gameGoing: false,
        openPhase: false,
        ModCommand: false,
        FPcommand: false,
        waitTime: 0,
        does: function (words, message, player) {
            var txt = "List of all the modes choosable:\n";
            for (var i = 0; i < modesReady.length; i++) {
                txt += "`" + modesReady[i] + "`";
                if (i + 1 !== modesReady.length) {
                    txt += " - ";
                }
            }
            txt += "\nhave a mod use `" + prefix + "chooseMode` to choose one";
            message.channel.send(txt);

        }
    },//LIST MODES
    {
        names: ["chooseMode", "cm", "mode"],
        description: "choose a mode",
        usage: "chooseMode",
        DMcom: false,
        TXTcom: false,
        gameGoing: false,
        openPhase: true,
        ModCommand: true,
        FPcommand: false,
        waitTime: 0,
        does: function (words, message, player) {
            var sel = "";
            for (var i = 0; i < modesReady.length; i++) {
                if (words[1].toLowerCase() === modesReady[i].toLowerCase()) {
                    sel = modesReady[i];
                }
            }

            if (sel === "") {
                message.channel.send("Im sorry but that gamemode either:\n1. Doesnt exist\n2. Hasnt been made\n\nplease use `" + prefix + "modeList` to view all current modes")
            } else {
                message.channel.send("Game mode: **" + sel + "** has been chosen");
                gameSettings.mode = sel;
            }
        }
    },//CHOOSE MODE
    {
        names: ["join"],
        description: "join the current game",
        usage: "join",
        DMcom: false,
        TXTcom: false,
        gameGoing: false,
        openPhase: true,
        ModCommand: false,
        FPcommand: false,
        waitTime: 0,
        does: function (words, message, player) {
            if (gameSettings.playing === false) {
                var nickname = message.author.username;
                if (message.guild.members.get("" + message.author.id).nickname != null) {
                    nickname = message.guild.members.get("" + message.author.id).nickname;
                }

                if (players.length !== 0) {
                    if (players.length !== gameSettings.maxPlayers) {
                        var contin = true;
                        for (var plays = 0; plays < players.length; plays++) {
                            if (message.author.id === players[plays].id) {
                                contin = false;
                            }
                        }
                        if (contin) {
                            players.push({
                                username: message.author.username,
                                team: "FFA",
                                name: nickname,
                                kingdom: nickname,
                                id: message.author.id,
                                faction:"none",
                                stuff: null,
                                attackNum: ""
                            });
                        }
                        else {
                            message.reply("You are already in the game");
                        }
                        message.reply("You have joined successfully");
                    }
                    else {
                        message.reply("Im sorry but the game is full.\nOnly `" + gameSettings.maxPlayers + "` players are allowed in one game");
                    }
                }
                else {
                    players.push({
                        username: message.author.username,
                        name: nickname,
                        kingdom: nickname,
                        team: "FFA",
                        faction:"none",
                        id: message.author.id,
                        stuff: null,
                        attackNum: ""
                    });
                    message.reply("You have joined successfully");
                }
            }
            else {
                message.channel.send("Game is currently going please wait for it too finish");
            }
        }
    },//JOIN
    {
        names: ["leave"],
        description: "leave the current game",
        usage: "leave",
        DMcom: false,
        TXTcom: true,
        gameGoing: false,
        openPhase: true,
        ModCommand: true,
        FPcommand: false,
        waitTime: 0,
        does: function (words, message, player) {
            var found = "n"
            for(var i =0;i<players.length;i++){
                if(players[i].id === message.author.id){
                    found = i;
                }
            }
            if(typeof  found === "number"){
                players.splice(found,1);
                message.reply("You succesfully left.");
            }else{
                message.reply("You arent in the current game.")
            }
        }
    },//LEAVE
    {
        names: ["startGame", "start"],
        description: "starts the game",
        usage: "start",
        DMcom: false,
        TXTcom: true,
        gameGoing: false,
        openPhase: true,
        ModCommand: true,
        FPcommand: false,
        waitTime: 0,
        does: function (words, message, player) {
            var txt = "Game Number `" + (gameNumber + 1) + "` Mode: `" + gameSettings.mode + "`\n```";
            var attackNn = "";
            var items = "abcdefghijklmnopqrstuvwxyz";
            if (gameSettings.playing === false) {
                if (players.length >= gameSettings.minimumAmountOfPlayers) {

                    if (gameSettings.teamShareOne === false) {
                        console.log("run");
                        for (var plys = 0; plys < players.length; plys++) {
                            players[plys].stuff = deepClone(theStuff);
                            attackNn = "";
                            for (var num = 0; num < gameSettings.lengthOfCode; num++) {
                                var n = Math.floor(Math.random() * (items.length - 1));
                                attackNn += items[n];
                            }
                            players[plys].attackNum = attackNn;
                        }
                        everyMinTimer = setInterval(everyMin, 60000);
                        gameSettings.playing = true;
                        gameSettings.open = false;
                        message.channel.send("**GAME STARTED**\nGame-Mode: `" + gameSettings.mode + "`");
                        for (var i = 0; i < players.length; i++) {
                            var ran = Math.round(Math.random() * (kingdoms.length-1));
                            players[i].kingdom = kingdoms[ran];
                            txt += "\n#" + (i + 1) + "-" + players[i].name + " - " + players[i].attackNum + " - alive";
                            if(gameSettings.factions){
                                bot.users.get(players[i].id).send("Game has now started!\nPlease use `" + prefix + "help` for more information\nI **HIGHLY** suggest you use `" + prefix + "listFactions` see the factions\nDont forget `"+prefix+"say` allows you to talk in #game-chat");
                            }else {
                                bot.users.get(players[i].id).send("Game has now started!\nPlease use `" + prefix + "help` for more information\n");
                            }
                        }
                    }
                    else if (gameSettings.teamShareOne) {
                        BlueTeam = deepClone(theStuff);
                        RedTeam =deepClone(theStuff);
                         for (var i = 0; i < players.length; i++) {
                            attackNn = "";
                            var ran = Math.round(Math.random() * kingdoms.length);
                            players[i].kingdom = kingdoms[ran];

                            if (Math.round(i / 2) === i / 2) {
                                players[i].team = "red";
                            } else {
                                players[i].team = "blue";
                            }
                            if (players[i].team.toLowerCase() === "red") {
                                players[i].stuff = RedTeam;
                            }
                            else {
                                players[i].stuff = BlueTeam;
                            }

                            for (var num = 0; num < gameSettings.lengthOfCode; num++) {
                                var n = Math.floor(Math.random() * (items.length - 1));
                                attackNn += items[n];
                            }
                            players[i].attackNum = attackNn;

                            txt += "\n#" + (i + 1) + " | " + players[i].name + " | " + players[i].team + " | " + players[i].attackNum;
                            bot.users.get(players[i].id).send("Game has now started!\nPlease use `" + prefix + "help` for more information\nYou are on " + players[i].team + " team\nYour enemys AttackNum is `YMENEMAET`");
                            players[i].stuff.HP += 100;
                        }
                    }
                    for (var i = 0; i < players.length; i++) {
                        message.guild.members.get(players[i].id).addRole(specialIds.playerRole);
                        var found = false;
                        for(var j =0;j<highscores.length;j++){
                            if(highscores[j].id === players[i].id){
                                found = true;
                            }
                        }
                        if(!found){
                            highscores.push({
                                name:players[i].name,
                                id:players[i].id,

                                totWins: 0,
                                totLoses: 0,
                                totPlays: 0,

                                TeamWins: 0,

                                TeamLoses: 0,
                                TeamPlays: 0,

                                FfaWins: 0,
                                FfaLoses: 0,
                                FfaPlays: 0,

                                KthWins: 0,
                                KthLoses: 0,
                                KthPlayes: 0,

                                TKthWins: 0,
                                TKthLoses: 0,
                                TKthPlayes: 0
                            });
                        }
                        if(gameSettings.mode.toLowerCase() === "tkoth"||gameSettings.mode.toLowerCase() === "koth"){
                            bot.users.get(players[i].id).send("To capture the first flag you need to attack the `CENTER`\n`CENTER`'s ATTACK-NUM is `MIDDLE-SPOT`\nWith this mode you need to hold the flag for a total of 10 minutes");
                        }
                    }
                    if (gameSettings.mode.toLowerCase() === "koth" || gameSettings.mode.toLowerCase() === "tkoth") {
                        players.push({
                            username: "MIDDLE",
                            team: "none",
                            name: "flagger",
                            faction:"none",
                            kingdom: "flag",
                            id: "342061552632987648",
                            stuff: deepClone(theStuff),
                            attackNum: "MIDDLE-SPOT"
                        });
                        players[players.length-1].stuff.flag = true;
                        players[players.length-1].stuff.items.gates = 3;
                        players[players.length-1].stuff.items.moats = 1;
                        players[players.length-1].stuff.items.archers = 5;
                        players[players.length-1].stuff.items.moltenIron = 2;
                        players[players.length-1].stuff.items.catapult = 3;
                        players[players.length-1].stuff.items.extraWalls = 1;
                        players[players.length-1].stuff.resources.iron = 30;
                    }

                    bot.channels.get(specialIds.gameLog).send(txt+"```").then(function(m){specialIds.previousMessageInGameLog = m.id;});


                } else {
                    message.reply("There needs to be `" + gameSettings.minimumAmountOfPlayers + "` of players or more to start the game")
                }
            }
            else {
                message.reply("Game is currently going");
            }
        }
    },//START
    {
        names: ["restart"],
        description: "restarts the program",
        usage: "restart",
        DMcom: false,
        TXTcom: true,
        gameGoing: false,
        openPhase: false,
        ModCommand: false,
        FPcommand: true,
        waitTime: 0,
        does: function (words, message, player) {
            message.delete();
            setTimeout(function(){ process.exit(); },1000);
        }
    },//restart program
    {
        names: ["version"],
        description: "tells you what version is running",
        usage: "version",
        DMcom: false,
        TXTcom: true,
        gameGoing: false,
        openPhase: false,
        ModCommand: false,
        FPcommand: false,
        waitTime: 0,
        does: function (words, message, player) {
            message.channel.send("Version: `"+version+"`");
        }
    },//version


    {
        names: ["shop"],
        description: "shows you the shop with everything in it",
        usage: "shop",
        DMcom: true,
        TXTcom: false,
        gameGoing: true,
        openPhase: false,
        ModCommand: false,
        waitTime: 0,
        FPcommand: false,
        does: function (words, message, player) {
            var txt = "**SHOP** (red is unbuyable) (blue is buyable)\n----------------------------------------------------------\n```css\n----OTHER----";
            var difrent = function (txt, w) {
                if (w) {
                    return "#" + txt + "  ";
                } else {
                    return "[" + txt + "]:";
                }
            };
            for (var s = 0; s < 12; s++) {
                var spacing = "";
                for (var spa = 0; spa < "                 ".length - shop[s].name.length; spa++) {
                    spacing += " "
                }

                txt += "\n#" + (s + 1);
                if (s + 1 < 10) {
                    txt += " ";
                }
                txt += "|" + difrent(shop[s].name, canBuy(s, player, 1)) + spacing + " - " + "Stone: " + shop[s].price.stone;

                if (shop[s].price.stone < 10) {
                    txt += " ";
                }
                txt += " Iron: " + shop[s].price.iron;
                if (shop[s].price.iron < 10) {
                    txt += " ";
                }
                txt += " Gold: " + shop[s].price.gold;
                if (shop[s].price.gold < 10) {
                    txt += " ";
                }
                txt += " Food: " + shop[s].price.food;
                if (shop[s].price.food < 10) {
                    txt += " ";
                }
                txt += " Workers: " + shop[s].price.workers;
                if (shop[s].price.workers < 10) {
                    txt += " ";
                }
                txt += " - " + shop[s].description;
                if (s == 7) {
                    txt += "\n----DEFENSE----"
                }
                if (s == 14) {
                    txt += "\n----ATTACK----"
                }
            }
            txt += "```";
            message.channel.send(txt);
            var txt = "```css";
            for (var s = 12; s < shop.length; s++) {
                var spacing = "";
                var price={
                    stone:0,
                    iron:0,
                    gold:0,
                    workers:0,
                    food:0
                };
                price.workers = shop[s].price.workers;
                if(players[player].faction.toLowerCase() === "defenders"&&s>7&&s<15){
                    price.food = Math.round(shop[s].price.food/2);
                    price.stone = Math.round(shop[s].price.stone/2);
                    price.iron = Math.round(shop[s].price.iron/2);
                    price.gold = Math.round(shop[s].price.gold/2);
                }
                else  if(players[player].faction.toLowerCase() === "marketplace"){
                    price.food = Math.round(shop[s].price.food/2);
                    price.stone = Math.round(shop[s].price.stone/2);
                    price.iron = Math.round(shop[s].price.iron/2);
                    price.gold = Math.round(shop[s].price.gold/2);
                }
                else if(players[player].faction.toLowerCase() === "attackers"&&s>=15){
                    price.food = Math.round(shop[s].price.food/2);
                    price.stone = Math.round(shop[s].price.stone/2);
                    price.iron = Math.round(shop[s].price.iron/2);
                    price.gold = Math.round(shop[s].price.gold/2);
                }
                else {
                    price.food = Math.round(shop[s].price.food);
                    price.stone = Math.round(shop[s].price.stone);
                    price.iron = Math.round(shop[s].price.iron);
                    price.gold = Math.round(shop[s].price.gold);
                }
                for (var spa = 0; spa < "                 ".length - shop[s].name.length; spa++) {
                    spacing += " "
                }

                txt += "\n#" + (s + 1);
                if (s + 1 < 10) {
                    txt += " ";
                }
                txt += "|" + difrent(shop[s].name, canBuy(s, player, 1)) + spacing + " - " + "Stone: " + price.stone;

                if (price.stone < 10) {
                    txt += " ";
                }
                txt += " Iron: " + price.iron;
                if (price.iron < 10) {
                    txt += " ";
                }
                txt += " Gold: " + price.gold;
                if (price.gold < 10) {
                    txt += " ";
                }
                txt += " Food: " + price.food;
                if (price.food < 10) {
                    txt += " ";
                }
                txt += " Workers: " + price.workers;
                if (price.workers < 10) {
                    txt += " ";
                }
                txt += " - " + shop[s].description;
                if (s == 7) {
                    txt += "\n----DEFENSE----"
                }
                if (s == 14) {
                    txt += "\n----ATTACK----"
                }
            }
            txt += "```";
            txt += "\n\nTo buy something use `" + prefix + "buy NUM AMOUNT` to buy that item";
            message.channel.send(txt);
        }
    },//SHOP
    {
        names: ["buy"],
        description: "buys the item",
        usage: "buy [NUM] (AMOUNT)",
        DMcom: true,
        TXTcom: false,
        gameGoing: true,
        openPhase: false,
        ModCommand: false,
        FPcommand: false,
        waitTime: 0,
        does: function (words, message, player) {
            var amount = 1;
            var where = "idk";
            if(words[2]!== ""&&words[2]!=null) {
                if (typeof parseInt(words[2], 10) === "number") {
                    amount = parseInt(words[2], 10);
                }
            }
            if (typeof parseInt(words[1], 10) === "number") {
                if (parseInt(words[1], 10) <= shop.length) {
                    where = parseInt(words[1], 10);
                    where--;
                }
            }
            else {
                for (var i = 0; i < shop.length; i++) {
                    if (words[1].toLowerCase() === shop[i].name.toLowerCase()) {
                        where = i;
                    }
                }
            }
            if (typeof where === "number") {
                if (canBuy(where, player, amount)) {
                    switch (where) {
                        case 0:
                            players[player].stuff.items.scouter += amount;
                            break;
                        case 1:
                            players[player].stuff.items.messenger += amount;
                            break;
                        case 2:
                            players[player].stuff.items.farm += amount;
                            break;
                        case 3:
                            players[player].stuff.items.house += amount;
                            break;
                        case 4:
                            players[player].stuff.items.forge += amount;
                            break;
                        case 5:
                            players[player].stuff.items.stoneblockHouse += amount;
                            break;
                        case 6:
                            players[player].stuff.items.barn += amount;
                            break;
                        case 7:
                            players[player].stuff.items.treasury += amount;
                            break;

                        case 8:
                            players[player].stuff.items.antiSpy += amount;
                            break;
                        case 9:
                            players[player].stuff.items.moats += amount;
                            break;
                        case 10:
                            players[player].stuff.items.gates += amount;
                            break;
                        case 11:
                            players[player].stuff.items.archers += amount;
                            break;
                        case 12:
                            players[player].stuff.items.moltenIron += amount;
                            break;
                        case 13:
                            players[player].stuff.items.catapult += amount;
                            break;
                        case 14:
                            players[player].stuff.items.extraWalls += amount;
                            break;
                        case 15:
                            players[player].stuff.items.spy += amount;
                            break;
                        case 16:
                            players[player].stuff.items.spyTraining += amount;
                            break;
                        case 17:
                            players[player].stuff.items.knights += amount;
                            break;
                        case 18:
                            players[player].stuff.items.batteringRam += amount;
                            break;
                        case 19:
                            players[player].stuff.items.bowmen += amount;
                            break;
                        case 20:
                            players[player].stuff.items.chariots += amount;
                            break;
                        case 21:
                            players[player].stuff.items.catapults += amount;
                            break;
                        case 22:
                            players[player].stuff.items.ladderMen += amount;
                            break;
                        default:
                            message.channel.send("Unknown ID! please check again");
                            return;
                        break;
                    }
                    if(players[player].faction.toLowerCase() === "defenders"&&where>7&&where<15){
                        players[player].stuff.resources.stone -= Math.round(shop[where].price.stone * amount/2);
                        players[player].stuff.resources.iron -= Math.round(shop[where].price.iron * amount/2);
                        players[player].stuff.resources.gold -= Math.round(shop[where].price.gold * amount/2);
                        players[player].stuff.resources.workers -= shop[where].price.workers * amount;
                        players[player].stuff.resources.food -= Math.round(shop[where].price.food * amount/2);
                        message.channel.send("Bought: `1` **" + shop[where].name + "**\nResources Spent:```css\n" +
                            "Stone: " + Math.round(shop[where].price.stone * amount/2) + "    Iron: " + Math.round(shop[where].price.iron * amount/2) + "\n" +
                            "Gold:  " + Math.round(shop[where].price.gold * amount/2) + "    Food: " + Math.round(shop[where].price.food * amount/2) + "\n" +
                            "Workers: " + shop[where].price.workers * amount + "```\nPrice was cheaper because of your faction.");
                    }
                    else  if(players[player].faction.toLowerCase() === "marketplace"){
                        players[player].stuff.resources.stone -= Math.round(shop[where].price.stone * amount/2);
                        players[player].stuff.resources.iron -= Math.round(shop[where].price.iron * amount/2);
                        players[player].stuff.resources.gold -= Math.round(shop[where].price.gold * amount/2);
                        players[player].stuff.resources.workers -= shop[where].price.workers * amount;
                        players[player].stuff.resources.food -= Math.round(shop[where].price.food * amount/2);
                        message.channel.send("Bought: `1` **" + shop[where].name + "**\nResources Spent:```css\n" +
                            "Stone: " + Math.round(shop[where].price.stone * amount/2) + "    Iron: " + Math.round(shop[where].price.iron * amount/2) + "\n" +
                            "Gold:  " + Math.round(shop[where].price.gold * amount/2) + "    Food: " + Math.round(shop[where].price.food * amount/2) + "\n" +
                            "Workers: " + shop[where].price.workers * amount + "```\nPrice was cheaper because of your faction.");
                    }
                    else if(players[player].faction.toLowerCase() === "attackers"&&where>=15){
                        players[player].stuff.resources.stone -= Math.round(shop[where].price.stone * amount/2);
                        players[player].stuff.resources.iron -= Math.round(shop[where].price.iron * amount/2);
                        players[player].stuff.resources.gold -= Math.round(shop[where].price.gold * amount/2);
                        players[player].stuff.resources.workers -= shop[where].price.workers * amount;
                        players[player].stuff.resources.food -= Math.round(shop[where].price.food * amount/2);
                        message.channel.send("Bought: `1` **" + shop[where].name + "**\nResources Spent:```css\n" +
                            "Stone: " + Math.round(shop[where].price.stone * amount/2) + "    Iron: " + Math.round(shop[where].price.iron * amount/2) + "\n" +
                            "Gold:  " + Math.round(shop[where].price.gold * amount/2) + "    Food: " + Math.round(shop[where].price.food * amount/2) + "\n" +
                            "Workers: " + shop[where].price.workers * amount + "```\nPrice was cheaper because of your faction.");
                    }
                    else {
                        players[player].stuff.resources.stone -= shop[where].price.stone * amount;
                        players[player].stuff.resources.iron -= shop[where].price.iron * amount;
                        players[player].stuff.resources.gold -= shop[where].price.gold * amount;
                        players[player].stuff.resources.workers -= shop[where].price.workers * amount;
                        players[player].stuff.resources.food -= shop[where].price.food * amount;
                        message.channel.send("Bought: `1` **" + shop[where].name + "**\nResources Spent:```css\n" +
                            "Stone: " + shop[where].price.stone * amount + "    Iron: " + shop[where].price.iron * amount + "\n" +
                            "Gold:  " + shop[where].price.gold * amount + "    Food: " + shop[where].price.food * amount + "\n" +
                            "Workers: " + shop[where].price.workers * amount + "```");
                    }

                }
                else {
                    message.channel.send("You do not have enough resources");
                }
            }
            else {
                message.channel.send("Unknown format. Please try `" + prefix + "help` or `" + prefix + "commands` for more help")
            }
        }
    },//BUY ITEM

    {
        names: ["players", "playersList", "plist"],
        description: "shows all the players in the game",
        usage: "players",
        DMcom: false,
        TXTcom: false,
        gameGoing: false,
        openPhase: false,
        ModCommand: false,
        FPcommand: false,
        waitTime: 0,
        does: function (words, message, player) {
            if (gameSettings.open) {
                var txt = "";
                for (var i = 0; i < players.length; i++) {
                    txt += players[i].name + "\n"
                }
                message.channel.send(txt);
            } else if (gameSettings.playing) {
                var txt = "";
                for (var i = 0; i < players.length; i++) {
                    txt += "#" + (i + 1) + ": " + players[i].kingdom;
                    if (gameSettings.mode.toLowerCase() === "tdm" || gameSettings.mode.toLowerCase() === "tkoth") {
                        txt += " | " + players[i].team;
                    }
                    txt += "\n";
                }
                message.channel.send(txt);
            } else {
                message.channel.send("Game needs to be open or going")
            }
        }
    },//LIST PLAYERS

    {
        names: ["myInfo", "info", "information", "me"],
        description: "shows stuff about you",
        usage: "myInfo",
        DMcom: true,
        TXTcom: false,
        gameGoing: true,
        openPhase: false,
        ModCommand: false,
        waitTime: 0,
        FPcommand: false,
        does: function (words, message, player) {
            var txt = "```css\n|============MY-INFO===========|\n" +
                "|:Kingdom's-Name" + spacing("                ", players[player].kingdom + "|") + players[player].kingdom + "|\n" +
                "|Power" + spacing("                          ", ":" + getPowerLevel(player) + "|") + ":" + getPowerLevel(player) + "|\n" +
                "|HP" + spacing("                             ", ":" + players[player].stuff.HP + "|") + ":" + players[player].stuff.HP + "|\n";
            if(gameSettings.mode.toLowerCase() === "tkoth"||gameSettings.mode.toLowerCase() === "koth"){
           txt+="|Flag Held" + spacing("                      ", ":" + players[player].stuff.timeHeld+"/10|")+":" + players[player].stuff.timeHeld+"/10|\n";
            }
           txt+="|===========RESOURCES==========|\n" +
                "|Stone" + spacing("                          ", ":" + players[player].stuff.resources.stone + "/" + (players[player].stuff.items.stoneblockHouse * 20) + "|") + ":" + players[player].stuff.resources.stone + "/" + (players[player].stuff.items.stoneblockHouse * 20) + "|\n" +
                "|Iron" + spacing("                           ", ":" + players[player].stuff.resources.iron + "/" + (players[player].stuff.items.forge * 10) + "|") + ":" + players[player].stuff.resources.iron + "/" + (players[player].stuff.items.forge * 10) + "|\n" +
                "|Food" + spacing("                           ", ":" + players[player].stuff.resources.food + "/" + (players[player].stuff.items.barn * 20) + "|") + ":" + players[player].stuff.resources.food + "/" + (players[player].stuff.items.barn * 20) + "|\n" +
                "|Gold" + spacing("                           ", ":" + players[player].stuff.resources.gold + "/" + (players[player].stuff.items.treasury * 50) + "|") + ":" + players[player].stuff.resources.gold + "/" + (players[player].stuff.items.treasury * 50) + "|\n" +
                "|Workers" + spacing("                        ", ":" + players[player].stuff.resources.workers + "|") + ":" + players[player].stuff.resources.workers + "|\n" +
                "|People" + spacing("                         ", ":" + players[player].stuff.resources.people + "/" + (players[player].stuff.items.house * 5) + "|") + ":" + players[player].stuff.resources.people + "/" + (players[player].stuff.items.house * 5) + "|\n" +
                "|==============================|";

            txt += "```\n`" + prefix + "myKingdom` for your list of army and defense";
            message.channel.send(txt);

            /*
             ```css
             |========MY-INFO=======|
             |Power             :000|
             |HP                 :00|
             |=======RESOURCES======|
             |Stone              :00|
             |Iron               :00|
             |Food               :00|
             |Gold               :00|
             |Workers            :00|
             |People             :00|
             |=======STORAGE========|
             |Stone              :00|
             |Iron               :00|
             |Food               :00|
             |Gold               :00|
             |People             :00|
             |=========ITEMS========|
             |Farms              :00|
             |Forge              :00|
             |========DEFENSE=======|
             |Extra-Walls        :00|
             |Catapults          :00|
             |========ATTACK========|
             |Knights            :00|
             |Ladder-Men         :00|
             |======================|```
             */
        }
    },//ME
    {
        names: ["myKingdom", "kingdom", "army", "base"],
        description: "shows everything about your military defense/offense",
        usage: "myKingdom",
        DMcom: true,
        TXTcom: false,
        gameGoing: true,
        openPhase: false,
        ModCommand: false,
        waitTime: 0,
        FPcommand: false,
        does: function (words, message, player) {
            var txt = "```css\n|===========MY-KINGDOM=========|\n" +
                "|:Kingdom's-Name" + spacing("                ", players[player].kingdom + "|") + players[player].kingdom + "|\n" +
                "|Power" + spacing("                          ", ":" + getPowerLevel(player) + "|") + ":" + getPowerLevel(player) + "|\n" +
                "|HP" + spacing("                             ", ":" + players[player].stuff.HP + "|") + ":" + players[player].stuff.HP + "|\n" +
                "|=============OTHER============|\n" +
                "|Scouter(s)" + spacing("                     ", ":" + players[player].stuff.items.scouter +"|") + ":" + players[player].stuff.items.scouter +"|\n"+
                "|Messenger(s)" + spacing("                   ", ":" + players[player].stuff.items.scouter +"|") + ":" + players[player].stuff.items.messenger +"|\n"+
                "|House(s)" + spacing("                       ", ":" + players[player].stuff.items.house +"|") + ":" + players[player].stuff.items.house +"|\n"+
                "|Stoneblock-House(s)" + spacing("            ", ":" + players[player].stuff.items.stoneblockHouse +"|") + ":" + players[player].stuff.items.stoneblockHouse +"|\n"+
                "|Forge(s)" + spacing("                       ", ":" + players[player].stuff.items.forge +"|") + ":" + players[player].stuff.items.forge +"|\n"+
                "|Barn(s)" + spacing("                        ", ":" + players[player].stuff.items.barn +"|") + ":" + players[player].stuff.items.barn +"|\n"+
                "|============OFFENSE===========|\n" +
                "|Spy(s)" + spacing("                         ", ":" + players[player].stuff.items.spy + "|") + ":" + players[player].stuff.items.spy + "|\n" +
                "|Spy Training Level" + spacing("             ", ":" + players[player].stuff.items.spyTraining + "|") + ":" + players[player].stuff.items.spyTraining + "|\n" +
                "|Knight(s)" + spacing("                      ", ":" + players[player].stuff.items.knights + "|") + ":" + players[player].stuff.items.knights + "|\n" +
                "|Battering-Ram(s)" + spacing("               ", ":" + players[player].stuff.items.batteringRam + "|") + ":" + players[player].stuff.items.batteringRam + "|\n" +
                "|Bowmen(s)" + spacing("                      ", ":" + players[player].stuff.items.bowmen + "|") + ":" + players[player].stuff.items.bowmen + "|\n" +
                "|Chariots(s)" + spacing("                    ", ":" + players[player].stuff.items.chariots + "|") + ":" + players[player].stuff.items.chariots + "|\n" +
                "|Catapult(s)" + spacing("                    ", ":" + players[player].stuff.items.catapults + "|") + ":" + players[player].stuff.items.catapults + "|\n" +
                "|Ladder-Men(s)" + spacing("                  ", ":" + players[player].stuff.items.ladderMen + "|") + ":" + players[player].stuff.items.ladderMen + "|\n" +
                "|============DEFENSE===========|\n" +
                "|Anti-Spy(s)" + spacing("                    ", ":" + players[player].stuff.items.antiSpy + "|") + ":" + players[player].stuff.items.antiSpy + "|\n" +
                "|Moat(s)" + spacing("                        ", ":" + players[player].stuff.items.moats + "|") + ":" + players[player].stuff.items.moats + "|\n" +
                "|Gate(s)" + spacing("                        ", ":" + players[player].stuff.items.gates + "|") + ":" + players[player].stuff.items.gates + "|\n" +
                "|Archer(s)" + spacing("                      ", ":" + players[player].stuff.items.archers + "|") + ":" + players[player].stuff.items.archers + "|\n" +
                "|Molten-Iron" + spacing("                    ", ":" + players[player].stuff.items.moltenIron + "|") + ":" + players[player].stuff.items.moltenIron + "|\n" +
                "|Catapult(s)" + spacing("                    ", ":" + players[player].stuff.items.catapult + "|") + ":" + players[player].stuff.items.catapult + "|\n" +
                "|Extra-Walls(s)" + spacing("                 ", ":" + players[player].stuff.items.extraWalls + "|") + ":" + players[player].stuff.items.extraWalls + "|\n" +
                "|==============================|";

            txt += "```\n`" + prefix + "myKingdom` for your list of army and defense";
            message.channel.send(txt);

            /*
             ```css
             |========MY-INFO=======|
             |Power             :000|
             |HP                 :00|
             |=======RESOURCES======|
             |Stone              :00|
             |Iron               :00|
             |Food               :00|
             |Gold               :00|
             |Workers            :00|
             |People             :00|
             |=======STORAGE========|
             |Stone              :00|
             |Iron               :00|
             |Food               :00|
             |Gold               :00|
             |People             :00|
             |=========ITEMS========|
             |Farms              :00|
             |Forge              :00|
             |========DEFENSE=======|
             |Extra-Walls        :00|
             |Catapults          :00|
             |========ATTACK========|
             |Knights            :00|
             |Ladder-Men         :00|
             |======================|```
             */
        }
    },//KINGDOM
    {
        names: ["nameMe", "nameKingdom"],
        description: "renames your kingdom",
        usage: "nameMe [NAME]",
        DMcom: true,
        TXTcom: false,
        gameGoing: true,
        openPhase: false,
        ModCommand: false,
        FPcommand: false,
        waitTime: 60,
        does: function (words, message, player) {
            var nam = "";
            for (var i = 1; i < words.length; i++) {
                nam += words[i] + " ";
            }
            if (nam.length >= 15) {
                message.channel.send("Name must be less than 15 digits long")
            }
            else if (nam === "") {
                message.channel.send("Please include what you would like to name your kingdom")
            } else {
                players[player].kingdom = nam.trim();
                message.channel.send("Kingdom's name is now: **" + nam.trim() + "**")
            }
        }
    },//RENAME
    {
        names: ["chooseFaction", "cf", "faction"],
        description: "choose a faction",
        usage: "chooseFaction [FACTION]",
        DMcom: false,
        TXTcom: false,
        gameGoing: true,
        openPhase: false,
        ModCommand: false,
        FPcommand: false,
        waitTime: 0,
        does: function (words, message, player) {
            if(gameSettings.factions) {
                if (players[player].faction === "none") {
                    if (words[1] == null) {
                        message.channel.send("You have to include a faction");
                    } else {
                        var found = 100;
                        for (var i = 0; i < factions.length; i++) {
                            if (words[1].toLowerCase() === factions[i].toLowerCase()) {
                                found = i;
                            }
                        }

                        if (found !== 100) {
                            players[player].faction = factions[found];
                            message.channel.send("Successfully chosen **" + factions[found] + "**");
                        } else {
                            message.channel.send("Unknown faction, please check the spelling,\n`" + prefix + "listFactions`")
                        }
                    }
                } else {
                    message.channel.send("You have already chose one");
                }
            }else{
                message.channel.send("Factions are disabled this game")
            }
        }
    },//CHOOSE FACTION
    {
        names: ["listFactions", "fList"],
        description: "choose a faction",
        usage: "listFactions",
        DMcom: false,
        TXTcom: false,
        gameGoing: false,
        openPhase: false,
        ModCommand: false,
        FPcommand: false,
        waitTime: 0,
        does: function (words, message, player) {
            var txt = "__**FACTIONS**__\n";
            for(var i=0;i<factions.length;i++){
                txt+="`"+factions[i]+"` "
            }
            if(gameSettings.factions&&players[player].faction==="none") {
                txt += "Choose a faction: `" + prefix + "chooseFaction`";
            }
            message.channel.send(txt);
        }
    },//LIST FACTIONS

    {
        names: ["say"],
        description: "talk to everyone ",
        usage: "say [MSG]",
        DMcom: true,
        TXTcom: false,
        gameGoing: true,
        openPhase: false,
        ModCommand: false,
        FPcommand: false,
        waitTime: 0,
        does: function (words, message, player) {
            var msg = "`king of " + players[player].kingdom + " says:` ";
            var badThings = {Name: false, AttackNum: false};
            for (var i = 1; i < words.length; i++) {
                for (var j = 0; j < players.length; j++) {
                    if (words[i].toLowerCase() === players[j].name.toLowerCase() || words[i].toLowerCase() === players[j].username.toLowerCase()) {
                        badThings.Name = true;
                        console.log(players[player].name + " Just tried to share a player's name: " + words[i]);
                    }
                    if (words[i].toLowerCase() === players[j].attackNum.toLowerCase()) {
                        badThings.AttackNum = true;
                        console.log(players[player].name + " Just tried to share a player's attack-num: " + words[i]);
                    }
                }
                msg += words[i] + " ";
            }
            if (badThings.Name) {
                message.channel.send("Names of players are not allowed in messages");
            }
            if (badThings.AttackNum) {
                message.channel.send("You are not allowed to share anyone's ATTACK-NUM(including if they are dead)")
            }
            if (!badThings.AttackNum && !badThings.Name) {
                if (words.length > 1) {
                    bot.channels.get(specialIds.announce).send(msg)
                } else {
                    message.channel.send("You need to include a message")
                }
            }
        }
    },//SAY
    {
        names: ["message", "dm", "sayTo"],
        description: "private message a player",
        usage: "message [ATTACK-NUM] [MSG]",
        DMcom: true,
        TXTcom: false,
        gameGoing: true,
        openPhase: false,
        ModCommand: false,
        FPcommand: false,
        waitTime: 30,
        does: function (words, message, player) {
            if (players[player].stuff.items.messenger > 0) {
                var msg = "`king of " + players[player].kingdom + " says:` ";
                var badThings = {Name: false, AttackNum: false};
                for (var i = 2; i < words.length; i++) {
                    for (var j = 0; j < players.length; j++) {
                        if (words[i].toLowerCase() === players[j].name.toLowerCase() || words[i].toLowerCase() === players[j].username.toLowerCase()) {
                            badThings.Name = true;
                            console.log(players[player].name + " Just tried to share a player's name: " + words[i]);
                        }
                        if (words[i].toLowerCase() === players[j].attackNum.toLowerCase()) {
                            badThings.AttackNum = true;
                            console.log(players[player].name + " Just tried to share a player's attack-num: " + words[i]);
                        }
                    }
                    msg += words[i] + " ";
                }
                var pla = 100;
                for (var i = 0; i < players.length; i++) {
                    if (words[1].toLowerCase() === players[i].attackNum.toLowerCase()) {
                        pla = i;
                    }
                }
                if (badThings.Name) {
                    message.channel.send("Names of players are not allowed in messages");
                }
                if (badThings.AttackNum) {
                    message.channel.send("You are not allowed to share anyone's ATTACK-NUM(including if they are dead)")
                }
                if (!badThings.Name && !badThings.AttackNum) {
                    if (pla !== 100) {
                        message.channel.send("Sent succesfully");
                        bot.users.get(players[pla].id).send("A enemy messenger is here with an message you can:\n`" + prefix + "read` and read the message **AND** let the messenger go free\n`" + prefix + "kill` and kill the messenger and **NOT** read the message\n`" + prefix + "ignore` and ignore the messenger completely\n\nif you do not respond in the next minute the messenger will leave without giving you the message");
                        messengers.push({msg: msg, to: pla, from: player, time: 60});
                        players[player].stuff.items.messenger--;
                    } else {
                        message.channel.send("Invalid ATTACK-NUM");
                    }
                }

            }
            else {
                message.channel.send("You need to have a messenger to send these")
            }
        }
    },//MESSAGE
    {
        names: ["teamChat", "teamC", "tChat", "tSay"],
        description: "private message your team",
        usage: "teanChat [MSG]",
        DMcom: true,
        TXTcom: false,
        gameGoing: true,
        openPhase: false,
        ModCommand: false,
        FPcommand: false,
        waitTime: 30,
        does: function (words, message, player) {
            if (gameSettings.mode.toLowerCase() !== "ffa") {
                var msg = "`king of " + players[player].kingdom + " says:` ";
                var badThings = {Name: false, AttackNum: false};
                for (var i = 2; i < words.length; i++) {
                    for (var j = 0; j < players.length; j++) {
                        if (words[i].toLowerCase() === players[j].name.toLowerCase() || words[i].toLowerCase() === players[j].username.toLowerCase()) {
                            badThings.Name = true;
                            console.log(players[player].name + " Just tried to share a player's name: " + words[i]);
                        }
                        if (words[i].toLowerCase() === players[j].AttackNum.toLowerCase()) {
                            badThings.AttackNum = true;
                            console.log(players[player].name + " Just tried to share a player's attack-num: " + words[i]);
                        }
                    }
                    msg += words[i] + " ";
                }


                if (badThings.Name) {
                    message.channel.send("Names of players are not allowed in messages");
                }
                if (badThings.AttackNum) {
                    message.channel.send("You are not allowed to share anyone's ATTACK-NUM(including if they are dead)")
                }
                if (!badThings.Name && !badThings.AttackNum) {
                    message.channel.send("Sent succesfully");
                    for (var i = 0; i < players.length; i++) {
                        if (i !== player && players[i].team === players[player].team) {
                            bot.users.get(players[i].id).send(msg);
                        }
                    }
                }
            }
            else {
                message.channel.send("The game needs to be in a team game to use this command")
            }
        }
    },//TEAM CHAT

    {
        names: ["mine", "m"],
        description: "mines iron and stone",
        usage: "mine",
        DMcom: true,
        TXTcom: false,
        gameGoing: true,
        openPhase: false,
        ModCommand: false,
        FPcommand: false,
        waitTime: 10,
        does: function (words, message, player) {
            var msg = "In the mining expedition you have Gained:\n```diff";
            var iro = (Math.round(Math.random()) + 1)*(Math.round(players[player].stuff.resources.workers/5)+1);
            var sto = (Math.round(Math.random() * 2) + 3)*(Math.round(players[player].stuff.resources.workers/5)+1);
            msg += "\n+ Stone: " + sto + "\n+ Iron: " + iro;
            players[player].stuff.resources.iron += iro;
            players[player].stuff.resources.stone += sto;
            msg += "```";
            message.channel.send(msg);
            if(players[player].faction.toLowerCase() === "agriculture"){
                message.channel.send("Because of your faction you get double the resources!\ndiff\n+ Stone: "+sto+"\n+ Iron: "+iro);
                players[player].stuff.resources.iron += iro;
                players[player].stuff.resources.stone += sto;
            }
            if(players[player].stuff.resources.stone>players[player].stuff.items.stoneblockHouse*20){
                message.channel.send("Because your stone storages is too full you lost: `"+(players[player].stuff.resources.stone-players[player].stuff.items.stoneblockHouse*20)+"` stone");
                players[player].stuff.resources.stone=players[player].stuff.items.stoneblockHouse*20;
            }
            if(players[player].stuff.resources.iron>players[player].stuff.items.forge*10){
                message.channel.send("Because your iron storages is too full you lost: `"+(players[player].stuff.resources.iron-players[player].stuff.items.forge*10)+"` iron");
                players[player].stuff.resources.iron=players[player].stuff.items.forge*10;
            }
        }
    },//MINE
    {
        names: ["farm", "f"],
        description: "harvests crops and gain food",
        usage: "farm",
        DMcom: true,
        TXTcom: false,
        gameGoing: true,
        openPhase: false,
        ModCommand: false,
        FPcommand: false,
        waitTime: 10,
        does: function (words, message, player) {
            var msg = "In the plantation you have Gained:\n```diff\n";
            var foo = players[player].stuff.items.farm * 5;
            players[player].stuff.resources.food+=foo;
            msg+="+ Food: "+foo;
            msg+="```"
            message.channel.send(msg);
            if(players[player].faction.toLowerCase() === "agriculture"){
                message.channel.send("Because of your faction you get double resources");
                players[player].stuff.resources.food+=foo;
            }
            if(players[player].stuff.resources.food>players[player].stuff.items.barn*20){
                message.channel.send("Because your food storages are too full you lost `"+(players[player].stuff.resources.food-players[player].stuff.items.barn*20)+"` food");
                players[player].stuff.resources.food=players[player].stuff.items.barn*20;
            }

        }
    },//FARM

    {
        names: ["give"],
        description: "give items to someone",
        usage: "give [KINGDOM'S-NAME] [ITEM-NAME] (AMOUNT)",
        DMcom: false,
        TXTcom: false,
        gameGoing: true,
        openPhase: false,
        ModCommand: false,
        FPcommand: true,
        waitTime: 0,
        does: function (words, message, player) {
            var items = [
                {
                    name: "food",
                    does: function (to, from, amo) {
                        if (players[from].stuff.food >= amo) {
                            players[to].stuff.resources.food--;
                            players[to].stuff.resources.food++;
                            bot.users.get(players[to].id).send("Incoming gift from " + players[from].kingdom + "\nHe has given you `" + amo + "`food");
                            return true
                        }
                        else {
                            bot.users.get(players[from].id).send("You do not have any food to give")
                        }
                        return false;
                    }
                }, {
                    name: "gold",
                    does: function (to, from, amo) {
                        if (players[from].stuff.gold >= amo) {
                            players[to].stuff.resources.gold--;
                            players[to].stuff.resources.gold++;
                            bot.users.get(players[to].id).send("Incoming gift from " + players[from].kingdom + "\nHe has given you `" + amo + "`gold");
                            return true
                        }
                        else {
                            bot.users.get(players[from].id).send("You do not have any gold to give")
                        }
                        return false;
                    }
                }, {
                    name: "stone",
                    does: function (to, from, amo) {
                        if (players[from].stuff.stone >= amo) {
                            players[to].stuff.resources.stone--;
                            players[to].stuff.resources.stone++;
                            bot.users.get(players[to].id).send("Incoming gift from " + players[from].kingdom + "\nHe has given you `" + amo + "`stone");
                            return true
                        }
                        else {
                            bot.users.get(players[from].id).send("You do not have any stone to give")
                        }
                        return false;
                    }
                }, {
                    name: "iron",
                    does: function (to, from, amo) {
                        if (players[from].stuff.iron >= amo) {
                            players[to].stuff.resources.iron--;
                            players[to].stuff.resources.iron++;
                            bot.users.get(players[to].id).send("Incoming gift from " + players[from].kingdom + "\nHe has given you `" + amo + "`iron");
                            return true
                        }
                        else {
                            bot.users.get(players[from].id).send("You do not have any iron to give")
                        }
                        return false;
                    }
                }, {
                    name: "workers",
                    does: function (to, from, amo) {
                        if (players[from].stuff.workers >= amo) {
                            players[to].stuff.resources.workers--;
                            players[to].stuff.resources.workers++;
                            players[to].stuff.resources.people--;
                            players[from].stuff.resources.people++;
                            bot.users.get(players[to].id).send("Incoming gift from " + players[from].kingdom + "\nHe has given you `" + amo + "`workers");
                            return true
                        }
                        else {
                            bot.users.get(players[from].id).send("You do not have any workers to give")
                        }
                        return false;
                    }
                }, {
                    name: "archers",
                    does: function (to, from, amo) {
                        if (players[from].stuff.archers >= amo) {
                            players[to].stuff.items.archers--;
                            players[to].stuff.items.archers++;
                            players[to].stuff.resources.people--;
                            players[from].stuff.resources.people++;
                            bot.users.get(players[to].id).send("Incoming gift from " + players[from].kingdom + "\nHe has given you `" + amo + "`archers");
                            return true
                        }
                        else {
                            bot.users.get(players[from].id).send("You do not have any archers to give")
                        }
                        return false;
                    }
                }, {
                    name: "gates",
                    does: function (to, from, amo) {
                        if (players[from].stuff.gates >= amo) {
                            players[to].stuff.items.gates--;
                            players[to].stuff.items.gates++;
                            bot.users.get(players[to].id).send("Incoming gift from " + players[from].kingdom + "\nHe has given you `" + amo + "`gates");
                            return true
                        }
                        else {
                            bot.users.get(players[from].id).send("You do not have any gates to give")
                        }
                        return false;
                    }
                }, {
                    name: "moats",
                    does: function (to, from, amo) {
                        if (players[from].stuff.moats >= amo) {
                            players[to].stuff.items.moats--;
                            players[to].stuff.items.moats++;
                            bot.users.get(players[to].id).send("Incoming gift from " + players[from].kingdom + "\nHe has given you `" + amo + "`moats");
                            return true
                        }
                        else {
                            bot.users.get(players[from].id).send("You do not have any moats to give")
                        }
                        return false;
                    }
                }, {
                    name: "gates",
                    does: function (to, from, amo) {
                        if (players[from].stuff.gates >= amo) {
                            players[to].stuff.items.gates--;
                            players[to].stuff.items.gates++;
                            bot.users.get(players[to].id).send("Incoming gift from " + players[from].kingdom + "\nHe has given you `" + amo + "`gates");
                            return true
                        }
                        else {
                            bot.users.get(players[from].id).send("You do not have any gates to give")
                        }
                        return false;
                    }
                }, {
                    name: "moltenIron",
                    does: function (to, from, amo) {
                        if (players[from].stuff.moltenIron >= amo) {
                            players[to].stuff.items.moltenIron--;
                            players[to].stuff.items.moltenIron++;
                            bot.users.get(players[to].id).send("Incoming gift from " + players[from].kingdom + "\nHe has given you `" + amo + "`moltenIron");
                            return true
                        }
                        else {
                            bot.users.get(players[from].id).send("You do not have any moltenIron to give")
                        }
                        return false;
                    }
                }, {
                    name: "catapult",
                    does: function (to, from, amo) {
                        if (players[from].stuff.catapult >= amo) {
                            players[to].stuff.items.catapult--;
                            players[to].stuff.items.catapult++;
                            bot.users.get(players[to].id).send("Incoming gift from " + players[from].kingdom + "\nHe has given you `" + amo + "`catapult");
                            return true
                        }
                        else {
                            bot.users.get(players[from].id).send("You do not have any catapult to give")
                        }
                        return false;
                    }
                }, {
                    name: "extraWalls",
                    does: function (to, from, amo) {
                        if (players[from].stuff.extraWalls >= amo) {
                            players[to].stuff.items.extraWalls--;
                            players[to].stuff.items.extraWalls++;
                            bot.users.get(players[to].id).send("Incoming gift from " + players[from].kingdom + "\nHe has given you `" + amo + "`extraWalls");
                            return true
                        }
                        else {
                            bot.users.get(players[from].id).send("You do not have any extraWalls to give")
                        }
                        return false;
                    }
                }, {
                    name: "spy",
                    does: function (to, from, amo) {
                        if (players[from].stuff.spy >= amo) {
                            players[to].stuff.items.spy--;
                            players[to].stuff.items.spy++;
                            players[to].stuff.resources.people--;
                            players[from].stuff.resources.people++;
                            bot.users.get(players[to].id).send("Incoming gift from " + players[from].kingdom + "\nHe has given you `" + amo + "`spy");
                            return true
                        }
                        else {
                            bot.users.get(players[from].id).send("You do not have any spy to give")
                        }
                        return false;
                    }
                }, {
                    name: "spyTraining",
                    does: function (to, from, amo) {
                        if (players[from].stuff.spyTraining >= amo) {
                            players[to].stuff.items.spyTraining--;
                            players[to].stuff.items.spyTraining++;
                            players[to].stuff.resources.people--;
                            players[from].stuff.resources.people++;
                            bot.users.get(players[to].id).send("Incoming gift from " + players[from].kingdom + "\nHe has given you `" + amo + "`spyTraining");
                            return true
                        }
                        else {
                            bot.users.get(players[from].id).send("You do not have any spyTraining to give")
                        }
                        return false;
                    }
                }, {
                    name: "knights",
                    does: function (to, from, amo) {
                        if (players[from].stuff.knights >= amo) {
                            players[to].stuff.items.knights--;
                            players[to].stuff.items.knights++;
                            players[to].stuff.resources.people--;
                            players[from].stuff.resources.people++;
                            bot.users.get(players[to].id).send("Incoming gift from " + players[from].kingdom + "\nHe has given you `" + amo + "`knights");
                            return true
                        }
                        else {
                            bot.users.get(players[from].id).send("You do not have any knights to give")
                        }
                        return false;
                    }
                }, {
                    name: "batteringRam",
                    does: function (to, from, amo) {
                        if (players[from].stuff.batteringRam >= amo) {
                            players[to].stuff.items.batteringRam--;
                            players[to].stuff.items.batteringRam++;
                            bot.users.get(players[to].id).send("Incoming gift from " + players[from].kingdom + "\nHe has given you `" + amo + "`batteringRam");
                            return true
                        }
                        else {
                            bot.users.get(players[from].id).send("You do not have any batteringRam to give")
                        }
                        return false;
                    }
                }, {
                    name: "bowmen",
                    does: function (to, from, amo) {
                        if (players[from].stuff.bowmen >= amo) {
                            players[to].stuff.items.bowmen--;
                            players[to].stuff.items.bowmen++;
                            players[to].stuff.resources.people--;
                            players[from].stuff.resources.people++;
                            bot.users.get(players[to].id).send("Incoming gift from " + players[from].kingdom + "\nHe has given you `" + amo + "`bowmen");
                            return true
                        }
                        else {
                            bot.users.get(players[from].id).send("You do not have any bowmen to give")
                        }
                        return false;
                    }
                }, {
                    name: "chariots",
                    does: function (to, from, amo) {
                        if (players[from].stuff.chariots >= amo) {
                            players[to].stuff.items.chariots--;
                            players[to].stuff.items.chariots++;
                            bot.users.get(players[to].id).send("Incoming gift from " + players[from].kingdom + "\nHe has given you `" + amo + "`chariots");
                            return true
                        }
                        else {
                            bot.users.get(players[from].id).send("You do not have any chariots to give")
                        }
                        return false;
                    }
                }, {
                    name: "catapukts",
                    does: function (to, from, amo) {
                        if (players[from].stuff.catapukts >= amo) {
                            players[to].stuff.items.catapukts--;
                            players[to].stuff.items.catapukts++;
                            bot.users.get(players[to].id).send("Incoming gift from " + players[from].kingdom + "\nHe has given you `" + amo + "`catapukts");
                            return true
                        }
                        else {
                            bot.users.get(players[from].id).send("You do not have any catapukts to give")
                        }
                        return false;
                    }
                }, {
                    name: "ladderMen",
                    does: function (to, from, amo) {
                        if (players[from].stuff.ladderMen >= amo) {
                            players[to].stuff.items.ladderMen--;
                            players[to].stuff.items.ladderMen++;
                            players[to].stuff.resources.people--;
                            players[from].stuff.resources.people++;
                            bot.users.get(players[to].id).send("Incoming gift from " + players[from].kingdom + "\nHe has given you `" + amo + "`ladderMen");
                            return true
                        }
                        else {
                            bot.users.get(players[from].id).send("You do not have any ladderMen to give")
                        }
                        return false;
                    }
                },];


            var closeTo = function (msg) {
                var txts = [];
                for (var i = 0; i < items.length; i++) {
                    if (msg[0].toLowerCase() === items[i].name[0].toLowerCase() && msg[1].toLowerCase() === items[i].name[1].toLowerCase() && msg[2].toLowerCase() === items[i].name[2].toLowerCase()) {
                        txts += items[i].name
                    }
                }
                if (txts[0] == null) {
                    for (var i = 0; i < items.length; i++) {
                        if (msg[0].toLowerCase() === items[i].name[0].toLowerCase() && msg[1].toLowerCase() === items[i].name[1].toLowerCase()) {
                            txts += items[i].name
                        }
                    }
                }
                if (txts[0] == null) {
                    for (var i = 0; i < items.length; i++) {
                        if (msg[0].toLowerCase() === items[i].name[0].toLowerCase()) {
                            txts += items[i].name
                        }
                    }
                }
                return txts;
            };
            var amount = 1;
            var where = "idk";
            var to;
            var howMany = 0;
            for (var i = 0; i < players.length; i++) {
                if (players[i].kingdom.toLowerCase() === words[1].toLowerCase()) {
                    howMany++;
                    to = i;
                }
            }

            var which = 100;

            var amount = 1;
            if (howMany === 1) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].name.toLowerCase() === words[2].toLowerCase()) {
                        which = i;
                    }
                }
                if (which === 100) {
                    var txts = closeTo(words[2]);
                    var txt = "";
                    for (var i = 0; i < txts.length; i++) {
                        txt += "`" + txts[i] + "` ";
                    }
                    if (txt === "") {
                        message.channel.send("Unknown item, please check the spelling");
                    } else {
                        message.channel.send("Unknown item, Was it one of:\n" + txt);
                    }
                }
                else {
                    if (words[3] != null) {
                        if (typeof parseInt(words[3], 10) === "number") {
                            amount = parseInt(words[3], 10);
                        }
                    }
                }
            }
            else if (howMany === 0) {
                message.channel.send("Kingdom was not found!");
            }
            else {
                message.channel.send(howMany + " players has that name as their kingdom, please ask whoever you are trying to donate to, to change thier kingdoms name");
            }

            if (to != null && which !== 100) {
                if (items[which].does(to, player, amount)) {
                    message.channel.send("Successfully traded!");
                }
            }
        }
    },//give

    {
        names: ["spy"],
        description: "spy on a certain player",
        usage: "spy [PLAYER'S-ATTACK-NUM]",
        DMcom: false,
        TXTcom: false,
        gameGoing: true,
        openPhase: false,
        ModCommand: false,
        FPcommand: false,
        waitTime: 60,
        does: function (words, message, player) {
            if (players[player].stuff.items.spy > 0) {
                var pla = 100;
                for (var i = 0; i < players.length; i++) {
                    if (players[i].attackNum.toLowerCase() === words[1].toLowerCase()) {
                        pla = i;
                    }
                }
                if (pla === player) {
                    message.channel.send("CONGRATULATIONS you know your ATTACK-NUM, sadly you cant spy on yourself")
                }
                else if ((gameSettings.mode.toLowerCase() === "tdm" || gameSettings.mode.toLowerCase() === "tkoth") && players[pla].team === players[player].team) {
                    message.channen.send("You arent allowed to spy on your teammates")
                }
                else if (pla !== 100) {
                    message.channel.send("Your spy/spies are on the way, please wait `15` seconds for them to reach thier destination");
                    var spy = function(words,message,player,pla){
                        if(!players.length){
                            console.log("go");
                            return;
                        }
                        var success = false;
                        var chance = Math.round(Math.random() * 10);
                        var n = 0 - players[pla].stuff.items.antiSpy + players[player].stuff.items.spyTraining + Math.round(players[player].stuff.items.spy / 2);
                        chance += n;
                        if (chance > 5) {
                            success = true;
                        }
                        if(players[player].faction.toLowerCase() === "attackers"||players[player].faction.toLowerCase() === "lucky"){
                            if(chance >3){
                                success = true;
                            }
                        }
                        if(players[pla].faction.toLowerCase() === "lucky"){
                            chance -= 5;
                        }
                        if (success) {
                            message.channel.send("Your spy/spies has returned! Their mission was a success!");
                            var txt = "```diff\n!==== [Enemy's Details] ====!";
                            txt += "\n+ Kingdom:" + players[pla].kingdom;
                            txt += "\n+ HP     :" + players[pla].stuff.HP;
                            txt += "\n+ Power  :" + getPowerLevel(pla);
                            if(gameSettings.factions) {
                                txt += "\n+ Faction:" + players[pla].faction;
                            }
                            txt += "\n!==== [Enemy's Defense] ====!";
                            var item = players[pla].stuff.items;
                            if (item.antiSpy > 0) {
                                txt += "\n- Anti-Spy   :" + item.antiSpy;
                            }
                            if (item.moats > 0) {
                                txt += "\n- Moats      :" + item.moats;
                            }
                            if (item.gates > 0) {
                                txt += "\n- Gates      :" + item.gates;
                            }
                            if (item.archers > 0) {
                                txt += "\n- Archers    :" + item.archers;
                            }
                            if (item.moltenIron > 0) {
                                txt += "\n- Molten-Iron:" + item.moltenIron;
                            }
                            if (item.catapult > 0) {
                                txt += "\n- Catapults  :" + item.catapult;
                            }
                            if (item.extraWalls > 0) {
                                txt += "\n- Extra-Walls:" + item.extraWalls;
                            }
                            if (txt[txt.length - 2] === "=") {
                                txt += "\nYour enemy has no defense"
                            }
                            txt += "\n!===========================!```";
                            message.channel.send(txt);
                            bot.users.get(players[pla].id).send("Your kingdom just saw enemy spies leaving your kingdom\n**BEWARE** someone now knows your defense");

                        }
                        else {
                            if (players[player].stuff.items.spy > 1) {
                                players[player].stuff.items.spy -= Math.round(players[player].stuff.items.spy / 2);
                                players[player].stuff.resources.people -= Math.round(players[player].stuff.items.spy / 2);
                                message.channel.send(Math.round(players[player].stuff.items.spy / 2) + " of your spys has been captured.\nMission has failed");
                            }
                            else {
                                message.channel.send("Your spy has been captured\nMission has failed");
                            }
                            var p = Math.round(Math.random() * 10);

                            if(players[pla].faction.toLowerCase() === "lucky"||players[pla].faction.toLowerCase() === "defenders"){
                                p+=3;
                            }
                            if(players[player].faction.toLowerCase() === "lucky"){
                                p+=3;
                            }
                            if (p > 8) {
                                message.channel.send("You have been informed that not only your spies failed, but the ones captured gave up your information");
                                bot.users.get(players[pla].id).send("You have found enemy spies in your kingdom\nAfter much interrogation you get some information\n``css\n[ENEMY'S DETAILS]\nkingdom: " + players[player].kingdom + "\nPower: " + getPowerLevel(player) + "\nAttack-Num: " + players[player].attackNum + "```");
                            }
                            else {
                                bot.users.get(players[pla].id).send("You have found enemy spies in your kingdom\nThe spies committed suicide before you got a chance to interrogate them");
                            }
                        }
                    };
                    setTimeout(function(){
                      spy(words,message,player,pla);
                    },15000);

                }
                else {
                    message.channel.send("`ATTACK-NUM` invalid, please make sure you have it spelt correctly")
                }
            }
            else {
                message.channel.send("You need to own a `SPY` before you can spy")
            }
        }
    },//SPY
    {
        names: ["attack"],
        description: "attacks a player",
        usage: "attack [ATTACK-NUM]",
        DMcom: true,
        TXTcom: false,
        gameGoing: true,
        openPhase: false,
        ModCommand: false,
        FPcommand: false,
        waitTime: 90,
        does: function (words, message, player) {
            var pla = 100;
            for (var i = 0; i < players.length; i++) {
                if (players[i].attackNum.toLowerCase() === words[1].toLowerCase()) {
                    pla = i;
                }
            }

            if (pla === player) {
                message.channel.send("CONGRATULATIONS you know your ATTACK-NUM, sadly you cant attack yourself");
                console.log("Player: " + players[player].name + " has found his attack-num")
            }
            else if (players[pla].team === players[player].team && gameSettings.mode.toLowerCase() !== "ffa"&& gameSettings.mode.toLowerCase() !== "koth") {
                message.channel.send("You are not allowed to attack your team")
            }
            else if (pla !== 100) {
                message.channel.send("Attack is sent. Marching time: `1` minutes");
                bot.users.get(players[pla].id).send("You are under attack by the kingdom of `" + players[player].kingdom + "` You have 1 minute to prepare");
                setTimeout(function () {
                    console.log("attacking Started");
                    attackPlayer(player, pla);
                }, 60000);
            }
            else {
                message.channel.send("ATTACK-NUM is invalid.\nPlease check your spelling or buy a scouter to find you a valid ATTACK-NUM")
            }
        }
    },//ATTACK

    {
        names: ["purge"],
        description: "purge an amount of messages frome the channel",
        usage: "purge [AMOUNT]",
        DMcom: false,
        TXTcom: false,
        gameGoing: false,
        openPhase: false,
        ModCommand: false,
        FPcommand: true,
        waitTime: 0,
        does: function (words, message, player) {
            var amo = 0;
            if(words[1]==null){
                message.channel.send("Purged the default 50");
                amo = 50;
            }else{
                if(typeof parseInt(words[1],10) === "number"){
                    message.channel.send("Purged `"+words[1]+"` messages");
                    amo = parseInt(words[1],10);
                }
                else{
                    message.channel.send("Unknown amount, Purging 10");
                    amo = 10;
                }
            }
            purgeMessages(message.channel,(amo+2));
        }
    },//purge

    {
        names: ["record","stats","records"],
        description: "Gives you the player's record",
        usage: "record [@PLAYER]",
        DMcom: false,
        TXTcom: false,
        gameGoing: false,
        openPhase: false,
        ModCommand: false,
        FPcommand: false,
        waitTime: 0,
        does: function (words, message, player) {
            if(words[1] != null){
                if(words[1][0]==="<"&&words[1][1]==="@"&&words[1][2]==="!"&&(typeof parseInt(words[1][3])==="number")){
                    var id = "";
                    for(var i =3;i<words[1].length-1;i++){
                        id+=words[1][i];
                    }
                    var pla="none";
                    for(var i=0;i<highscores.length;i++){
                        if(id===highscores[i].id){
                            pla = i;
                        }
                    }
                    if(typeof  pla === "number"){
                        message.channel.send("", {
                            embed: {
                                color: 0x00C8C8,
                                title: highscores[pla].name,
                                description:"This is `"+highscores[pla].name+"`'s score\naverage rating will be implemented",
                                fields: [
                                    {
                                        name: 'Total',
                                        value: '```css\nGames: '+highscores[pla].totPlays+"\nWins:  "+highscores[pla].totWins+"\nLoses: "+highscores[pla].totLoses+"```"
                                    },{
                                        name: 'FFA',
                                        value: '```css\nGames: '+highscores[pla].FfaPlays+"\nWins:  "+highscores[pla].FfaWins+"\nLoses: "+highscores[pla].FfaLoses+"```"
                                    },{
                                        name: 'TDM',
                                        value: '```css\nGames: '+highscores[pla].TeamPlays+"\nWins:  "+highscores[pla].TeamWins+"\nLoses: "+highscores[pla].TeamLoses+"```"
                                    },{
                                        name: 'TKOTH',
                                        value: '```css\nGames: '+highscores[pla].TKthPlayes+"\nWins:  "+highscores[pla].TKthWins+"\nLoses: "+highscores[pla].TKthLoses+"```"
                                    },{
                                        name: 'KOTH',
                                        value: '```css\nGames: '+highscores[pla].KthPlayes+"\nWins:  "+highscores[pla].KthWins+"\nLoses: "+highscores[pla].KthLoses+"```"
                                    }
                                ],
                                footer: {
                                    text: '©FrustratedProgrammer'
                                }
                            }
                        })
                    }
                    else{
                        message.channel.send("That player hasnt played any games yet");
                    }
                }else{
                    message.channel.send("That isnt a player")
                }
            }
            else{
                message.channel.send("You have to include a player")
            }
        }
    },//leaderboard

    //TODO: sell items/exchange gold for resources
];

bot.on("guildCreate", function (guild) {
    console.log("Just Joined \"" + guild.name + "\"\nID: " + guild.id);
    guild.defaultChannel.send(":wave:\nhey this bot doesnt yet support multiple servers :) i suggest joining: `https://discord.gg/ZCZ4sf5` to play me");
});
var checkWaitTimes = function (re, nam, pla) {
    for (var q = 0; q < waitTimes.length; q++) {
        if (waitTimes[q][0] == nam && waitTimes[q][1] === pla) {
            if (re === false) {
                return true;
            } else {
                return waitTimes[q][2]
            }
        }
    }
    return false;
};
var checkForMod = function (mess) {
    var is = false;
    var guild = bot.guilds.get(specialIds.server);
    var person = guild.members.get(mess.author.id);

    if(person!=null) {

        for (var i = 0; i < specialIds.mods.length; i++) {
            if ("" + mess.author.id === specialIds.mods[i]) {
                is = true;
            }
        }
        for (var i = 0; i < specialIds.modRoles.length; i++) {
            if (person  .roles.has(specialIds.modRoles[i])) {
                is = true;
            }
        }
    }
    return is;
};
bot.on("message", function (message) {
    var allowed = true;
    if (message.channel.type === "text") {
        if (message.guild.id !== specialIds.server) {
            allowed = false;
        }
    }
    if (allowed&&!message.author.bot) {
        if (messengers.length > 0) {
            for (var i = 0; i < messengers.length; i++) {
                if (players[messengers[i].to].id === message.author.id) {
                    if (message.content.toLowerCase() === defaultPrefix + "ignore" || message.content.toLowerCase() === prefix + "ignore") {
                        message.channel.send("Messenger ignored.");
                        bot.users.get(players[messengers[i].from].id).send("Your messenger was ignored");
                        players[messengers[i].from].stuff.items.messenger++;
                        messengers.splice(i, 1);
                    }
                    if (message.content.toLowerCase() === defaultPrefix + "kill" || message.content.toLowerCase() === prefix + "kill") {
                        message.channel.send("Messenger ignored.");
                        bot.users.get(players[messengers[i].from].id).send("Your messenger was killed");
                        messengers.splice(i, 1);
                    }
                    if (message.content.toLowerCase() === defaultPrefix + "read" || message.content.toLowerCase() === prefix + "read") {
                        message.channel.send("The message read:\n\n" + messengers[i].msg);
                        bot.users.get(players[messengers[i].from].id).send("Your messenger sent the message successfully");
                        players[messengers[i].from].stuff.items.messenger++;
                        messengers.splice(i, 1);
                    }
                }
            }
        }
        var guild = bot.guilds.get(specialIds.server);
        var person = guild.members.get(message.author.id);
        if(person){
            if (person.roles.has(specialIds.watchOver)) {
                var nickname = message.author.username;
                if (guild.members.get("" + message.author.id).nickname != null) {
                    nickname = guild.members.get("" + message.author.id).nickname;
                }
                bot.channels.get(specialIds.tattleTale).send(nickname+":  `"+message.content+"`");
            }
        }

        var word = 0;
        var words = [""];
        for (var w = 0; w < message.content.length; w++) {
            if (message.content[w] === " ") {
                word++;
                words[word] = "";
            }
            else {
                words[word] += message.content[w];
            }
        }
        var allowedToSend = true;
        if (message.channel.type === "text" && message.author.id !== "332286067828981760") {
            for (var serv = 0; serv < specialIds.dontSend.length; serv++) {
                if (message.channel.id == specialIds.dontSend[serv]) {
                    allowedToSend = false;
                    break;
                }
            }
        }
        for (var i = 0; i < words.length; i++) {
            for (var j = 0; j < censoredWords.length; j++) {
                if (words[i].toLowerCase() === censoredWords[j].toLowerCase()) {
                    if(message.channel.type === "text"||((words[0]===prefix+"say"||words[0]===defaultPrefix+"say")||(words[0]===prefix+"message"||words[0]===defaultPrefix+"message"))) {
                        allowedToSend = false;
                        console.log(message.author.username + " has just tried saying: " + words[i]);
                        message.delete();
                        message.reply("Please refrain from using bad language\nThis has been reported to my owner");
                        setTimeout(function () {
                            message.reply("Message from my owner: ```\nPlease dont use bad language, and dont even TRY saying it with d-a-s-h-e-s or U_n_d_e_r_s_c_o_r_e_s or anything else, you have been assign the \"watch over\" role , my bot will now write in a separate channel EVERYTHING you send, i review all the messages once a day, and i can/will ban you if you try this again```");
                            var guild = bot.guilds.get(specialIds.server);
                            guild.members.get(message.author.id).addRole(specialIds.watchOver);

                        }, 10000);
                    }
                }
            }
        }
        if (allowedToSend && message.author.id !== "332286067828981760") {

            var pla = null;
            if (gameSettings.playing) {
                for (var p = 0; p < players.length; p++) {
                    if (players[p].id === message.author.id) {
                        pla = p;
                    }
                }
            }
            for (var i = 0; i < commands.length; i++) {
                for (var j = 0; j < commands[i].names.length; j++) {
                    if (words[0].toLowerCase() === defaultPrefix + commands[i].names[j].toLowerCase() || words[0].toLowerCase() === prefix + commands[i].names[j].toLowerCase()) {
                        if (gameSettings.playing && commands[i].gameGoing && pla == null) {
                            message.channel.send("You need to be in the game to play");
                        } else if (commands[i].DMcom && message.channel.type !== "dm") {
                            message.channel.send("That needs to be sent in DM");
                        } else if (commands[i].TXTcom && message.channel.type !== "text") {
                            message.channel.send("That needs to sent in a server's channel");
                        } else if (commands[i].FPcommand && message.author.id !== "244590122811523082") {
                            message.channel.send("Only my creator Frustrated Programmer can use that");
                        } else if (commands[i].ModCommand && checkForMod(message) === false) {
                            message.channel.send("You need to be a mod/admin");
                        } else if (commands[i].gameGoing && gameSettings.playing !== true) {
                            message.channel.send("Game needs to be going");
                        } else if (commands[i].openPhase && gameSettings.open !== true) {
                            message.channel.send("Game needs to be open to joining");
                        } else if (commands[i].waitTime > 0 && checkWaitTimes(false, commands[i].names[0], pla)) {
                            message.channel.send("You need to wait `" + checkWaitTimes(true, commands[i].names[0], pla) + "` seconds")
                        } else {
                            commands[i].does(words, message, pla);
                            if (commands[i].waitTime > 0) {
                                waitTimes.push([commands[i].names[0], pla, commands[i].waitTime])
                            }
                        }
                    }
                }
            }
        }

        if ((messengers.length > 0 || waitTimes.length > 0) && everySecTimer === false) {
            everySecTimer = setInterval(everySec, 1000);
        }
    }
    else if(!message.author.bot){
        message.author.send("Sorry that server isnt supported\nJoin https://discord.gg/ZCZ4sf5");
    }

});
bot.on("guildMemberAdd",function(member){
   member.send("Welcome to the Castlers server!\nDiscord ToS (Terms Of Service) has made a rule that I must have permission to store your info.\nIn using this bot you are giving me permission to store your: `Username`, `Nickname` and `ID`, __none will be shared__");
});

var tok = require("./config.json");
bot.login(tok.token);