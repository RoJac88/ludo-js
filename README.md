# Ludo-js
A simple game of Ludo implemented in vanilla js without dependencies. The game runs 100% locally in the browser. Play vs the BOT, the RANDOM or other fellow humans.

![Ludo GIF](https://media.giphy.com/media/WONKdmkAj0dMUwGbBN/giphy.gif)

## Demo
http://ludo-js.surge.sh

## Rules of the Game
Or the rules of Ludo as understood by the developer:
+ On each turn one player rolls the dice. If any of his tokens can move, the player selects a token to move the amount of spaces indicated by the dice.
+ Tokens in the starting position (yard) can only move if the dice is a six.
+ Tokens cannot move to squares occupied by tokens of the same color.
+ If a token moves to a square occupied by an enemy token, the enemy token is captured and returns to its yard.
+ Players that roll a six get an additional dice roll, unless its a third six in a row. Players who role a third six in a row cannot move and lose their turn.
+ The game is won by the player who reaches the final square with all four tokens.

These are the rules implemented in the game. They may or may not be 100% accurate (probably not accurate at all). 
 
 ## How to play
To play the game enter a player name in the starting form. 

Bots are any players named BOT, HAL or RANDOM. Bots named RANDOM pick tokens randomdly (mind = blown) and play at a faster pace. Players with any other name are considered human players. 

It is possible to intercept the move of any BOT by clicking the button before the BOT does. 
