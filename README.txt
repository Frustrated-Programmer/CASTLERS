everyone starts with a castle...
nobody knows where each other is
you start off with a ATTACK-NUM that is unknown to you. ex: "1759".

and you dont know where YOU are to prevent gamethrowing(telling people where you are so they dont have to buy SCOUTER)

persons are everyone/workers/spys/knights etc
workers are persons that get STONE,GOLD,IRON



----STARTS-OUT-WITH------
01 farm
01 house
20 stone storage
10 iron storage
50 gold storage
50 food storage
05 workers
25 food
25 gold
05 iron
10 stone


----AUTO-GET-EVERY-20-SECS----
0.5 stone per sec per worker
1 gold per sec per worker
0.1 iron per sec per worker
10 food per sec per farm
-2 food per sec per person
1 worker per minute IF theres room

----MAX RESOURCES----
20 stone at start and 20 per stoneblock house
50 gold at start and 50 per treasury
10 iron at start and 10 per forge
50 food at start and 20 per barn

-----ITEMS--------------------------------------------------------COST-----------------------------------------------------------------------------------------POWER---------
SCOUTER: looks for castles                          : 05 stone : 01 gold : 01 iron : 00 food : 01 worker :                                                 : 1 power
MESSENGER: allows you to talk to other players      : 00 stone : 05 gold : 05 iron : 00 food : 01 worker : (CAN BE KILLED)                                 : 1 power
FARM: gives 10 food                                 : 10 stone : 20 gold : 01 iron : 00 food : 00 worker :                                                 : 1 power
HOUSE: houses 5 workers                             : 10 stone : 10 gold : 05 iron : 00 food : 00 worker : (DOUBLES IN PRICE PER PURCHASE)                 : 2 power
FORGE: gives 10 more iron storage                   : 00 stone : 00 gold : 10 iron : 00 food : 00 worker : (DOUBLES IN PRICE PER PURCHASE)                 : 2 power
STONEBLOCK-HOUSE: gives 20 more stone storage       : 20 stone : 00 gold : 00 iron : 00 food : 00 worker : (DOUBLES IN PRICE PER PURCHASE)                 : 2 power
BARN: gives 20 more food storage                    : 20 stone : 20 gold : 05 iron : 00 food : 00 worker : (DOUBLES IN PRICE PER PURCHASE)                 : 2 power
TREASURY: gives 50 more gold storage                : 00 stone : 50 gold : 00 iron : 00 food : 00 worker : (DOUBLES IN PRICE PER PURCHASE)                 : 2 power

ANTI-SPY: chance of catching enemy spy 5%           : 00 stone : 10 gold : 05 iron : 10 food : 01 worker :                                                 : 1 power
MOATS: raises defense by 1                          : 20 stone : 00 gold : 10 iron : 00 food : 00 worker :                                                 : 2 power
GATES: raises defense by 2                          : 20 stone : 20 gold : 05 iron : 00 food : 00 worker :                                                 : 3 power
ARCHERS: raises defense by 3                        : 00 stone : 30 gold : 05 iron : 00 food : 01 worker :                                                 : 4 power
MOLTEN-IRON: raises defense by 6                    : 10 stone : 20 gold : 05 iron : 00 food : 00 worker : (refill needed of 2 iron) (1 use per refill)    : 4 power
CATAPULT: raises defense by 4                       : 10 stone : 10 gold : 20 iron : 00 food : 00 worker :                                                 : 4 power
EXTRA-WALLS: raises defense by 5                    : 30 stone : 50 gold : 20 iron : 00 food : 00 worker :                                                 : 5 power

SPY: allows you to see other players defenses       : 10 stone : 10 gold : 05 iron : 00 food : 01 worker : (CAN BE KILLED)                                 : 3 power
SPY-TRAINING: chance of a success spy by 5%         : 00 stone : 10 gold : 10 iron : 00 food : 00 worker :                                                 : 1 power
KNIGHTS: raises attack power by 1                   : 10 stone : 00 gold : 10 iron : 00 food : 01 worker :                                                 : 2 power
BATTERING-RAM: raises attack power by 3             : 15 stone : 20 gold : 05 iron : 00 food : 00 worker :(enemy needs EXTRA-WALLS or DRAWBRIDGE)          : 2 power
BOWMEN: raises attack power by 4                    : 15 stone : 10 gold : 10 iron : 00 food : 01 worker :(enemy needs EXTRA-WALLS or MOATS or DRAWBRIDGES): 3 power
CHARIOTS: raises attack power by 3                  : 20 stone : 10 gold : 10 iron : 20 food : 00 worker :                                                 : 3 power
CATAPULTS: raises attack power by 4                 : 20 stone : 30 gold : 05 iron : 00 food : 00 worker :                                                 : 4 power
LADDER-MEN: neutralizes a EXTRA-WALLS per LADDER-MEN: 30 stone : 50 gold : 20 iron : 00 food : 01 worker :                                                 : 5 power


---------------OTHER---------------
SCOUTER has a 1/10 chance of finding a castle every minute
when he has found one he will report
NAME, POWER, ATTACK-NUM,

MESSENGERS will allow you to send message to another player
the player that recives the message has a choice of:
killing the messenger and not reading the message
or read the message and let the messenger go.
IF all the FOOD is eaten up before all PEOPLE are fed 1 WORKERS die per minute until all the workers are fed


-------------ATTACKING----------------
"attack ATTACK-NUM"
if the ATTACK-NUM is valid, DEFENDER is notified
and the ATTACKER starts MARCHING (1 min wait time)
when the ATTACKER arrives at the DEFENDER they have a 1 min to discuss the situation
ATTACKER may decide to call off the DISCUSSION-PHASE and doubles TIME to attack/return
ATTACKER may call off the attack at any time during the wait time or DISCUSSION-PHASE
during the DISCUSSION-PHASE both players may not buy anything
after DISCUSSION-PHASE battle commences ATTACKER may not call off the attack now
after the battle is over:

IF ATTACKER wins:
defender is kicked out of the game (ALL PLAYERS ARE NOTIFIED) (PLAYERS ARE NOTIFIED ATTACKERS:Name,Power)
ATTACKER gains ALL of DEFENDERS resources
ATTACKER's power is re-checked then he gained 10+ power

IF DEFENDER wins:
ATTACKER loses all his troops
ATTACKERS & DEFENDER's power is re-checked
DEFENDER gains + 25 power


------OTHER-IDEA----
add resource WOOD: PERKS: more stuff to buy, makes sense with the items. CONS: player is getting more resources by the minute, game can get a tad bit more complicated
add FACTIONS: PERKS: players can join diffrent factions to get bonuses is resources/attack power/defences makes the game a tad bit more stragetic CONS: game gets too complicated for some players
add MODES: team attack, ffa, king of the hill, PERKS: game becomes more fun, CONS: hard to implement