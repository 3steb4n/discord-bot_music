import { Client, GatewayIntentBits } from 'discord.js';
import play from 'play-dl'
import { joinVoiceChannel, AudioPlayerStatus , createAudioPlayer, createAudioResource } from "@discordjs/voice";
import fetch from "node-fetch";
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
    apiKey: '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',
  });

const openai = new OpenAIApi(configuration);
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const prompt = "Once upon a time, ";
client.on('ready', () => {
    console.log("Ready");
});


const musicQueue = [];
client.on('messageCreate', async (message) => {
    
    let player = createAudioPlayer();
    let userInformation = {};

    const getContent = valueMessage => {
        let completMessage = '';
        for (let i = 1; i < valueMessage.length; i++) {
            completMessage += valueMessage[i] + ' '
        }
        return completMessage;
    }

    const searchVideoByName = async name => {
        const apiKey = 'AIzaSyA55Fiywruvh6ylPBhzh4r_-6INCbFncM0';
        const searchName = name;
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(searchName)}&type=video&key=${apiKey}`;

        return fetch(url)
            .then(response => response.json())
            .then(data => {
                let exist = data.error
                
                if (exist) {
                    message.channel.send(data.error.message);
                    return false
                } else {
                    const videoId = data.items[0].id.videoId;
                    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                    return {name: data.items[0].snippet.title, videoUrl: videoUrl}
                }
            })
            .catch(error => {
                message.channel.send(error);
                return false
            });
    }

    const validateUrl = url => {
        const youtubeUrlPattern = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
        return youtubeUrlPattern.test(url);
    }

    const connection = userInformation => {
        return joinVoiceChannel({
            channelId: userInformation.channelId,
            guildId: userInformation.guildId,
            adapterCreator: userInformation.adapterCreator
        });
    }

    const playQueueMusic = async (urlVideo, userInformation) => {
        // Descargar el audio del video de YouTube
        userInformation = {
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        };
        const stream = await play.stream(urlVideo);

        // Reproducir el audio en el canal de voz
        let resource = createAudioResource(stream.stream, {
            inputType: stream.type
        })

        player.play(resource);
        connection(userInformation).subscribe(player);
    }

    const playMusic = async (userInformation, index, name) => {
        let counter = musicQueue[index][name].counter
        playQueueMusic(musicQueue[index][name].url[counter], userInformation);
        musicQueue[index][name].status = 'playing';
        console.log(musicQueue)
        message.channel.send(`you are playing ${musicQueue[index][name].url[counter]}, ${musicQueue[index][name].url.length} videos in the list`);
    }

    // Comprobar si el mensaje viene de un canal de voz
    if (!message.guild) return;

    if (message.content.startsWith('!plays')) {
        if (!message.member.voice.channel) {
            return message.reply('¡Por favor únete a un canal de voz primero!');
        }
        const contentMessage = message.content.split(' ');

        userInformation = {
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        };

        if (validateUrl(contentMessage[1])) {
            musicQueue.push(contentMessage[1]);
            if (musicQueue.length === 1) {
            
                playMusic(userInformation);
            }
        } else {
            await searchVideoByName(getContent(contentMessage)).then(re => {
                if (re == false) {
                    return
                }
                let name = message.channelId
                let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
                if (index === -1) {
                    musicQueue.push({
                      [name]: {
                        url: [re.videoUrl],
                        videoName: [re.name],
                        counter: 0,
                        status: 'idle'
                      }
                    });
                  } else {
                    musicQueue[index][name].url.push(re.videoUrl)
                    musicQueue[index][name].videoName.push(re.name);
                    ;
                }
                index = musicQueue.findIndex(item => item.hasOwnProperty(name));

                if (musicQueue[index][name].url.length === 1 && musicQueue[index][name].status == 'idle') {
                    playMusic(userInformation, index, name)
                } else {
                    // counter += 1;
                    message.channel.send(`se ha guardado en la cola de reproduccion ${musicQueue[index][name].url[musicQueue[index][name].url.length - 1]}, ${musicQueue[index][name].url.length} videos in the list`);
                }
            });
        }
    }

    if (message.content === '!stop') {
        // Stop playing the current song
        userInformation = {
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        };
        player.stop();
        message.channel.send(`Adios papi`);

        // Clear the music queue
        musicQueue.splice(0, musicQueue.length);
        // Disconnect from the voice channel
        connection(userInformation).disconnect();
    }

    if (message.content === '!next') {
        // musicQueue.shift();
        let name = message.channelId
        let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
        userInformation = {
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        };
        musicQueue[index][name].counter += 1 // Remove the first item from the queue
        if (musicQueue[index][name].url.length === 0 || musicQueue[index][name].counter == musicQueue[index][name].url.length) {
            console.log('Queue is empty, disconnecting...');
            connection(userInformation).disconnect();
            musicQueue.splice(index)
            return;
        }
        playMusic(userInformation, index, name)
        // Play the next item in the queue
    }

    if (message.content === '!back') {
        // musicQueue.shift();
        let name = message.channelId
        let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
        if (musicQueue[index][name].counter > 0) {
            musicQueue[index][name].counter -= 1 // Remove the first item from the queue
            playMusic(userInformation, index, name)
        }
    }

    if (message.content.startsWith('!question')) {

        const contentMessage = message.content.split(' ');
        let prompt = getContent(contentMessage)

        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            temperature: 0.7,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
          
        message.channel.send(`\`\`\`${response.data.choices[0].text}\`\`\``)
        // message.channel.send(`\`\`\`${prompt}\`\`\``)

    }
    
    if(message.content === '!test') {
        console.log('-------------------------------------------------------------------------------')
        musicQueue.forEach((e)=> {
            console.log(e)
        })
        console.log(player)
        console.log('-------------------------------------------------------------------------------')
    }

    if(message.content === '!list') {
        let name = message.channelId
        let index = musicQueue.findIndex(item => item.hasOwnProperty(name));

        let text = ''
        musicQueue[index][name].videoName.forEach((e)=> {
            text = text + `\n -${e}`
        })
        message.channel.send(`***list:*** ${text}`);
    }

    player.on('error', error => {
        console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
        player.play(getNextResource());
    });

    player.on(AudioPlayerStatus.Idle, () => {
        let name = message.channelId
        let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
        musicQueue[index][name].status = 'idle';
        // musicQueue.shift(); // Remove the first item from the queue
        musicQueue[index][name].counter += 1;
        
        if (musicQueue[index][name].url.length || musicQueue[index][name].counter == musicQueue[index][name].url.length) {
            console.log('Queue is empty, disconnecting...');
            connection(userInformation).disconnect();
            musicQueue.splice(index)
            return;
        }
        playMusic(userInformation); // Play the next item in the queue
        console.log('Song has finished playing.');

    });
});

client.login('ODI4MjYxMTIyNzMyODUxMjQx.G5zOl-.5aQdonYax6fqWFoDE5G_yhyja86HQlzLG2457U');