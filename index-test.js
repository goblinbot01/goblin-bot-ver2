// Constants, variables and functions
const ffmpeg = require('ffmpeg')
const Discord = require('discord.js');
const client = new Discord.Client();
const YTDL = require('ytdl-core');
var MessagesToDelete = 0;
const config = require('./config.json')
var SERVER_VALUES = ["//","> "]
const fs = require("fs");
const profanities = require("profanities");
var NSFW_PROTECT = "true";
const userData = JSON.parse(fs.readFileSync("userData/userData.json", "utf-8")) // Get User Data
const serverData = JSON.parse(fs.readFileSync("userData/serverData.json", "utf-8")) // Get Server Data
var memes = [ // Dank memes.. They are here...
  "Meme 1 of 3: The funniest /r/jokes ever seen ! https://i.imgur.com/lw2a0bY.png",
  "Meme 2 of 3: But its kinda right.. Bellend https://s20.postimg.org/c53oy3tel/wdwdwd.png",
  "Meme 3 of 3: Guess what is this! https://s20.postimg.org/mrxi3ltv1/klo.png https://s20.postimg.org/bfkwltdgd/wdwwdwd.png"
];
// Functions and variables
function doMagicMeme() {
  var memes = [ // Dank memes.. They are here...
    "Meme 1 of 3: The funniest /r/jokes ever seen ! https://i.imgur.com/lw2a0bY.png",
    "Meme 2 of 3: But its kinda right.. Bellend https://s20.postimg.org/c53oy3tel/wdwdwd.png",
    "Meme 3 of 3: Guess what is this! https://s20.postimg.org/mrxi3ltv1/klo.png https://s20.postimg.org/bfkwltdgd/wdwwdwd.png"
  ];
  return memes[Math.floor(Math.random()*memes.length)];
}
client.on("message", function(message) { // STOP PINGING ME!!! meme
  console.log(message.content);
  if (message.content.includes("<@395136355115728896>")) {
    message.channel.send("Stop pinging me :imp:");
  }
})
var errorEmbedCreate = function(des) {
  return({embed: {color: 16711680, title: ":x: Error",description: des, footer: { text: "foot" }}});
}
var warningEmbedCreate = function(des) {
  return({embed: {color: 16763904, title: ":warning: Warning",description: des}});
}
var embedCreate = function(col,des,tit,foo) {
  return({embed: {color: col, title: tit,description: des, footer: { text: foo }}});
}
var cat = "http://random.cat/meow.php"
var servers = {};
function play(connection, message) { // Used for music module
  var server = servers[message.guild.id]; // Always use it, otherwise function will return undefined property.
  server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter:"audioonly"})); // Main thing, gets the YouTube audio and plays it
  server.queue.shift();
  server.dispatcher.on("end", function() {
    if (server.queue[0]) play(connection, message);
    else {
      connection.disconnect();
      message.channel.send("Steam isn't ending soo fast. The song/s have ended.")
    }
  })
}
// On startup actions
client.on('ready', () => {
  console.log('I am ready!');
  client.user.setGame('New Music Module v0.06');
});
// User Commands
client.on("message", function(message) {
  // ALWAYS return when prefix is undefined.
  if (message.content.startsWith("undefined")) return; // undefined prefix is banned.
  if (message.author.equals(client.user)) return; // Returns if message is provided from bot.
  // Firstly, check is the command/message profanity!
  if (NSFW_PROTECT==="true") {
    for (x = 0; x < profanities.length; x++) {
      if (message.content.toUpperCase() == profanities[x].toUpperCase()) {
        console.log("Profanity detected in message: " + message.content)
        message.channel.send("Hey! Don't say that!");
        message.delete();
        return;
      }
    }
  }
  // Level system
  if (!userData[message.member.id]) userData[message.member.id] = {
    messagesSent: 0
  }
  userData[message.member.id].messagesSent++;
  fs.writeFile("userData/userData.json", JSON.stringify(userData), (err) => {
    if (err) {
      console.error(err);
    }
  })
  if (userData[message.member.id].tokens) {
    if (message.content.length > 10) {
      userData[message.member.id].tokens+=1
      fs.writeFile("userData/userData.json", JSON.stringify(userData), (err) => {
        if (err) {
          console.error(err);
        }
    })}
  }
  client.user.setStatus("idle");
  if (!serverData[message.guild.id]) serverData[message.guild.id] = {
    serverPrefix: "//"
  }
  // Main command system
  if (!message.content.startsWith(serverData[message.guild.id].serverPrefix)) return; // Checks if command does NOT start with prefix.
  var args = message.content.substring(serverData[message.guild.id].serverPrefix.length).split(" "); // Specify what args are.
  switch (args[0]) { // Command loop
    case "meme":
      message.channel.send(doMagicMeme());
      break;
    case "economy":
      if (args[1]==="register") {
        if (!userData[message.member.id].tokens) {
          userData[message.member.id].tokens = 150;
          message.channel.send("You have been successfully registered to Economy System.")
          fs.writeFile("userData/userData.json", JSON.stringify(userData), (err) => {
            if (err) {
              console.error(err);
            }
          })
        } else {
          message.channel.send("You already have a account!");
        }
      }
      if (args[1]==="info") {
        message.channel.send({embed: {
          color: 3447003,
          fields: [{
            name: "Tokens",
            value: "Tokens are main valuablity of the bot."
          },
          {
            name: "Getting tokens",
            value: "You can get tokens by participating in chat. You get 1 Token every message that has at least 11 chars."
          },
          {
            name: "Am I getting tokens on all servers where the bot is invited?",
            value: "Yes. The main value is made on all servers where I am."
          },
          {
            name: "Spending tokens",
            value: "All purchasables are available under `economy purchase` command."
          }
        ],
        }});
        if (args[1]==="purchase") {
          if (args[2]===undefined) {
            message.channel.send("Purchasables: Generator (1 token / min) - 100 tokens; Advanced Generator (3 tokens / min) - 300 tokens. More soon")
          }
        }
      }
      break;
    case "saysecret":
      message.delete();
      message.channel.send(message.content.slice(11))
      break;
    case "skip":
      var server = servers[message.guild.id];
      message.channel.send("I skipped the song. Please dont skip other songs, please. :(");
      if (server.dispatcher) server.dispatcher.end();
      return;
      break;
    case "syntax-help":
      message.channel.send("`//embed <description>`, `//say <text>`, `//ping`, `//skip`, `//aboutme`, `//play <youtube url>`")
      break;
    case "help":
      message.channel.send("DeprecationWarning: The following command is deprecated. Use `//aboutme` instead.")
      break;
    case "ping":
      message.reply("Pong! `" + client.ping + "ms` has been taken to pong to you back");
      break;
    case "say":
      if (!args[1]) message.channel.send("The syntax of command is incorrect.")
      else message.channel.send(message.content.slice(6));
      break;
    case "embed":
      var args2 = message.content.substring(serverData[message.guild.id].length).split(" | ");
      if (!args[1]) {
        message.channel.send("The syntax of command is incorrect.")
      } else {
        if (!isNaN(args2[3])) {
          if (args2[3]<16777216 && args2[3]>-1) {
            message.channel.send(embedCreate(args2[3],args2[0].content.slice(6),args2[1],args2[2]))
          } else {
            message.channel.send("The color number must be less or equal to 16777215 and greater or equal to 0.")
          }
        } else {
          if (args2[3]===undefined) {
            message.channel.send(embedCreate(3447003,args2[0],args2[1],args2[2]))
          } else {
            message.channel.send("The color must be decimal number.")
          }
        }
      } 
      break;
    case "stop":
      var server = servers[message.guild.id];
      if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
      break;
    case "aboutme":
      message.channel.send({embed: {
        color: 3447003,
        description: "You want to I say something about me? Sure. I am a program. I can accept commands with `//` prefix. I am still being in development. Commands: `//aboutme`, `//ping`, `//play`, `//stop` and not done one - `//skip`."
      }});
      break;
    case "play":
      if (!args[1]) {
        message.channel.send("Please provide a link!");
        return;
      }
      if (!message.member.voiceChannel) {
        message.channel.send("You must be in a voice channel.");
        return;
      }
      if (!servers[message.guild.id]) servers[message.guild.id] = {
        queue: []
      };
      if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
        play(connection, message)
      })

      var server = servers[message.guild.id];
      server.queue.push(args[1]);
      break;
    default:
      message.channel.send("Invalid command");
   }
  client.user.setStatus("online");
});
// MOD Commands
client.on("message", function(message) {
  client.user.setStatus("idle");
  if (message.author.equals(client.user)) return;
  if (!message.content.startsWith(SERVER_VALUES[1])) return;
  if (!message.member.permissions.has("MANAGE_GUILD")) return;
  var args = message.content.substring(SERVER_VALUES[1].length).split(" ");
  switch (args[0]) {
    case "prefix_user":
      if (args[1]===undefined) {
        message.channel.send("Please specify an action to do with prefix. Setting prefix to none will be not supported.")
        return;
      }
      if (args[1]==="show") {
        message.channel.send("The following server prefix is " + serverData[message.guild.id].serverPrefix);
        return;
      }
      if (args[1]==="set") {
        if (args[2]===undefined) {
          message.channel.send("You cant set the prefix to undefined !")
        } else {
          serverData[message.guild.id].serverPrefix = args[2]
          fs.writeFile("userData/serverData.json", JSON.stringify(serverData), (err) => {
          if (err) {
              console.error(err);
            } else {
              message.channel.send("Successfully changed prefix to `" + args[2] + "`.")
            }
          })
        }
      }
      break;
    case "mute":
      message.channel.send("The command is still being worked on");
      break;
    case "clear":
      try {
        var MessagesToDelete = (message.content.slice(8));
        message.channel.send("Attempting to delete " + MessagesToDelete + " messages ..")
        while (!MessagesToDelete===0) {
          var MessagesToDelete = (MessagesToDelete - 1);
          message.delete();
        }        
      } catch(err) {
        message.channel.send("Failed to clear. Make sure the value is the number. Note: Messages older than 2 weeks cannot be deleted due to Discord limitations.")
      }
      break;
    default:
      message.channel.send("Invalid MOD command");
  }
});
// hi, foo and ping reaction + reverse
client.on('message', message => {
  if (message.content === 'hi') {
    message.reply('hi');
  }
  if (message.content === 'foo') {
    message.reply('bar');
  }
  if (message.content === 'bar') {
    message.reply('foo');
  }
  if (message.content === 'ping') {
    message.reply('pong');
  }
  if (message.content === 'pong') {
    message.reply('ping');
  }
});
// when anything is done, log in the bot with its token
client.login(config.ClientSuperSecretTokenHere);