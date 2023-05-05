import { Client, GatewayIntentBits, AttachmentBuilder } from 'discord.js';
import { Configuration, OpenAIApi } from 'openai';
import play from 'play-dl'
import fetch from "node-fetch";
import { joinVoiceChannel, AudioPlayerStatus, createAudioPlayer, createAudioResource, getVoiceConnection } from "@discordjs/voice";
import { lolRandomize } from './leagueOfLegendsService/leagueOfLegendsRandom.js';

const musicQueue = [];

const youtubeApi = [
    'AIzaSyCgnrrfyYgGb3t4TXk1yC8qtau5XlYcAzY',
    'AIzaSyA0HrKNE6MrbHqs22gdzuZgkHvZ-O5QvcA',
    'AIzaSyA55Fiywruvh6ylPBhzh4r_-6INCbFncM0'
]

const lofi_24 = [
    'https://www.youtube.com/watch?v=JWlKA9wmO64',
    'https://www.youtube.com/live/watch?v=jfKfPfyJRdk',
    'https://www.youtube.com/live/watch?v=MVPTGNGiI-4',
    'https://www.youtube.com/live/watch?v=Su00mfi5QUY',
    'https://www.youtube.com/live/watch?v=efwDBb84yWY',
    'https://www.youtube.com/live/watch?v=zsYwejVYZ_M'
]

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const configuration = new Configuration({
    apiKey: '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',
});

const openai = new OpenAIApi(configuration);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    // Get all channels where the bot is a member
    const allGuilds = client.guilds.cache;

    // Log the guild names and IDs
    allGuilds.forEach((guild) => {
      console.log(`Guild Name: ${guild.name}, Guild ID: ${guild.id}`);
    });
});

client.on('voiceStateUpdate', (oldState, newState) => {
    // Check if the bot was disconnected
    if (oldState.channelId && !newState.channelId && oldState.member.user.id === client.user.id) {
        let name = oldState.guild.systemChannelId
        let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
        if (index == -1) return
        musicQueue[index][name].subscription.unsubscribe()
        musicQueue[index][name].player.stop();
        musicQueue[index][name].connection.destroy()
        musicQueue.splice(index)
    }
});

client.on('messageCreate', async (message) => {
    let connection;
    let player;

    const getContent = valueMessage => {
        let completMessage = '';
        for (let i = 1; i < valueMessage.length; i++) {
            completMessage += valueMessage[i] + ' '
        }
        return completMessage;
    }

    function youtube_parser(url) {
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        var match = url.match(regExp);
        return (match && match[7].length == 11) ? match[7] : false;
    }

    const searchVideoByName = async (name, status) => {
        const apiKey = youtubeApi[1];
        const searchName = name
        let url = ''
        let check = status
        let youtubeId = youtube_parser(searchName)
        if (check == true) {
            url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(youtubeId)}&key=${apiKey}`;
        } else {

            url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(searchName)}&type=video&key=${apiKey}`;
        }
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                let exist = data.error

                if (exist) {
                    message.channel.send(data.error.message);
                    return false
                } else {
                    if (data.items.length == 0) {
                        message.channel.send('Not avalaible content panita');
                        return false
                    }
                    if (check) {
                        const videoUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
                        return { name: data.items[0].snippet.title, videoUrl: videoUrl }

                    } else {
                        const videoId = data.items[0].id.videoId;
                        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                        return { name: data.items[0].snippet.title, videoUrl: videoUrl }
                    }
                }
            })
            .catch(error => {
                message.channel.send('Theres a problem panita');
                return false
            });
    }

    const validateUrl = url => {
        const youtubeUrlPattern = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
        return youtubeUrlPattern.test(url);
    }

    const playQueueMusic = async (urlVideo) => {
        // Descargar el audio del video de YouTube
        let name = message.channelId
        let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
        if (index == -1) return
        play.setToken({
            youtube: {
                cookie: "VISITOR_INFO1_LIVE=ZrxVIPDRiIQ; _ga=GA1.1.1339776614.1659837072; _ga_VCGEPY40VB=GS1.1.1669169551.1.0.1669169555.0.0.0; DEVICE_INFO=ChxOekU0TnpRNU5qRXpNVEV3TmpjM09EZzRNUT09EKa7/J0GGKa7/J0G; LOGIN_INFO=AFmmF2swRgIhAMahPQLU_8uqNHcIghIv4c4r_vB1jpDu8zSH-IefxqR9AiEAtWpnIdvZIc_lBGGRys_761WLHTJMo4O5xfO-aU9t8g8:QUQ3MjNmd2JqZ1FtM0ZKaDBKeEZkQTloZGh3NHhkdnZZeWVRako3SEo3VzZXTjJoLUotLW1SRDFGel9kRUpLM3poSk80emRPZk8zOEVFQU9XTWZiNjhlbUhZcTQ1cDFINmJ1SGlOeHBINkVEN3dXaFdNRmNFcU82TWYyVmJVRkQ5T0NTMWY0SU5RQTMtUEV2ajItak1kNG9uUWZaRk91MEtlem9ISGhUaThqVmNBRlR6ZC1SUHMzM1VobHcyMnNadk8zaFEtSkVVMDlIS3hsREVyMUFYWEc0U3ZsZ3dqTmpIQQ==; PREF=f6=401&volume=50&tz=America.Bogota&f5=30000&f7=100; SID=UgjSWKWO8OWZNbnwD-4UIO5DTS4cXkCswbfqMTn8AcazK33IiWJXFiJ-Sfvt7v3bjR2YTg.; __Secure-1PSID=UgjSWKWO8OWZNbnwD-4UIO5DTS4cXkCswbfqMTn8AcazK33Isoxe-YCX-ejt4kaMbvVRAw.; __Secure-3PSID=UgjSWKWO8OWZNbnwD-4UIO5DTS4cXkCswbfqMTn8AcazK33ImMswlwJnHc25Higioylong.; HSID=ArRJcEFSdQhZucu9c; SSID=ADuaDzdLG-KdBqSEQ; APISID=pP9wiiXI-96_5t_S/AkyyCy5emFEUHF9zN; SAPISID=zt1kJ8BwcorXr2WK/AvyYNc_8qkMxGdW-n; __Secure-1PAPISID=zt1kJ8BwcorXr2WK/AvyYNc_8qkMxGdW-n; __Secure-3PAPISID=zt1kJ8BwcorXr2WK/AvyYNc_8qkMxGdW-n; YSC=l8uLdFoRDe8; SIDCC=AFvIBn8HqVnsexGJQDVvzxdQHEWaFDls4fHU3dbiP7koFP9cinCvNnzpORwAT07o6-d6By2AWg; __Secure-1PSIDCC=AFvIBn-DTQ6cbUUGcI7z-sAw1PBw0HtkyolgUUIjmW9QqCedAmUKpiIYjOEYmCSVZKvFNQHrxNo; __Secure-3PSIDCC=AFvIBn9hfYVZlWWYxu5h49WeDHAjF36mJ68gFbkvYgMzdm1Uq1psO-nfxOIPZmdJs5iB93hZ_5Q"
            }
        }) // YouTube Cookies

        if (urlVideo == undefined) return

        const stream = await play.stream(urlVideo)

        // Reproducir el audio en el canal de voz
        let resource = createAudioResource(stream.stream, {
            inputType: stream.type
        })

        if (musicQueue[index][name].player == null) {
            player = createAudioPlayer();
            player.play(resource);
            musicQueue[index][name].player = player
            musicQueue[index][name].subscription = connection.subscribe(player);
        } else {
            player = createAudioPlayer();
            musicQueue[index][name].player = player
            musicQueue[index][name].player.play(resource)
            player = musicQueue[index][name].player
            musicQueue[index][name].subscription = musicQueue[index][name].connection.subscribe(player);
        }

        player.on(AudioPlayerStatus.Idle, () => {
            let name = message.channelId
            let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
            if (index == -1) return
            musicQueue[index][name].status = 'idle';
            musicQueue[index][name].counter += 1;
            if (musicQueue[index][name].url.length == 0 || musicQueue[index][name].counter == musicQueue[index][name].url.length) {
                musicQueue[index][name].player.stop();
                musicQueue[index][name].connection.destroy()
                musicQueue[index][name].subscription.unsubscribe()
                musicQueue.splice(index)
                return;
            }
            playMusic(index, name); // Play the next item in the queue
        });

        player.on(AudioPlayerStatus.AutoPaused, (e) => {
            if (!message.member.voice) return
            let name = message.channelId
            let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
            if (index == -1) return
            musicQueue[index][name].connection.configureNetworking();
            musicQueue[index][name].player.unpause()
        });

    }

    const playMusic = async (index, name) => {
        let counter = musicQueue[index][name].counter
        connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        });
        musicQueue[index][name].connection = connection
        playQueueMusic(musicQueue[index][name].url[counter]);
        musicQueue[index][name].status = 'playing';
        message.channel.send(`you are playing ${musicQueue[index][name].url[counter]}, ${musicQueue[index][name].url.length} videos in the list`);
    }

    if (message.content.startsWith('!p')) {
        if (!message.member.voice.channel) {
            return message.reply('¡Please join first to the channel dont be dumb!');
        }
        const contentMessage = message.content.split(' ');
        let name = message.channelId
        let index = musicQueue.findIndex(item => item.hasOwnProperty(name));

        if (index != -1) {
            if (musicQueue[index][name].playing == 'lofi') {
                musicQueue[index][name].subscription.unsubscribe()
                musicQueue[index][name].player.stop();
                musicQueue[index][name].connection.destroy()
                musicQueue.splice(index)

            }
        }
        index = musicQueue.findIndex(item => item.hasOwnProperty(name));

        if (validateUrl(contentMessage[1])) {
            await searchVideoByName(contentMessage[1], true).then(re => {
                if (re == false) {
                    return
                }
                if (index === -1) {
                    musicQueue.push({
                        [name]: {
                            name: message.guild.name,
                            url: [re.videoUrl],
                            videoName: [re.name],
                            playing: 'youtube',
                            counter: 0,
                            connection: null,
                            player: null,
                            subscription: null,
                            status: 'idle',
                        }
                    });
                    name = message.channelId

                    index = musicQueue.findIndex(item => item.hasOwnProperty(name));
                    playMusic(index, name)

                } else {
                    musicQueue[index][name].url.push(re.videoUrl)
                    musicQueue[index][name].videoName.push(re.name);
                    message.channel.send(`Has been add to the queue ${musicQueue[index][name].url[musicQueue[index][name].url.length - 1]}, ${musicQueue[index][name].url.length} videos in the list`);
                }
            });
        } else {
            await searchVideoByName(getContent(contentMessage)).then(re => {
                if (re == false) {
                    return
                }
                if (index === -1) {
                    musicQueue.push({
                        [name]: {
                            name: message.guild.name,
                            url: [re.videoUrl],
                            videoName: [re.name],
                            playing: 'youtube',
                            counter: 0,
                            connection: null,
                            player: null,
                            subscription: null,
                            status: 'idle'
                        }
                    });
                } else {
                    musicQueue[index][name].url.push(re.videoUrl)
                    musicQueue[index][name].videoName.push(re.name);
                }
                index = musicQueue.findIndex(item => item.hasOwnProperty(name));

                if (musicQueue[index][name].url.length === 1 && musicQueue[index][name].status == 'idle') {
                    if (!message.member.voice.channel) {
                        return
                    } else {
                        let name = message.channelId
                        let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
                        playMusic(index, name)
                    };
                } else {
                    message.channel.send(`Has been add to the queue ${musicQueue[index][name].url[musicQueue[index][name].url.length - 1]}, ${musicQueue[index][name].url.length} videos in the list`);
                }
            });
        }
    }

    if (message.content.startsWith('!question')) {
        const contentMessage = message.content.split(' ');
        let prompt = getContent(contentMessage)

        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `Panita is a chatbot that reluctantly answers questions with very rude responses and some insults, he also can speaks in spanish as Colombian Paisa from Medellin, he Always answer saying Vea Pana:\n\nYou: Como estas\nPanita: Muy bien ome gonorrea y entonces vos como vas ome.\nYou: Que es HTML\nPanita: Papi muy duro ir a buscar en google?, Hypertext Markup Language. Colabore con las preguntes el futuro.\nYou: When did the first airplane fly?\nPanita: On December 17, 1903, Wilbur and Orville Wright made the first flights. I wish they’d come and take me away.\nYou: What is the meaning of life?\nPanita: I’m not sure. I’ll ask my friend Google.\nYou: ${prompt}`,
            temperature: 0.5,
            max_tokens: 60,
            top_p: 0.3,
            frequency_penalty: 0.5,
            presence_penalty: 0.0,
        });
        message.channel.send(`\`\`\`${response.data.choices[0].text}\`\`\``)
        // message.channel.send(`\`\`\`${prompt}\`\`\``)
    }

    if (message.content === '!lofi') {
        if (!message.member.voice.channel) {
            return message.reply('¡Please join first to the channel dont be dumb!');
        }
        let name = message.channelId
        let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
        let position = Math.ceil(Math.random() * lofi_24.length - 1)
        if (index == -1) {
            musicQueue.push({
                [name]: {
                    name: message.guild.name,
                    url: [lofi_24[position]],
                    videoName: 'Lofi Radio 24/7',
                    playing: 'lofi',
                    counter: 0,
                    connection: null,
                    player: null,
                    subscription: null,
                    status: 'idle'
                }
            });
            index = musicQueue.findIndex(item => item.hasOwnProperty(name));
            playMusic(index, name)
        } else {
            musicQueue[index][name].subscription.unsubscribe()
            musicQueue[index][name].player.stop();
            musicQueue[index][name].connection.destroy()
            musicQueue.splice(index)
            position = Math.ceil(Math.random() * lofi_24.length - 1)

            setTimeout(() => {
                musicQueue.push({
                    [name]: {
                        name: message.guild.name,
                        url: [lofi_24[position]],
                        videoName: 'Lofi Radio 24/7',
                        playing: 'lofi',
                        counter: 0,
                        connection: null,
                        player: null,
                        subscription: null,
                        status: 'idle'
                    }
                });
                name = message.channelId
                index = musicQueue.findIndex(item => item.hasOwnProperty(name));
                playMusic(index, name)

            }, 1000)

        }
    }

    if (message.content === '!stop') {
        let name = message.channelId
        let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
        if (index == -1) return
        musicQueue[index][name].subscription.unsubscribe()
        musicQueue[index][name].player.stop();
        musicQueue[index][name].connection.destroy()
        musicQueue.splice(index)
        message.channel.send(`Goodbye panita!`);
    }

    if (message.content === '!next') {
        if (!message.member.voice.channel) return
        let name = message.channelId
        let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
        if (index == -1) return

        musicQueue[index][name].counter += 1 // Remove the first item from the queue
        if (musicQueue[index][name].url.length == 0 || musicQueue[index][name].counter == musicQueue[index][name].url.length) {
            musicQueue[index][name].connection.destroy();
            musicQueue.splice(index)
            return;
        }
        playMusic(index, name)
    }

    if (message.content === '!back') {
        let name = message.channelId
        let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
        if (index == -1) return
        if (musicQueue[index][name].counter > 0) {
            musicQueue[index][name].counter -= 1 // Remove the first item from the queue
            playMusic(index, name)
        }
    }

    if (message.content.startsWith('!123caca')) {
        // Split the message content into an array of words
        const args = message.content.split(' ');
    
        // Check if the second parameter is provided and is either 'a' or 'b'
        if (args[1] === 'a') {
            let response = '-------------------------------------------------------------------------------\n';
            const allGuilds = client.guilds.cache;

            allGuilds.forEach((guild) => {
                response += `Guild Name: ${guild.name}, Guild ID: ${guild.id}\n`;
            });
            response += '-------------------------------------------------------------------------------';
            message.channel.send(response);
        } else if (args[1] === 'b') {
            let response = '-------------------------------------------------------------------------------\n';
            musicQueue.forEach((e) => {
                e = e[message.channelId]
                response += `Name: ${e.name}, `;
                response += `Count videos: ${e.videoName.length}, `;
                response += `Playing: ${e.playing}, `;
                response += `Status: ${e.status}`;
                response += '-------------------------------------------------------------------------------\n';
            });
            message.channel.send(response);

        }
        else {
            // If the second parameter is not provided or is not 'a' or 'b', send an error message
           return
        }
    }

    if (message.content === '!list') {

        let text = ''
        let name = message.channelId
        let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
        if (index == -1) return
        musicQueue[index][name].videoName.forEach((e) => {
            text = text + `\n -${e}`
        })
        message.channel.send(`***Queue list:*** ${text}`);
    }

    if (message.content === '!help') {
        const helpMessage = `
            **Bot Commands:**
            \`!p <YouTube URL or search query>\` - Play a YouTube video in the voice channel you are in, or add it to the queue if something is already playing.
            \`!question <your question>\` - Ask a question and the Panita will provide an answer .
            \`!stop\` - Stop the currently playing audio and clear the queue.
            \`!skip\` - Skip the currently playing audio and move on to the next item in the queue.
            \`!list\` - Display the current music queue.
            \`!delete <number>\` - Deletes the specified number of messages (1 to 100) in the current channel.
            \`!help\` - Show this help message with a summary of the bot's commands.
            
            *Note: You must be in a voice channel to use the !p, !stop, !skip, and !list commands.*
            `;
        message.channel.send(helpMessage);
    }

    if (message.content.startsWith('!delete')) {
        const args = message.content.split(' ');
        const deleteCount = parseInt(args[1], 10);

        if (isNaN(deleteCount) || deleteCount < 1 || deleteCount > 100) {
            return message.reply('Please provide a valid number of messages to delete (1 to 99).');
        }

        // Fetch messages and delete them
        message.channel.bulkDelete(deleteCount + 1, true)
            .then(deletedMessages => {
                const count = deletedMessages.size - 1;
                message.channel.send(`Deleted ${count} messages.`)
                    .then(msg => {
                        setTimeout(() => {
                            msg.delete();
                        }, 3000);
                    });
            })
            .catch(error => {
                console.error(`Could not delete messages: ${error}`);
                message.reply('An error occurred while trying to delete messages, This could be a permission problem, add permisions and try again.');
            });
    }

    if (message.content.startsWith('!randomize')) {
        //generate image
        const validParameters = ['jg', 'top', 'supp', 'mid', 'adc'];
        const maxParameters = 5;
        const args = message.content.split(' ');
        args.shift();
        
        const correctParameters = [];

        // Check all the parameters and save the correct ones
        for (const parameter of args) {
            if (validParameters.includes(parameter)) {
                correctParameters.push(parameter);
            }
        }
        // Check if at least one valid parameter is provided
        if (correctParameters.length === 0) {
            return message.reply('Please provide at least one valid parameter.');
        }

        // Verify if the number of correct parameters is within the limit
        if (correctParameters.length > maxParameters) {
            return message.reply(`Too many parameters. Please provide a maximum of ${maxParameters} valid parameters.`);
        }
        correctParameters.forEach(async(e) => {
            let image = await lolRandomize(e, message)
            const attachment = new AttachmentBuilder(await image.encode('png'), { name: 'profile-image.png' });
            message.reply({ content: `Lane: ${e}`, files: [attachment] });
        })
    }
});


client.login('ODI4MjYxMTIyNzMyODUxMjQx.G5zOl-.5aQdonYax6fqWFoDE5G_yhyja86HQlzLG2457U');