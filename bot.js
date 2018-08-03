const Discord = require('discord.js');
const dbMgmt = require('./database');
const snekfetch = require("snekfetch");

const token = process.env.TOKEN;
const prefix = "$";
const USERID_MAIN = "111298393980022784";
const USERID_SOUL = "111312726243954688";
const api = process.env.API;
const shinyImages = process.env.SHINYIMAGES;
const images = process.env.IMAGES;

var bot = new Discord.Client();

var gamestring = `${prefix}help | v6.0.0`;

function getAlias(command) {
    if (command.toLocaleLowerCase() == "a") {
        return "ability";
    }
    else if (command.toLocaleLowerCase() == "egg" || command.toLocaleLowerCase() == "em") {
        return "eggmove";
    }
    else if (command.toLocaleLowerCase() == "level" || command.toLocaleLowerCase() == "learn" || command.toLocaleLowerCase() == "set") {
        return "learnset";
    }
    else if (command.toLocaleLowerCase() == "m") {
        return "move";
    }
    else if (command.toLocaleLowerCase() == "n") {
        return "nature";
    }
    else if (command.toLocaleLowerCase() == "poke" || command.toLocaleLowerCase() == "p") {
        return "pokemon";
    }
    else if (command.toLocaleLowerCase() == "hm") {
        return "tm";
    }
    else if (command.toLocaleLowerCase() == "chart" || command.toLocaleLowerCase() == "typ" || command.toLocaleLowerCase() == "typechart") {
        return "type";
    }
    else if (command.toLocaleLowerCase() == "loc" || command.toLocaleLowerCase() == "spawn") {
        return "location";
    }
    else if (command.toLocaleLowerCase() == "enc" || command.toLocaleLowerCase() == "en") {
        return "encounter";
    }
    else {
        return command;
    }
}

function fixEffect(effect) {
    var returnEffect = ["", "", "", "", "", ""];
    var newEffect = effect.split(/\n/);
    var i = 0;
    for (var a = 0; a < returnEffect.length; a++) {
        while (i < newEffect.length) {
            var char = returnEffect[a].length + newEffect[i].length;
            if (char > 1024) {
                break;
            }
            else {
                if (newEffect[i].includes("In battle") || newEffect[i].includes("Outside of battle")) {
                    newEffect[i] = "**" + newEffect[i] + "**";
                }
                else if (newEffect[i].startsWith("Generation")) {
                    newEffect[i] = "__" + newEffect[i] + "__";
                }
                returnEffect[a] = returnEffect[a] + newEffect[i] + "\n";
                i++;
            }
        }
    }
    return returnEffect;
}

function logCommand(message) {
    console.log(`[${new Date()}] | [${message.guild}] ${message.author.username} : ${message.content}`);
};

async function connectedGuild(guild) {
    console.log(`[${new Date()}] Connected to ${guild.name}`);
};

async function createServerStats(guild) {
    await dbMgmt.insertOneDataWithID("serverStats", "guildID", guild.id);
}

bot.on('ready', function () {
    var guilds = bot.guilds;
    guilds.forEach(connectedGuild);
    bot.user.setActivity(`${gamestring}`);
    console.log(`[${new Date()}] Bot loaded!`);
});

bot.on('guildMemberAdd', async function (member) {
    var doc = await dbMgmt.findOneData("serverStats", "guildID", member.guild.id);
    if (doc != null) {
        if (doc.joinMsg != "") {
            var channel = member.guild.channels.find("id", doc.joinChannel);
            var announceMessage = doc.joinMsg.replace("$USER$", `<@${member.id}>`).replace("%USER%", member.user.username).replace("$SERVER$", member.guild.name).replace("$COUNT$", member.guild.memberCount);
            channel.send(announceMessage);
        }
        if (doc.defaultRoleID != "") {
            member.addRole(doc.defaultRoleID);
        }
    }
});

bot.on('guildMemberRemove', async function (member) {
    var doc = await dbMgmt.findOneData("serverStats", "guildID", member.guild.id);
    if (doc != null) {
        if (doc.leaveMsg != "") {
            var channel = member.guild.channels.find("id", doc.leaveChannel);
            var announceMessage = doc.leaveMsg.replace("$USER$", `<@${member.id}>`).replace("%USER%", member.user.username).replace("$SERVER$", member.guild.name).replace("$COUNT$", member.guild.memberCount);
            channel.send(announceMessage);
        }
    }
});

bot.on('guildCreate', function (guild) {
    console.log(`[${new Date()}] Joined ${guild.name}. Owned by ${guild.owner.user.username}.`);
    createServerStats(guild);
});

bot.on('guildDelete', async function (guild) {
    console.log(`[${new Date()}] Left ${guild.name}. Owned by ${guild.owner.user.username}.`);
    var deletedServerStats = await dbMgmt.deleteOneData("serverStats", "guildID", guild.id);
    if (deletedServerStats == 1)
        console.log(`[${new Date()}] Server stats for ${guild.name} deleted!`);
});

bot.on("message", async function (message) {
    if (message.author.equals(bot.user)) return;

    if (!message.content.startsWith(prefix)) return;

    var args = message.content.substring(prefix.length).split(/\s+/);

    switch (getAlias(args[0]).toLocaleLowerCase()) {
        case "die":
            if (message.author.id == USERID_MAIN || message.author.id == USERID_SOUL) {
                var iconurl = bot.user.avatarURL;
                var name = bot.user.username;
                var embed = new Discord.RichEmbed()
                    .setAuthor(name, iconurl)
                    .setColor([255, 102, 0])
                    .setDescription("Bot shutting down!")
                message.channel.send(embed);
                bot.destroy();
            }
            else {
                message.channel.send("You can't tell me what to do buddy.");
            }
            logCommand(message);
            break;
        case "info":
            var iconurl = bot.user.avatarURL;
            var embed = new Discord.RichEmbed()
                .setAuthor("About Bot", iconurl)
                .setColor([29, 140, 209])
                .setDescription("Clout Hunters guild bot with PokeOneAPI.\n\n"
                    + "**Creator:** `soulpower11#9057`\n"
                    + "**Bot Source:** [GitHub](https://github.com/soulpower11/CloutHunters)\n\n"
                    + "PokeOne commands and API credits to `AussieGamer1994#2751` and `SwanGoose#8299`\n"
                    + "**Orignal source:** [GitHub](https://github.com/SwanGooseHongFei/PokeOneBot)\n\n"
                    + "**Powered by:** `DiscordJS v11.3.2`"
                )
                .setFooter(`Type ${prefix}help for a list of commands!`)
            message.channel.send(embed);
            logCommand(message);
            break;
        case "help":
            if (!args[1]) {
                var iconurl = bot.user.avatarURL;
                var embed = new Discord.RichEmbed()
                    .setAuthor("Help", iconurl)
                    .setColor([114, 137, 218])
                    .setDescription("__**Commands:**__\n\n"
                        + "**Management:**\n"
                        + "`server`, `announce`, `autorole`\n"
                        + "**PokeOne:**\n"
                        + "`ability`, `eggmove`, `hp`, `learnset`, `move`\n"
                        + "`nature`, `pokemon`, `time`, `tm`, `type`\n"
                        + "`location`, `encounter`"
                    )
                    .setFooter(`Type ${prefix}help [group] for more information.`)
                message.channel.send(embed);

            }
            else {
                switch (args[1].toLocaleLowerCase()) {
                    case "management":
                        message.channel.send("__**Management Commands**__"
                            + "\nServer announcements."
                            + "\n\n`" + prefix + "server` - View server's announcements, default role and server count."
                            + "\n\n```css\nAnnouncements\n```"
                            + "\n`" + prefix + "announce` - Announcement formatting help."
                            + "\n`" + prefix + "announce [join/leave] [channel] [message]` - Sets a leave or join message."
                            + "\n`" + prefix + "announce clear [join/leave]` - Clears the leave or join message."
                            + "\n\n```css\nDefault Role\n```"
                            + "\n`" + prefix + "autorole [rolename]` - Sets the default role of the server."
                            + "\n`" + prefix + "autorole clear` - Clears default role."
                        );
                        break;
                    case "pokeone":
                        message.channel.send("__**PokeOne Commands**__"
                            + "\n`" + prefix + "ability [ability name]` - Gives information on given ability."
                            + "\n`" + prefix + "eggmove [pokemon name]` - Lists moves that can be learnt by given Pokemon by level."
                            + "\n`" + prefix + "hp [HP IV] [ATK IV] [DEF IV] [SPATK IV] [SPDEF IV] [SPEED IV]` - Gives Hidden Power type based on IVs that are given. IVs must be between 0 and 31."
                            + "\n`" + prefix + "learnset [pokemon name]` - Lists moves that can be learnt by given Pokemon by level."
                            + "\n`" + prefix + "move [move name]` - Gives information on given move."
                            + "\n`" + prefix + "nature [nature]` - Gives information on given nature."
                            + "\n`" + prefix + "pokemon [pokemon name]` - Gives information on given pokemon."
                            + "\n`" + prefix + "time` - Gives information on when timed events begin and end."
                            + "\n`" + prefix + "tm [pokemon name]` - Lists the available TMs and HMs that can be learnt by given Pokemon."
                            + "\n`" + prefix + "type [type]` - Lists type advantages and disadvantages for given type, or type combination."
                            + "\n`" + prefix + "location [location name]` - Lists Pokemon encounters at the location."
                            + "\n`" + prefix + "encounter [pokemon name] (region)` - Lists Locations where the Pokemon can be encountered."
                        );
                        break;
                    default:
                        break;
                }
            }
            logCommand(message);
            break;
        case "announce":
            var iconurl = bot.user.avatarURL;
            if (!message.member.hasPermission("MANAGE_GUILD") && message.member.id != USERID_MAIN && message.member.id != USERID_SOUL) {
                var embed = new Discord.RichEmbed()
                    .setAuthor("Announcement", iconurl)
                    .setColor([255, 0, 0])
                    .setDescription("**This is an admin command, and requires the `Manage Server` permission to use.**");
                message.channel.send(embed);
                return;
            }
            if (!args[1]) {
                var embed = new Discord.RichEmbed()
                    .setAuthor("Announcement", iconurl)
                    .setColor([255, 0, 0])
                    .setDescription(`**Usage:** ${prefix}announce [join/leave] [channel] [message]\n` +
                        `              ${prefix}announce clear [join/leave]` +
                        "\n**Description:** Set an announcement message for people joining/leaving the server!" +
                        "\n\n**Message Keywords:**\n" +
                        "__**$USER$**__ mentions the user.\n" +
                        "__**%USER%**__ returns their name only (no mention).\n" +
                        "__**$SERVER$**__ gives the server name.\n" +
                        "__**$COUNT$**__ gives amount of members in your server.\n\n");
                message.channel.send(embed);
            }
            else if (args[1] == "join") {
                if (!args[2] || !args[3]) {
                    var embed = new Discord.RichEmbed()
                        .setAuthor("Announcement", iconurl)
                        .setColor([255, 0, 0])
                        .setDescription(`**Usage:** ${prefix}announce [join/leave] [channel] [message]\n` +
                            `              ${prefix}announce clear [join/leave]` +
                            "\n**Description:** Set an announcement message for people joining/leaving the server!" +
                            "\n\n**Message Keywords:**\n" +
                            "__**$USER$**__ mentions the user.\n" +
                            "__**%USER%**__ returns their name only (no mention).\n" +
                            "__**$SERVER$**__ gives the server name.\n" +
                            "__**$COUNT$**__ gives amount of members in your server.\n\n");
                    message.channel.send(embed);
                    return;
                }
                var checkChannel = message.guild.channels.find("id", args[2].replace('<#', '').replace('>', ''));
                if (checkChannel == null) {
                    var embed = new Discord.RichEmbed()
                        .setAuthor("Announcement", iconurl)
                        .setColor([255, 0, 0])
                        .setDescription(`**Invalid Channel!**`);
                    message.channel.send(embed);
                    return;
                }

                var guildID = message.guild.id;
                var channelID = args[2].replace('<#', '').replace('>', '');
                var msg = message.content.substring(prefix.length + args[0].length + args[1].length + args[2].length + 3);

                var updated = await dbMgmt.updateOneDataWithTwoValues("serverStats", "guildID", guildID, "joinChannel", channelID, "joinMsg", msg);
                if (updated == 1) {
                    var announceMessage = msg.replace("$USER$", `<@${message.author.id}>`).replace("%USER%", message.author.username).replace("$SERVER$", message.guild.name).replace("$COUNT$", message.guild.memberCount);
                    message.channel.send(`**Your join message:** ${announceMessage}`);
                }
                else {
                    await dbMgmt.insertOneDataWithTwoValue("serverStats", "guildID", guildID, "joinChannel", channelID, "joinMsg", msg);
                    var announceMessage = msg.replace("$USER$", `<@${message.author.id}>`).replace("%USER%", message.author.username).replace("$SERVER$", message.guild.name).replace("$COUNT$", message.guild.memberCount);
                    message.channel.send(`**Your join message:** ${announceMessage}`);
                }
            }
            else if (args[1] == "leave") {
                if (!args[2] || !args[3]) {
                    var embed = new Discord.RichEmbed()
                        .setAuthor("Announcement", iconurl)
                        .setColor([255, 0, 0])
                        .setDescription(`**Usage:** ${prefix}announce [join/leave] (channel) <announce message here>\n` +
                            `              ${prefix}announce [clear] (join/leave)` +
                            "\n**Description:** Set an announcement message for people joining/leaving the server!" +
                            "\n\n**Message Keywords:**\n" +
                            "__**$USER$**__ mentions the user.\n" +
                            "__**%USER%**__ returns their name only (no mention).\n" +
                            "__**$SERVER$**__ gives the server name.\n" +
                            "__**$COUNT$**__ gives amount of members in your server.\n\n");
                    message.channel.send(embed);
                    return;
                }
                var checkChannel = message.guild.channels.find("id", args[2].replace('<#', '').replace('>', ''));
                if (checkChannel == null) {
                    var embed = new Discord.RichEmbed()
                        .setAuthor("Announcement", iconurl)
                        .setColor([255, 0, 0])
                        .setDescription(`**Invalid Channel!**`);
                    message.channel.send(embed);
                    return;
                }

                var guildID = message.guild.id;
                var channelID = args[2].replace('<#', '').replace('>', '');
                var msg = message.content.substring(prefix.length + args[0].length + args[1].length + args[2].length + 3);

                var updated = await dbMgmt.updateOneDataWithTwoValues("serverStats", "guildID", guildID, "leaveChannel", channelID, "leaveMsg", msg);
                if (updated == 1) {
                    var announceMessage = msg.replace("$USER$", `<@${message.author.id}>`).replace("%USER%", message.author.username).replace("$SERVER$", message.guild.name).replace("$COUNT$", message.guild.memberCount);
                    message.channel.send(`**Your leave message:** ${announceMessage}`);
                }
                else {
                    await dbMgmt.insertOneDataWithTwoValue("serverStats", "guildID", guildID, "leaveChannel", channelID, "leaveMsg", msg);
                    var announceMessage = msg.replace("$USER$", `<@${message.author.id}>`).replace("%USER%", message.author.username).replace("$SERVER$", message.guild.name).replace("$COUNT$", message.guild.memberCount);
                    message.channel.send(`**Your leave message:** ${announceMessage}`);
                }
            }
            else if (args[1] == "clear") {
                if (!args[2]) {
                    var embed = new Discord.RichEmbed()
                        .setAuthor("Announcement", iconurl)
                        .setColor([255, 0, 0])
                        .setDescription(`**Usage:** ${prefix}announce [clear] (join/leave)` +
                            "\n**Description:** Clears your server's Join or Leave message.")
                    message.channel.send(embed);
                    return;
                }

                var guildID = message.guild.id;
                var channelID = "";
                var msg = "";

                if (args[2].toLocaleLowerCase() == "join") {
                    var updated = await dbMgmt.updateOneDataWithTwoValues("serverStats", "guildID", guildID, "joinChannel", channelID, "joinMsg", msg);
                    if (updated == 1) {
                        var embed = new Discord.RichEmbed()
                            .setAuthor("Announcement", iconurl)
                            .setColor([255, 0, 0])
                            .setDescription(`Join message cleared!`)
                        message.channel.send(embed);
                    }
                    else {
                        var embed = new Discord.RichEmbed()
                            .setAuthor("Announcement", iconurl)
                            .setColor([255, 0, 0])
                            .setDescription(`Server does not have a Join message!`)
                        message.channel.send(embed);
                    }
                }
                else if (args[2].toLocaleLowerCase() == "leave") {
                    var updated = await dbMgmt.updateOneDataWithTwoValues("serverStats", "guildID", guildID, "leaveChannel", channelID, "leaveMsg", msg);
                    if (updated == 1) {
                        var embed = new Discord.RichEmbed()
                            .setAuthor("Announcement", iconurl)
                            .setColor([255, 0, 0])
                            .setDescription(`Leave message cleared!`)
                        message.channel.send(embed);
                    }
                    else {
                        var embed = new Discord.RichEmbed()
                            .setAuthor("Announcement", iconurl)
                            .setColor([255, 0, 0])
                            .setDescription(`Server does not have a Leave message!`)
                        message.channel.send(embed);
                    }
                }
            }
            logCommand(message);
            break;
        case "autorole":
            var guild = message.guild;
            var guildID = guild.id;
            var iconurl = bot.user.avatarURL;

            if (!message.member.hasPermission("MANAGE_GUILD") && message.member.id != USERID_MAIN && message.member.id != USERID_SOUL) {
                var embed = new Discord.RichEmbed()
                    .setAuthor("Auto Role", iconurl)
                    .setColor([255, 0, 0])
                    .setDescription("**This is an admin command, and requires the `Manage Server` permission to use.**");
                message.channel.send(embed);
                return;
            }

            if (!args[1]) {
                var embed = new Discord.RichEmbed()
                    .setAuthor("Auto Role", iconurl)
                    .setColor([255, 0, 0])
                    .setDescription(`**Usage:** ${prefix}autorole [rolename].\n` +
                        `              ${prefix}autorole  clear` +
                        "\n**Description:** Sets the default role of the server.");
                message.channel.send(embed);
            }
            else if (args[1] == "clear") {
                var updated = await dbMgmt.updateOneData("serverStats", "guildID", guildID, "defaultRoleID", "");
                if (updated == 1) {
                    message.channel.send(`The default role is cleared`);
                }
                else {
                    if (await dbMgmt.insertOneDataWithOneValue("serverStats", "guildID", guildID, "defaultRoleID", "")) {
                        message.channel.send(`The default role is cleared`);
                    }
                    else {
                        var embed = new Discord.RichEmbed()
                            .setAuthor("Auto Role", iconurl)
                            .setColor([255, 0, 0])
                            .setDescription(`Error error!!!`);
                        message.channel.send(embed);
                    }
                }
            }
            else {
                try {
                    var role = message.content.substring(prefix.length + args[0].length + 1);
                    var roleID = message.guild.roles.find("name", role).id;

                    await dbMgmt.updateOneData("serverStats", "guildID", guildID, "defaultRoleID", "");

                    var updated = await dbMgmt.updateOneData("serverStats", "guildID", guildID, "defaultRoleID", roleID);
                    if (updated == 1) {
                        message.channel.send(`The default role is now \`${role}\``);
                    }
                    else {
                        if (await dbMgmt.insertOneDataWithOneValue("serverStats", "guildID", guildID, "defaultRoleID", roleID)) {
                            message.channel.send(`The default role is now \`${role}\``);
                        }
                        else {
                            message.channel.send("**Role not found!**");
                        }
                    }
                }
                catch (ex) {
                    message.channel.send("**Role not found!**");
                }
            }

            logCommand(message);
            break;
        case "server":
            var guild = message.guild;
            var guildID = guild.id;
            var iconurl = guild.iconURL;

            var doc = await dbMgmt.findOneData("serverStats", "guildID", guildID);
            var announceJoin = doc.joinMsg;
            var announceLeave = doc.leaveMsg;
            var defaultRoleID = doc.defaultRoleID;
            var usercount = guild.members.filter(member => !member.user.bot).size;
            var botscount = guild.memberCount - usercount;

            var desc = `**No of users:** \`${usercount}\`\n`
            desc = desc + `**No of bots:** \`${botscount}\`\n`

            if (defaultRoleID != "") {
                var role = guild.roles.find("id", doc.defaultRoleID);
                desc = desc + `**Default Role:** \`${role.name}\`\n\n`;
            }
            else {
                desc = desc + `**Default Role:**  No default role.\n\n`;
            }

            desc = desc + `**Announcement:**\n\n`;

            if (announceJoin != "") {
                var joinChannel = guild.channels.find("id", doc.joinChannel);
                desc = desc + `__**Join Announcement:**__ \`${announceJoin}\`\n`;
                desc = desc + `__**Join Channel:**__ ${joinChannel}\n`;
            }
            else {
                desc = desc + `__**Join Announcement:**__ No announcement.\n`;
            }

            if (announceLeave != "") {
                var leaveChannel = guild.channels.find("id", doc.leaveChannel);
                desc = desc + `__**Leave Announcement:**__ \`${announceLeave}\`\n`;
                desc = desc + `__**Leave Channel:**__ ${leaveChannel}\n\n`;
            }
            else {
                desc = desc + `__**Leave Announcement:**__  No announcement.\n\n`;
            }

            var embed = new Discord.RichEmbed()
                .setAuthor(guild.name, iconurl)
                .setColor([0, 255, 0])
                .setDescription(desc)
                .setFooter(`Owner: ${message.guild.owner.user.tag}  `)
            message.channel.send(embed);

            logCommand(message);
            break;
        //PokeOne Stuff By AussieGamer1994#2751 and SwanGoose#8299
        case "ability":
            if (!args[1]) {
                message.channel.send(`Please input an ability - use **${prefix}help pokeone** for more info!`);
                return;
            }

            var search = args.splice(1, args.length).join(" ").toLowerCase();

            var route = "/public/ability/";
            var apifull = api + route + search;

            var { body } = await snekfetch.get(apifull);

            if (body.status == "404") {
                return message.channel.send(`Ability: \`${search}\` not found. Please double check spelling!`);
            }

            var effect = fixEffect(body.info.effect);

            var embed = new Discord.RichEmbed()
                .setTitle(`__${body.info.name}__`)
                .addField(`Ability Description:`, `${body.info.description}`, false)
            for (var i = 0; i < effect.length; i++) {
                if (i == 0) {
                    embed.addField(`Effect:`, `${effect[i]}`, false)
                }
                else if (effect[i] != "") {
                    embed.addField(`\u200B`, `${effect[i]}`, false)
                }
            }
            message.channel.send(embed).catch(console.error);

            logCommand(message);
            break;
        case "eggmove":
            if (!args[1]) {
                return message.channel.send(`Please input a Pokemon - use **${prefix}help pokeone** for more info!`);
            }

            var search = args.splice(1, args.length);
            var isShiny = false;
            if (search[0].toLowerCase() == "shiny") {
                search.splice(0, 1);
                isShiny = true;
            }
            search = search.join(" ").toLowerCase();

            var route = "/public/pokemon/";
            var apifull = api + route + search;

            var { body } = await snekfetch.get(apifull);

            if (body.status == "404") {
                return message.channel.send(`Pokemon: \`${search}\` not found. Please double check spelling!`);
            }

            var array = new Array();

            for (var index = 0; index < body.info.move_learnsets[1].regular_learnset.length; index++) {
                if (body.info.move_learnsets[1].regular_learnset[index].egg_move != null) {
                    array[index] = body.info.move_learnsets[1].regular_learnset[index].move;
                }
            }
            if (array.length == 0) {
                var array = `${body.info.names.en} cannot learn any egg moves!`
            }

            var embed = new Discord.RichEmbed()
                .setTitle(`#${body.info.national_id} || ${body.info.name} || ${body.info.types.join('/')}`)
                .setColor(0x0000C8)
                .addField("Egg Move List", array, true)
            if (isShiny) {
                embed.setThumbnail(shinyImages + `${(body.info.name).toLowerCase().replace(/\W/g, '')}.gif`);
            } else {
                embed.setThumbnail(images + `${(body.info.name).toLowerCase().replace(/\W/g, '')}.gif`);
            }
            message.channel.send(embed).catch(console.error)

            logCommand(message);
            break;
        case "hp":
            var HPIV = args[1];
            var AttackIV = args[2];
            var DefenseIV = args[3];
            var SpAtkIV = args[4];
            var SpDefIV = args[5];
            var SpeedIV = args[6];

            var color, type;

            if (!args[6] || args.length > 7) {
                return message.channel.send(`Please input exactly 6 valid IVs. Input your Pokemon's IVs separated by a space: **${prefix}hp 23 19 16 7 16 20** - use **${prefix}help pokeone** for more info!`);
            }

            if (HPIV > 31 || AttackIV > 31 || DefenseIV > 31 || SpeedIV > 31 || SpAtkIV > 31 || SpDefIV > 31) {
                return message.channel.send(`One or more of the given IVs is higher then 31. Please check your IVs and try again - use **${prefix}help pokeone** for more info!!`)
            }

            if (isNaN(HPIV) || isNaN(AttackIV) || isNaN(DefenseIV) || isNaN(SpeedIV) || isNaN(SpAtkIV) || isNaN(SpDefIV)) {
                return message.channel.send("One or more of the given IVs is not a number!")
            }

            //Checks if IVs are even numbers for HP
            if (HPIV % 2 == 0) {
                var HPIV = 0
            } else {
                var HPIV = 1
            }
            if (AttackIV % 2 == 0) {
                var AttackIV = 0
            } else {
                var AttackIV = 1
            }
            if (DefenseIV % 2 == 0) {
                var DefenseIV = 0
            } else {
                var DefenseIV = 1
            }
            if (SpeedIV % 2 == 0) {
                var SpeedIV = 0
            } else {
                var SpeedIV = 1
            }
            if (SpAtkIV % 2 == 0) {
                var SpAtkIV = 0
            } else {
                var SpAtkIV = 1
            }
            if (SpDefIV % 2 == 0) {
                var SpDefIV = 0
            } else {
                var SpDefIV = 1
            }

            var total = Math.floor(((HPIV + (2 * AttackIV) + (4 * DefenseIV) + (8 * SpeedIV) + (16 * SpAtkIV) + (32 * SpDefIV)) * 15) / 63)

            if (total == "0") {
                color = 0xDC7633;
                type = "Fighting";
            }
            else if (total == "1") {
                color = 0x9696FF;
                type = "Flying";
            }
            else if (total == "2") {
                color = 0xC814FF;
                type = "Poison";
            }
            else if (total == "3") {
                color = 0xC89B00;
                type = "Ground";
            }
            else if (total == "4") {
                color = 0xE59866;
                type = "Rock";
            }
            else if (total == "5") {
                color = 0x007D00;
                type = "Bug";
            }
            else if (total == "6") {
                color = 0x640096;
                type = "Ghost";
            }
            if (total == "7") {
                color = 0x646464;
                type = "Steel";
            }
            if (total == "8") {
                color = 0xFF9600;
                type = "Fire";
            }
            if (total == "9") {
                color = 0x0000C8;
                type = "Water";
            }
            if (total == "10") {
                color = 0x00C800;
                type = "Grass";
            }
            if (total == "11") {
                color = 0xE7C332;
                type = "Electric";
            }
            if (total == "12") {
                color = 0xF032E1;
                type = "Psychic";
            }
            if (total == "13") {
                color = 0x32E7E4;
                type = "Ice";
            }
            if (total == "14") {
                color = 0x9B32E7;
                type = "Dragon";
            }
            if (total == "15") {
                color = 0x5A4326;
                type = "Dark";
            }

            var embed = new Discord.RichEmbed()
                .setTitle('Hidden Power')
                .setColor(color)
                .setDescription(`Type: ${type}`)
            message.channel.send(embed).catch(console.error);

            logCommand(message);
            break;
        case "learnset":
            if (!args[1]) {
                return message.channel.send(`Please input a Pokemon - use **${prefix}help pokeone** for more info!`);
            }

            var search = args.splice(1, args.length);
            var isShiny = false;
            if (search[0].toLowerCase() == "shiny") {
                search.splice(0, 1);
                isShiny = true;
            }
            search = search.join(" ").toLowerCase();

            var route = "/public/pokemon/";
            var apifull = api + route + search;

            var { body } = await snekfetch.get(apifull);

            if (body.status == "404") {
                return message.channel.send(`Pokemon: \`${search}\` not found. Please double check spelling!`);
            }

            var array = new Array();
            for (var index = 0; index < body.info.move_learnsets[1].regular_learnset.length; index++) {
                if (body.info.move_learnsets[1].regular_learnset[index].level != null) {
                    array[index] = "Lvl." + body.info.move_learnsets[1].regular_learnset[index].level + " - " + body.info.move_learnsets[1].regular_learnset[index].move;
                }
            }

            if (array.length == 0) {
                var array = "API error"
            }

            var embed = new Discord.RichEmbed()
                .setTitle(`#${body.info.national_id} || ${body.info.name} || ${body.info.types.join('/')}`)
                .setColor(0x0000C8)
                .addField("Levelling Learnset List", array, true)
            if (isShiny) {
                embed.setThumbnail(shinyImages + `${(body.info.name).toLowerCase().replace(/\W/g, '')}.gif`);
            } else {
                embed.setThumbnail(images + `${(body.info.name).toLowerCase().replace(/\W/g, '')}.gif`);
            }
            message.channel.send(embed).catch(console.error);

            logCommand(message);
            break;
        case "move":
            if (!args[1]) {
                return message.channel.send(`Please input a move - use **${prefix}help pokeone** for more info!`);
            }

            var search = args.splice(1, args.length).join("_").toLowerCase();

            var route = "/public/moves/";
            var apifull = api + route + search;

            var { body } = await snekfetch.get(apifull);

            if (body.status == "404") {
                return message.channel.send(`Move: \`${search}\` not found. Please double check spelling!`);
            }

            var category = body.info.category.charAt(0).toUpperCase() + body.info.category.slice(1);
            var power = body.info.power;
            var acc = body.info.accuracy;
            var crit = body.info.critical_hit;

            if (category == "Status") {
                power = acc = crit = "−";
            }

            var embed = new Discord.RichEmbed()
                .setTitle(body.info.names.en)
                .setDescription(`${body.info.descriptions.en}`)
                .addField("Move Stats", `**Base Power:** ${power}\n**Accuracy:** ${acc}%` + "\n**Critical:** " + crit, true)
                .addField("\u200b", `**PP:** ${body.info.pp} (MAX: ${body.info.max_pp})\n**Type: **` + body.info.type + `\n**Category:** ` + body.info.category.charAt(0).toUpperCase() + body.info.category.slice(1), true)
            message.channel.send(embed).catch(console.error);

            logCommand(message);
            break;
        case "nature":
            if (!args[1]) {
                return message.channel.send(`Please input a nature - use **${prefix}help pokeone** for more info!`);
            }

            var search = args.splice(1, args.length).join(" ").toLowerCase();

            var route = "/public/nature/";
            var apifull = api + route + search;

            var { body } = await snekfetch.get(apifull);

            if (body.status == "404") {
                return message.channel.send(`Nature: \`${search}\` not found. Please double check spelling!`);
            }

            var embed = new Discord.RichEmbed()
                .setTitle(`${body.data.name}`)
                .addField(`__Increases:__`, `${body.data.increase}`, true)
                .addField(`__Decreases:__`, ` ${body.data.decrease}`, true)
                .addField(`\u200b`, `Pokémon with the ${body.data.name} Nature Like: ${body.data.likes} and Dislike: ${body.data.dislikes}`, false)
            message.channel.send(embed).catch(console.error);

            logCommand(message);
            break;
        case "pokemon":
            if (!args[1]) {
                return message.channel.send(`Please input a Pokemon - use **${prefix}help pokeone** for more info!`);
            }

            var search = args.splice(1, args.length);
            var isShiny = false;
            if (search[0].toLowerCase() == "shiny") {
                search.splice(0, 1);
                isShiny = true;
            }
            search = search.join(" ").toLowerCase();

            var route = "/public/pokemon/";
            var apifull = api + route + search;

            var { body } = await snekfetch.get(apifull);

            if (body.status == "404") {
                return message.channel.send(`Pokemon: \`${search}\` not found. Please double check spelling!`);
            }

            var abilities = new Array();
            var evolutions = new Array();
            var prevolution = new Array();

            if (body.info.evolutions == null) {
                evolutions = `N/A`;
            } else {
                for (var index = 0; index < body.info.evolutions.length; index++) {

                    //Temporary holder for the evolution and method
                    var evo = "";

                    //Who is it evolving to?
                    var name = body.info.evolutions[index].to;
                    evo = evo + `**${name}**`;

                    //Does it require trading?
                    var trading = body.info.evolutions[index].trade;
                    if (trading != null) {
                        evo = evo + " by trading";
                    }

                    //Does it need an item to be used on it?
                    var item = body.info.evolutions[index].item;
                    if (item != null) {
                        if (/[aeiouAEIOU]/.test(item.charAt(0))) {
                            evo = evo + " using an " + item;
                        } else {
                            evo = evo + " using a " + item;
                        }
                    }

                    //Does it need to hold an item?
                    var holdItem = body.info.evolutions[index].hold_item;
                    if (holdItem != null) {
                        if (/[aeiouAEIOU]/.test(holdItem.charAt(0))) {
                            evo = evo + " whilst holding an " + holdItem;
                        } else {
                            evo = evo + " whilst holding a " + holdItem;
                        }
                    }

                    //What minimum level does it need?
                    var level = body.info.evolutions[index].level;
                    if (level != null) {
                        evo = evo + " starting at level " + level;
                    }

                    //Does it require a level up to trigger?
                    var levelUp = body.info.evolutions[index].level_up;
                    if (levelUp != null) {
                        evo = evo + " after a level up";
                    }

                    //Does it need happiness?
                    var happy = body.info.evolutions[index].happiness;
                    if (happy != null) {
                        evo = evo + " with at least 220 friendship";
                    }

                    //Does it need a specific move?
                    var move = body.info.evolutions[index].move_learned;
                    if (move != null) {
                        evo = evo + " knowing the move " + move;
                    }

                    //Does it need to satisfy certain conditions?
                    var conditions = new Array();
                    if (body.info.evolutions[index].conditions != null) {
                        for (var i = 0; i < body.info.evolutions[index].conditions.length; i++) {
                            conditions[i] = body.info.evolutions[index].conditions[i];
                        }

                        if (conditions != null) {
                            if (conditions.length > 1) {
                                evo = evo + " " + conditions.join(', ');
                            } else {
                                evo = evo + " " + conditions;
                            }
                        }
                    }

                    //After writing, add to list of evolutions
                    evolutions[index] = evo;

                }
            }

            if (body.info.evolution_from == null) {
                prevolution = `N/A`;
            } else {
                prevolution = body.info.evolution_from;
            }

            for (var index = 0; index < body.info.abilities.length; index++) {
                if (body.info.abilities[index].hidden == true) {
                    abilities[index] = body.info.abilities[index].name + " [Hidden]";
                } else {
                    abilities[index] = body.info.abilities[index].name;
                }

            }

            var stats = new Array();

            stats[0] = `HP: ` + body.info.base_stats.hp;
            stats[1] = `ATK: ` + body.info.base_stats.atk;
            stats[2] = `DEF: ` + body.info.base_stats.def;
            stats[3] = `SPATK: ` + body.info.base_stats.sp_atk;
            stats[4] = `SPDEF: ` + body.info.base_stats.sp_def;
            stats[5] = `SPEED: ` + body.info.base_stats.speed;

            var evTemp = new Array();
            evTemp[0] = `HP: ` + body.info.ev_yield.hp;
            evTemp[1] = `ATK: ` + body.info.ev_yield.atk;
            evTemp[2] = `DEF: ` + body.info.ev_yield.def;
            evTemp[3] = `SPATK: ` + body.info.ev_yield.sp_atk;
            evTemp[4] = `SPDEF: ` + body.info.ev_yield.sp_def;
            evTemp[5] = `SPEED: ` + body.info.ev_yield.speed;

            var id = "" + body.info.national_id;

            for (var index = id.length; index < 3; index++) {
                id = "0" + id;
            }

            var eggGroup = body.info.egg_groups;
            var genderRatios = new Array();

            if (body.info.gender_ratios == null) {
                genderRatios = "Genderless";
            } else {
                genderRatios.push("Male: " + body.info.gender_ratios.male + "%");
                genderRatios.push("Female: " + body.info.gender_ratios.female + "%");
            }
            var embed = new Discord.RichEmbed()
            if (body.info.isGlitch) {
                embed.setTitle(`#${body.info.national_id} || ${body.info.name} || ${body.info.types.join('/')}`)
                embed.setColor(0x0000C8)
                embed.addField(`__${body.info.encoder[0]}:__`, stats.join(", "), true)
                embed.addField(`__${body.info.encoder[1]}:__`, evTemp.join(", "), true)
                embed.addField(`__${body.info.encoder[2]}:__`, abilities, false)
                embed.addField(`__${body.info.encoder[3]}:__`, prevolution, false)
                embed.addField(`__${body.info.encoder[4]}:__`, evolutions, true)
            }
            else {
                embed.setTitle(`#${body.info.national_id} || ${body.info.name} || ${body.info.types.join('/')}`)
                embed.setColor(0x0000C8)
                embed.addField(`__Base Stats:__`, stats, true)
                embed.addField("__EV Yield:__", evTemp, true)
                embed.addField(`__Weight and Height:__`, body.info.height_us + "\n" + body.info.height_eu + "\n" + body.info.weight_us + "\n" + body.info.weight_eu, true)
                embed.addField(`__Abilities:__`, abilities, true)
                embed.addField("__Gender Ratio:__", genderRatios, true)
                embed.addField(`__Egg Group:__`, eggGroup, true)
                embed.addField("__Evolves From:__", prevolution, true)
                embed.addField("__Evolves Into:__", evolutions, false)
                if (isShiny) {
                    embed.setThumbnail(shinyImages + `${(body.info.name).toLowerCase().replace(/\W/g, '')}.gif`);
                } else {
                    embed.setThumbnail(images + `${(body.info.name).toLowerCase().replace(/\W/g, '')}.gif`);
                }
            }
            message.channel.send(embed).catch(console.error);

            logCommand(message);
            break;
        case "time":
            var route = "/public/timeevents";

            var apifull = api + route;

            var { body } = await snekfetch.get(apifull);

            var embed = new Discord.RichEmbed()
                .setTitle(`Timed Events || ${body.day}`)
                .addField("Daily Reset", `${body.dailyReset}`, true)
                .addField("Contests", `**Bug Contest:** ${body.bug}`, true)
                .addField("S.S. Aqua", `**To Olivine:** ${body.olivine}\n**To Vermilion:** ${body.vermilion}`, true)
                .addField("Week Siblings", `**Monday:** ${body.mon}\n**Tuesday:** ${body.tue}\n**Wednesday:** ${body.wed}\n**Thursday:** ${body.thur}\n**Friday:** ${body.fri}\n**Saturday:** ${body.sat}\n**Sunday:** ${body.sun}`, true)
                .addField('Underground', `**Hairdresser 1:** ${body.hairdresser1}\n**Hairdresser 2:** ${body.hairdresser2}\n**Herb Shop:** ${body.herbshop}`, true)
                .addField("Maps", `**Union Cave BF2:** ${body.unioncaveb2f}\n**Lake of Rage:** ${body.rage}\n**MooMoo Farm:** ${body.moomoofarm}`, true)
            message.channel.send(embed).catch(console.error);

            logCommand(message);
            break;
        case "tm":
            if (!args[1]) {
                return message.channel.send(`Please input a Pokemon - use **${prefix}help pokeone** for more info!`);
            }

            var search = args.splice(1, args.length);
            var isShiny = false;
            if (search[0].toLowerCase() == "shiny") {
                search.splice(0, 1);
                isShiny = true;
            }
            search = search.join(" ").toLowerCase();

            var route = "/public/pokemon/";
            var apifull = api + route + search;

            var { body } = await snekfetch.get(apifull);

            if (body.status == "404") {
                return message.channel.send(`Pokemon: \`${search}\` not found. Please double check spelling!`);
            }

            var tmList = new Array();

            var hms = new Array();
            hms[0] = "HM08 - Rock Climb";
            hms[1] = "HM09 - Flash";
            hms[2] = "HM10 - Defog";
            hms[3] = "HM11 - Whirlpool";

            var hmList = new Array();

            for (var index = 0; index < body.info.move_learnsets[0].tm_learnset.length; index++) {
                if (body.info.move_learnsets[0].tm_learnset[index].tm != null) {
                    var skip = false;
                    hms.forEach(element => {
                        if (element.substring(7) == body.info.move_learnsets[0].tm_learnset[index].move) {
                            //skips this iteration, but add it to an hm's list
                            hmList.push(element);
                            skip = true;
                        }
                    });
                    //if it's an hm from 1-7 take it out anyways for sorting
                    if (body.info.move_learnsets[0].tm_learnset[index].tm.charAt(0) == "H") {
                        hmList.push(body.info.move_learnsets[0].tm_learnset[index].tm + " - " + body.info.move_learnsets[0].tm_learnset[index].move);
                        skip = true;
                    }
                    if (!skip) {
                        tmList.push(body.info.move_learnsets[0].tm_learnset[index].tm + " - " + body.info.move_learnsets[0].tm_learnset[index].move);
                    }
                }
            }

            hmList.sort();
            hmList.reverse();

            hmList.forEach(element => {
                tmList.unshift(element);
            });

            if (tmList.length == 0) {
                var tmList = `${body.info.names} cannot learn any TMs nor HMs!`;
            }

            //able to split into two columns with 2 lines of code rather than like 20
            var tmListTwo = new Array();

            tmListTwo = tmList.splice((tmList.length + (tmList.length % 2)) / 2, tmList.length - (tmList.length - (tmList.length % 2)) / 2);

            var embed = new Discord.RichEmbed()
                .setTitle(`#${body.info.national_id} || ${body.info.name} || ${body.info.types.join('/')}`)
                .setColor(0x0000C8)
                .addField("TM/HM List", tmList, true)
                .addField("\u200b", tmListTwo, true)
            if (isShiny) {
                embed.setThumbnail(shinyImages + `${(body.info.name).toLowerCase().replace(/\W/g, '')}.gif`);
            } else {
                embed.setThumbnail(images + `${(body.info.name).toLowerCase().replace(/\W/g, '')}.gif`);
            }
            message.channel.send("Gen 7 Pokemon may have wrong TM's HM's ATM!", { embed: embed }).catch(console.error);

            logCommand(message);
            break;
        case "type":
            if (!args[1]) {
                message.channel.send(`Please input a valid type - use **${prefix}help pokeone** for more info!`);
                return;
            }

            var route = "/public/types/";

            if (!args[2]) {
                var search = args.splice(1, args.length).join(" ").toLowerCase();

                var apifull = api + route + search;

                var { body } = await snekfetch.get(apifull);

                if (body.status == "404") {
                    return message.channel.send(`Type: \`${search}\` not found. Please double check spelling!`);;
                }
                var deals = new Array();
                var takes = new Array();
                for (var index = 0; index < 18; index++) {
                    var temp = body.info.attacking[index];
                    var array = temp.split(" ");
                    temp = array[1] + "x to " + array[0];
                    deals.push(temp);
                }
                for (var index = 0; index < 18; index++) {
                    var temp = body.info.defending[index];
                    var array = temp.split(" ");
                    temp = array[1] + "x from " + array[0];
                    takes.push(temp);
                }

                var embed = new Discord.RichEmbed()
                    .setTitle(`${body.info.name}`)
                    .setColor(parseInt(body.info.colour, 16))
                    .addField(`__Deals:__`, deals, true)
                    .addField(`__Takes:__`, takes, true)
                message.channel.send(embed).catch(console.error);

                logCommand(message);
                break;
            }

            var searchOne = args[1].toLowerCase();
            var searchTwo = args[2].toLowerCase();

            var apiOne = api + route + searchOne;
            var apiTwo = api + route + searchTwo;

            var dealsOne = new Array();
            var dealsTwo = new Array();
            var takesOne = new Array();
            var takesTogether = new Array();


            var name = "";

            var { body } = await snekfetch.get(apiOne);

            if (body.status == "404") {
                return message.channel.send(`Type: \`${searchOne}\` not found. Please double check spelling!`);;
            }

            for (var index = 0; index < 18; index++) {
                var temp = body.info.attacking[index];
                var array = temp.split(" ");
                temp = array[1] + "x to " + array[0];
                dealsOne.push(temp);
            }
            for (var index = 0; index < 18; index++) {
                var temp = body.info.defending[index].split(" ")[1];
                takesOne.push(temp);
            }
            name = body.info.name;
            var colour = body.info.colour;

            var { body } = await snekfetch.get(apiTwo);

            if (body.status == "404") {
                return message.channel.send(`Type: \`${searchTwo}\` not found. Please double check spelling!`);;
            }

            for (var index = 0; index < 18; index++) {
                var temp = body.info.attacking[index];
                var array = temp.split(" ");
                temp = array[1] + "x to " + array[0];
                dealsTwo.push(temp);
            }

            for (var index = 0; index < 18; index++) {
                var firstTypeMultiplier = takesOne[index];
                var secondTypeMultiplier = body.info.defending[index].split(" ")[1];

                var finalMultiplier = parseFloat(firstTypeMultiplier) * parseFloat(secondTypeMultiplier);

                var temp = finalMultiplier + "x from " + body.info.defending[index].split(" ")[0];
                takesTogether.push(temp);
            }

            tempName = name;
            name = tempName + "/" + body.info.name

            var embed = new Discord.RichEmbed()
                .setTitle(name)
                .setColor(parseInt(colour, 16))
                .addField(`__${name.split("/")[0]} Deals:__`, dealsOne, true)
                .addField(`__${name.split("/")[1]} Deals:__`, dealsTwo, true)
                .addField(`__Together Takes:__`, takesTogether, true)
            message.channel.send(embed).catch(console.error);

            logCommand(message);
            break;
        //End
        case "location":
            if (!args[1]) {
                return message.channel.send(`Please input a Location - use **${prefix}help pokeone** for more info!`);
            }
            var color;

            var search = args.splice(1, args.length).join(" ").toLowerCase();
            if (search.startsWith("pokemon mansion")) {
                search = "pokemon mansion 1f/2f/3f";
            }

            var route = "/public/spawns/";
            var apifull = api + route + search;

            var { body } = await snekfetch.get(apifull);

            if (body.status == "404") {
                return message.channel.send(`Location: \`${search}\` not found. Please double check spelling! or Location has no Pokemon encounter.`);
            }

            if (body.data.region == "Kanto") {
                color = 0x80BB1D;
            }
            else if (body.data.region == "Johto") {
                color = 0xCAC02E;
            }

            var embed = new Discord.RichEmbed()
                .setTitle(`${body.data.area} (${body.data.region})`)
                .setColor(color)
                .setDescription(`**Pokemon Encounters:**`)
                .setFooter(`ToD = Time of Day, EM = Encounter Method, M = Morning, D = Day, N = Night, E = Evening`)
            for (var index = 0; index < body.data.pokemon.length; index++) {
                embed.addField(`__${body.data.pokemon[index].name}__`,
                    `**ToD:** ${body.data.pokemon[index]["time of day"]}` +
                    `\n**EM:** ${body.data.pokemon[index]["encounter method"]}` +
                    `\n**Rarity:** ${body.data.pokemon[index].rarity}`
                    , true);
            }

            message.channel.send(embed).catch(console.error);

            logCommand(message);
            break;
        case "encounter":
            if (!args[1]) {
                return message.channel.send(`Please input a Pokemon - use **${prefix}help pokeone** for more info!`);
            }

            var search = args.splice(1, args.length);
            var isShiny = false;
            var isKanto = true;
            var isJohto = true;
            if (search[0].toLowerCase() == "shiny") {
                search.splice(0, 1);
                isShiny = true;
            }

            if (search[1] && search[1].toLowerCase() == "kanto") {
                search.splice(1, 1);
                isJohto = false;
            }
            else if (search[2] && search[2].toLowerCase() == "kanto") {
                search.splice(1, 1);
                isJohto = false;
            }
            else if (search[1] && search[1].toLowerCase() == "johto") {
                search.splice(1, 1);
                isKanto = false;
            }
            else if (search[2] && search[2].toLowerCase() == "johto") {
                search.splice(1, 1);
                isKanto = false;
            }
            search = search.join(" ").toLowerCase();

            var route = "/public/encounters/";
            var apifull = api + route + search;

            var { body } = await snekfetch.get(apifull);

            if (body.status == "404") {
                return message.channel.send(`Pokemon: \`${search}\` not found. Please double check spelling!`);
            }

            var region = {
                "Kanto": [],
                "Johto": []
            }

            var k = 0;
            var j = 0;
            body.data.location.forEach(function (r) {
                if (r.region == "Kanto") {
                    var locationInfo = {
                        "area": r.area,
                        "time of day": r["time of day"],
                        "encounter method": r["encounter method"],
                        "rarity": r.rarity
                    }
                    region.Kanto[k] = locationInfo;
                    k++;
                }
                else if (r.region == "Johto") {
                    var locationInfo = {
                        "area": r.area,
                        "time of day": r["time of day"],
                        "encounter method": r["encounter method"],
                        "rarity": r.rarity
                    }
                    region.Johto[j] = locationInfo;
                    j++;
                }
            })

            if (region.Kanto.length != 0 && isKanto) {
                var kanto = new Discord.RichEmbed()
                    .setTitle(`${body.data.pokemon} (Kanto)`)
                    .setColor(0x80BB1D)
                    .setDescription(`**Encounter Locations:**`)
                    .setFooter(`ToD = Time of Day, EM = Encounter Method, M = Morning, D = Day, N = Night, E = Evening`)
                for (var index = 0; index < region.Kanto.length; index++) {
                    kanto.addField(`__${region.Kanto[index].area}__`,
                        `**ToD:** ${region.Kanto[index]["time of day"]}` +
                        `\n**EM:** ${region.Kanto[index]["encounter method"]}` +
                        `\n**Rarity:** ${region.Kanto[index].rarity}`
                        , true);
                }
                if (isShiny) {
                    kanto.setThumbnail(shinyImages + `${(body.data.pokemon).toLowerCase().replace(/\W/g, '')}.gif`);
                } else {
                    kanto.setThumbnail(images + `${(body.data.pokemon).toLowerCase().replace(/\W/g, '')}.gif`);
                }
                message.channel.send(kanto).catch(console.error);
            }
            else if (isKanto && !isJohto) {
                return message.channel.send(`Pokemon: \`${body.data.pokemon}\` cannot be encountered in Kanto.`);
            }

            if (region.Johto.length != 0 && isJohto) {
                var johto = new Discord.RichEmbed()
                    .setTitle(`${body.data.pokemon} (Johto)`)
                    .setColor(0xCAC02E)
                    .setDescription(`**Encounter Locations:**`)
                    .setFooter(`ToD = Time of Day, EM = Encounter Method, M = Morning, D = Day, N = Night, E = Evening`)
                for (var index = 0; index < region.Johto.length; index++) {
                    johto.addField(`__${region.Johto[index].area}__`,
                        `**ToD:** ${region.Johto[index]["time of day"]}` +
                        `\n**EM:** ${region.Johto[index]["encounter method"]}` +
                        `\n**Rarity:** ${region.Johto[index].rarity}`
                        , true);
                }
                if (isShiny) {
                    johto.setThumbnail(shinyImages + `${(body.data.pokemon).toLowerCase().replace(/\W/g, '')}.gif`);
                } else {
                    johto.setThumbnail(images + `${(body.data.pokemon).toLowerCase().replace(/\W/g, '')}.gif`);
                }
                message.channel.send(johto).catch(console.error);
            }
            else if (isJohto && !isKanto) {
                return message.channel.send(`Pokemon: \`${body.data.pokemon}\` cannot be encountered in Johto.`);
            }

            logCommand(message);
            break;
        default:
            break;
    }
});

bot.login(token);
