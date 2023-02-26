import { Client, GatewayIntentBits } from 'discord.js';
import play from 'play-dl'
import { joinVoiceChannel, NoSubscriberBehavior, createAudioPlayer, createAudioResource } from "@discordjs/voice";

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

    const getContent = valueMessage => {
        console.log(valueMessage);
        let completMessage = '';
        for (let i = 1; i < valueMessage.length; i++) {
            completMessage += valueMessage[i] + ' '
        }
        return completMessage;
    }

    //Buscar video por nombre
    const searchVideoByName = async name => {
        const apiKey = 'AIzaSyAdM8RrI8XmW_84Ka88hJap4JqnUfd_-00';
        const searchName = name;
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(searchName)}&type=video&key=${apiKey}`;

        return fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log(data.items[0]);
                const videoId = data.items[0].id.videoId;
                const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                return videoUrl;
            })
            .catch(error => {
                console.log(error);
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
        const stream = await play.stream(urlVideo);

        // Reproducir el audio en el canal de voz
        let resource = createAudioResource(stream.stream, {
            inputType: stream.type
        })

        let player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        })

        player.play(resource);
        connection(userInformation).subscribe(player);
    }

    const getMusicTime = async urlVideo => {
        return await play.video_basic_info(urlVideo).then(re => {
            let timeSong = (Number(re.format[0].approxDurationMs) + 2000);
            return timeSong;
        }).catch(err => {
            console.log(err);
        });
    }

    let counter = 0;
    const playMusic = async (userInformation, timeSong = 1) => {
        // Conectarse al canal de voz
        let musicQueueProgress = setInterval(() => {
            console.log(musicQueue.slice(counter, (counter + 1)))
            if (musicQueue.slice(counter, (counter + 1)).length === 0) {
                console.log('fuera');
                counter = 0;
                clearInterval(musicQueueProgress);
                musicQueue.splice(0, musicQueue.length);
                connection(userInformation).disconnect();
            } else {
                playQueueMusic(musicQueue[counter], userInformation);
                clearInterval(musicQueueProgress);
                getMusicTime(musicQueue[counter]).then(value => {
                    playMusic(userInformation, value);
                });
            }
            counter += 1;
            console.log(timeSong);
        }, timeSong);
        /*for (let i = 0, time = 0; i < musicQueue.length; i++) {
            setTimeout(async () => {
                console.log(musicQueue[i]);
            }, i * 3000)
        }*/
    }
    // Comprobar si el autor del mensaje está en un canal de voz
    /*if (!message.member.voice.channel) {
        return message.reply('¡Por favor únete a un canal de voz primero!');
    }*/

    // Comprobar si el mensaje viene de un canal de voz
    if (!message.guild) return;

    /*switch (message.content) {
        case startsWith('!play'):

    }*/
    if (message.content.startsWith('!play')) {
        const contentMessage = message.content.split(' ');
        let userInformation = {
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        };

        if (validateUrl(contentMessage[1])) {
            musicQueue.push(contentMessage[1]);
            console.log(musicQueue)

            if (musicQueue.length === 1) {
                playMusic(userInformation);
            }

        } else {
            await searchVideoByName(getContent(contentMessage)).then(re => {
                musicQueue.push(re);

                if (musicQueue.length === 1) {
                    playMusic(userInformation)
                }
            });
        }
    }
});

client.login('ODk0NjE3MzIwNjU4NDM2MTQ2.GZOkzL.5Cd2AOiu0GZsColDM3MQL1wTU3h7fwVFBsplRw');