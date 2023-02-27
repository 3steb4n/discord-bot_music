import { Client, GatewayIntentBits } from 'discord.js';
import play from 'play-dl'
import { joinVoiceChannel, AudioPlayerStatus , createAudioPlayer, createAudioResource } from "@discordjs/voice";
import fetch from "node-fetch";
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});


client.on('ready', () => {
    console.log("Ready");
});


client.on('messageCreate', async (message) => {
    const musicQueue = [];
    let status = 'idle';
    let counter = 0
    let player = createAudioPlayer();
    let userInformation = {};
    const getContent = valueMessage => {
        let completMessage = '';
        for (let i = 1; i < valueMessage.length; i++) {
            completMessage += valueMessage[i] + ' '
        }
        return completMessage;
    }

    //Buscar video por nombre
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
                    return videoUrl;
                }
            })
            .catch(error => {
                console.log(error, 'aa');
                message.channel.send(error);
                return false
            });
    }

    //Validar URL de YouTube
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

    const playMusic = async (userInformation, timeSong = 1) => {
        playQueueMusic(musicQueue[counter], userInformation);
        status = 'playing'
        message.channel.send(`you are playing ${musicQueue[counter]}, ${musicQueue.length} videos in the list`);
    }
    // Comprobar si el autor del mensaje está en un canal de voz

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
            console.log(musicQueue.length)
            if (musicQueue.length === 1) {
            
                playMusic(userInformation);
            }
        } else {
            await searchVideoByName(getContent(contentMessage)).then(re => {
                if (re == false) {
                    return
                }
                musicQueue.push(re);
                console.log(status)
                if (musicQueue.length === 1 && status == 'idle') {
                    playMusic(userInformation)
                } else {
                    // counter += 1;
                    message.channel.send(`se ha guardado en la cola de reproduccion ${musicQueue[musicQueue.length - 1]}, ${musicQueue.length} videos in the list`);
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
        userInformation = {
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        };
        counter += 1 // Remove the first item from the queue
        if (musicQueue.length === 0 || counter == musicQueue.length) {
            console.log('Queue is empty, disconnecting...');
            connection(userInformation).disconnect();
            counter = 0
            return;
        }
        playMusic(userInformation); // Play the next item in the queue
    }

    if (message.content === '!back') {
        // musicQueue.shift();
        if (counter > 0) {
            counter -= 1 // Remove the first item from the queue
            playMusic(userInformation); // Play the next item in the queue
        }
    }

    if (message.content === '!test') {
        console.log(musicQueue, counter)
    }

    player.on(AudioPlayerStatus.Idle, () => {
        status = 'idle'
        // musicQueue.shift(); // Remove the first item from the queue
        counter += 1
        if (musicQueue.length === 0 || counter == musicQueue.length) {
            console.log('Queue is empty, disconnecting...');
            counter = 0
            connection(userInformation).disconnect();
            return;
        }
        playMusic(userInformation); // Play the next item in the queue
        console.log('Song has finished playing.');

    });
    player.on(AudioPlayerStatus.Playing, (e) => {
        status = 'playing'
        console.log('Song is playing.', status);
        
    });
});

client.login('ODk0NjE3MzIwNjU4NDM2MTQ2.GZOkzL.5Cd2AOiu0GZsColDM3MQL1wTU3h7fwVFBsplRw');