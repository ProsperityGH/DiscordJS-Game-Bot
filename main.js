const Discord = require('discord.js');
const bot = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const token = '';
const PREFIX = 'js!';
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'jsbot'
});

connection.connect();

bot.on('guildMemberAdd', (member) => {
  connection.query(`SELECT * FROM channels WHERE guildname = "${member.guild.name}"`, function (error, result) {
    if (error) throw error;

    if (result.length < 1) {
      return;
    } else {
      member.guild.channels.cache.get(`${result[0].channelid}`).send(`Welkom <@${member.user.id}>!`);
    }
  });
});


bot.on('ready', () => {
  console.log(bot.user.username + " is online.");
  bot.user.setActivity('JavaScript Hackathon', { type: 'COMPETING' }); // STREAMING, WATCHING, CUSTOM_STATUS, PLAYING, COMPETING
})

bot.on('messageCreate', msg => {
  if (!msg.content.startsWith(PREFIX) || msg.author.bot) return; // Regristreer profiel
  const args = msg.content.slice(PREFIX.length).trim().split(' ');
  const command = args.shift().toLowerCase();
  if (command == 'registreer') { // registreer command
    if (args.length < 1) {
      msg.reply('Gebruik het commnand als volgt: pt!registreer [favoriete game] | [platform]');
    } else {
      // Exclude dingetjes en maak een string van de arrays
      let excludeArg = args.indexOf('|');
      let favGame = args.slice(0, excludeArg).join(' ');
      let platform = args.slice(excludeArg + 1, args.length).join(' ');
      // check of alles is ingevuld
      if (!favGame || !platform || args.indexOf('|') === -1) {
        msg.reply('Gebruik wel | tussen de game en het platform. Bijvoorbeeld: "pt!registreer [favoriete game] | [platform]".');
      } else {
        // Check of de gebruiker al bestaat
        connection.query(`SELECT * FROM users WHERE nickname = '${msg.author.username}'`, function (error, result) {
          if (error) throw error;
          if (result.length > 0) {
            msg.reply('Je bent al geregistreerd! :D');
          } else {
            // Zet alles in de database
            connection.query(`INSERT INTO users (nickname, fav_game, platform) VALUES ('${msg.author.username}', '${favGame}', '${platform}')`);
            msg.reply(`Je registratie is succesvol! \n\n Gebruikersnaam: ${msg.author.username}. \n Favoriete game: ${favGame}. \n Welk platform: ${platform}.`);
          }
        })
      }
    }
  }

  if (command == 'profiel') { // Bekijk profiel command
    if (args.length < 1) {
      connection.query(`SELECT * FROM users WHERE nickname = '${msg.author.username}'`, function (error, result) {
        if (error) throw error;

        if (result.length < 1) {
          msg.reply('Deze gebruiker heeft helaas geen profiel...');
        } else {
          const profileEmbed = new Discord.MessageEmbed()
            .setColor('#ffffff')
            .setTitle(`${result[0].nickname}'s profiel`)
            .addFields(
              { name: 'Favoriete game: ', value: `${result[0].fav_game}` },
              { name: 'Platform: ', value: `${result[0].platform}`}
            )
            .setImage(msg.author.avatarURL());
        
          msg.reply({ embeds: [profileEmbed] });
        }
      });
    } else {
      connection.query(`SELECT * FROM users WHERE nickname = '${msg.mentions.users.first().username}'`, function (error, result) {
        if (error) throw error;

        if (result.length < 1) {
          msg.reply('Deze gebruiker heeft helaas geen profiel...');
        } else {
          const profileEmbed = new Discord.MessageEmbed()
            .setColor('#ffffff')
            .setTitle(`${result[0].nickname}'s profiel`)
            .addFields(
              { name: 'Favoriete game: ', value: `${result[0].fav_game}` },
              { name: 'Platform: ', value: `${result[0].platform}`}
            )
            .setImage(msg.mentions.users.first().avatarURL());
        
          msg.reply({ embeds: [profileEmbed] });
        }
      });
    }
  }

  if(msg.content === PREFIX + 'help') { // Help command
    const helpEmbed = new Discord.MessageEmbed() 
    .setColor('#f7df1e')
    .setTitle('Help')
    .setDescription('Placeholder')
    .addFields(
      {name: 'Syntax', value: 'De syntax om de commands te kunnen gebruiken is "js!"'},
      {name: 'js!registreer [Favoriete spel]  | [Favoriete platform] ', value: 'Om een profiel te registreren, Gebruik de commands die al zijn opgenoemd.'},
      {name: 'js!profiel', value: 'Laat jouw profiel zien. Tip! Gebruik "js!profiel @gebruiker" om iemand anders profiel te kunnen zien!'},
      // {name: 'Common Commands', value: 'Placeholder'},
      {name: 'js!help', value: 'Geeft dit "help" bericht neer'}
    )
    .setFooter('Gemaakt door Prosper AKA Peter Griffin');

    msg.channel.send({embeds: [helpEmbed]})
  }
});

bot.on('guildCreate', (g) => {
  const channel = g.channels.cache.find(channel => channel.type === 'GUILD_TEXT' && channel.permissionsFor(g.me).has('SEND_MESSAGES'))
  channel.send('Hallo! Ik ben een bot gemaakt in Javascript! Doe "-help" voor de commands')
})

bot.login(token)