export { getContent, getList, playLofi, youtube_parser, searchVideoByName, validateUrl, playQueueMusic, playMusic, stopMusic, nextMusic, backMusic, startMusic }

import { joinVoiceChannel, AudioPlayerStatus, createAudioPlayer, createAudioResource, getVoiceConnection } from "@discordjs/voice";
import { EmbedBuilder, ButtonBuilder, ActionRowBuilder } from 'discord.js';
import { musicQueue } from "../index.js";
import { getContent, validateUrl, youtube_parser, playlistIds } from "./utils.js";
import play from 'play-dl'

const lofi_24 = [
    'https://www.youtube.com/watch?v=JWlKA9wmO64',
    'https://www.youtube.com/live/watch?v=jfKfPfyJRdk',
    'https://www.youtube.com/live/watch?v=MVPTGNGiI-4',
    'https://www.youtube.com/live/watch?v=Su00mfi5QUY',
    'https://www.youtube.com/live/watch?v=efwDBb84yWY',
    'https://www.youtube.com/live/watch?v=zsYwejVYZ_M'
]

const youtubeApi = [
    'AIzaSyCgnrrfyYgGb3t4TXk1yC8qtau5XlYcAzY',
    'AIzaSyA0HrKNE6MrbHqs22gdzuZgkHvZ-O5QvcA',
    'AIzaSyA55Fiywruvh6ylPBhzh4r_-6INCbFncM0'
]

let connection;
let player;
export let lastMessages = {};
export let AllMessages = []

const playLofi = async (message, client) => {
    let name = message.guildId
    let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
    let position = Math.ceil(Math.random() * lofi_24.length - 1)
    if (index == -1) {
        musicQueue.push({
            [name]: {
                name: message.guild.name,
                url: [lofi_24[position]],
                videoName: ['Lofi Radio'],
                playing: 'lofi',
                counter: 0,
                connection: null,
                player: null,
                subscription: null,
                status: 'idle'
            }
        });
        index = musicQueue.findIndex(item => item.hasOwnProperty(name));
        playMusic(index, name, message, client)
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
                    videoName: ['Lofi Radio'],
                    playing: 'lofi',
                    counter: 0,
                    connection: null,
                    player: null,
                    subscription: null,
                    status: 'idle'
                }
            });
            name = message.guildId
            index = musicQueue.findIndex(item => item.hasOwnProperty(name));
            playMusic(index, name, message, client)
        }, 1000)

    }
}

const getList = async (message, client) => {
    let name = message.guildId;
    let index = musicQueue.findIndex(item => item.hasOwnProperty(name));

    if (index === -1) return;

    if (musicQueue[index][name].playing == 'lofi') {
        message.channel.send(`Not available for Lofi radio`);
        return;
    }

    const queue = musicQueue[index][name].url;
    const videoNames = musicQueue[index][name].videoName;
    let chunks = [];

    for (let idx = 0; idx < queue.length; idx++) {
        let newEntry = `\n\`${idx + 1}.\` **${videoNames[idx] || 'Unknown'}**`;

        let lastIndex = chunks.length - 1;
        if (lastIndex >= 0 && (chunks[lastIndex] + newEntry).length <= 2000) {
            // If new entry fits in the last chunk, add it there
            chunks[lastIndex] += newEntry;
        } else {
            // Otherwise, create a new chunk
            chunks.push(newEntry);
        }
    }

    if (!chunks.length) {
        chunks.push('***The queue is empty.***');
    } else {
        chunks = chunks.map((chunk, idx) => `***Queue list ${idx + 1}:***${chunk}`);
    }

    for (let chunk of chunks) {
        let msm = await message.channel.send(chunk);

        let subindex = AllMessages.findIndex(item => item.hasOwnProperty(name));
        if (subindex === -1) {
            AllMessages.push({
                [name]: {
                    message: [msm],
                }
            });
        } else {
            AllMessages[subindex][name].message.push(msm);
        }
    }
}

const playQueueMusic = async (urlVideo, message, client) => {
    // Descargar el audio del video de YouTube
    let name = message.guildId
    let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
    if (index == -1) return
    play.setToken({
        youtube: {
            cookie: "VISITOR_INFO1_LIVE=_x6x5hmdz-4; LOGIN_INFO=AFmmF2swRgIhAP_6JmoaxiqF2oW69chnx5CWajLs_V80u0a5rCWAA3v1AiEAxi4O5fle6zPSNc5k-unOqPKOhef8d9YwXJ8kGYn9208:QUQ3MjNmeEJKYVAxSDhPQ1g5X2VOajdQaWRpNmZSNHdyX1NfelBnNTBMYmp6b2M0bHJmR0RHUHhPd2xrWWFUQk5QX1lFTjdlSTJGdmM2eUdlaU95eTMyeDhXMmV4VjJ4WUE4aGYtVlhoY3JaQ2JHa1hwU1AtcWJJRm03WjZLV1BGdV80UGR4ZS1oRjlRVE9PRkRUZGZOZHJLbkVkY25IckJLNnpPUmxraTItdENTbktFallWQ01YWWJYajBMWHdxWXpUUm53RUVweWtyT3RnODEwRUdYSTAwRzFIX2FQb3pmZw==; SID=XAjSWDIoDPuDWAlKSSPp-bZIATtTjiDlqVkFnelZx0SunEjGiBuxy2HzBx9SwPXe2Fr1jQ.; __Secure-1PSID=XAjSWDIoDPuDWAlKSSPp-bZIATtTjiDlqVkFnelZx0SunEjGagdm7jnE_fyjGHwUMwJK-w.; __Secure-3PSID=XAjSWDIoDPuDWAlKSSPp-bZIATtTjiDlqVkFnelZx0SunEjG90HdljEUXnG7CcptZ0hXGw.; HSID=ADL_RmggRqrwsbbQk; SSID=AdyJ0NxOTHLEDn1wR; APISID=Q4cR6yafl_WJo-1P/Ab55PXDuekCulRo53; SAPISID=LcLuiuHoE5PT_-8x/AkaZXGH05GtQWEHhY; __Secure-1PAPISID=LcLuiuHoE5PT_-8x/AkaZXGH05GtQWEHhY; __Secure-3PAPISID=LcLuiuHoE5PT_-8x/AkaZXGH05GtQWEHhY; PREF=tz=America.Bogota&f6=40000400&f7=140&f5=30000; _ga_M0180HEFCY=GS1.1.1687817339.1.0.1687817339.0.0.0; _ga=GA1.1.1830291677.1687817339; YSC=22lg3NBfRKM; SIDCC=AP8dLtynuferDOd7xWEoyoForE-HfwGTRih2772A9obJZHQSmh7MxxXznY8cukWmPhIpA065GUE; __Secure-1PSIDCC=AP8dLtxc82dILqm66QWXiquADS8YNNc10Zd2v98aebxK7bUXuWzR_WPLabRIdvLL5XkG6gXjC-M; __Secure-3PSIDCC=AP8dLtxTLMnGMD2RKMvNFHhZN6lOUhJ5slfs_bwzOWU5Ahdq5PMP7xMKh7rjEv22sIcBQ8x3nbA"
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
        let name = message.guildId
        let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
        if (index == -1) return
        musicQueue[index][name].status = 'idle';
        musicQueue[index][name].counter += 1;
        if (musicQueue[index][name].url.length == 0 || musicQueue[index][name].counter == musicQueue[index][name].url.length) {
            stopMusic(message)
            return;
        }
        playMusic(index, name, message, client)
        // Play the next item in the queue
    });

    player.on(AudioPlayerStatus.AutoPaused, (e) => {
        if (!message.member.voice) return
        let name = message.guildId
        let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
        if (index == -1) return
        musicQueue[index][name].connection.configureNetworking();
        musicQueue[index][name].player.unpause()
    });

}

const addSongToQueue = async (musicQueue, AllMessages, name, index, videoUrl, videoName, message, client) => {
    console.log(index)
    if (index === -1) {
        console.log(videoUrl, '-----------------------------------')
        musicQueue.push({
            [name]: {
                name: message.guild.name,
                url: [videoUrl],
                videoName: [videoName],
                playing: 'youtube',
                counter: 0,
                connection: null,
                player: null,
                subscription: null,
                status: 'idle'
            }
        });
        index = musicQueue.findIndex(item => item.hasOwnProperty(name));
        playMusic(index, name, message, client);
    } else {
        console.log('----------------34fd-------------------')
        musicQueue[index][name].url.push(videoUrl);
        musicQueue[index][name].videoName.push(videoName);

        let embed = new EmbedBuilder()
            .setAuthor({ name: message.guild.name, iconURL: client.user.displayAvatarURL(), url: 'https://discord.com/oauth2/authorize?client_id=828261122732851241&permissions=2097152&scope=bot' })
            .setTitle("Song added to the queue")
            .setDescription(`Has been added to the queue: [${videoUrl}](${videoName}) \n${musicQueue[index][name].url.length} videos in the list`)
            .setColor('#ffb300');

        let msm = await message.channel.send({ embeds: [embed] });
        let subindex = AllMessages.findIndex(item => item.hasOwnProperty(name));
        if (subindex === -1) {
            AllMessages.push({
                [name]: {
                    message: [msm],
                }
            });
        } else {
            AllMessages[subindex][name].message.push(msm);
        }
    }
}

const startMusic = async (message, client) => {
    const contentMessage = message.content.split(' ');
    let name = message.guildId;
    let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
    if (index != -1 && musicQueue[index][name].playing == 'lofi') {
        musicQueue[index][name].subscription.unsubscribe();
        musicQueue[index][name].player.stop();
        musicQueue[index][name].connection.destroy();
        musicQueue.splice(index);
    }

    index = musicQueue.findIndex(item => item.hasOwnProperty(name));

  
    if (index != -1 && musicQueue[index][name].url.length == 10) {
        message.channel.send({ content: 'Max 10 song in the queue' });
        return;
    }

    if (validateUrl(contentMessage[1])) {
        await searchVideoByName(contentMessage[1], true, message).then(async searchResult => {
            if (searchResult) {
                if (Array.isArray(searchResult)) {
                    for (let o = 0; o < searchResult.length; o++) {
                        if (index != -1 && musicQueue[index][name].url.length == 10) {
                            message.channel.send({ content: 'Max 10 song in the queue' });
                            break;
                        }
                        index = musicQueue.findIndex(item => item.hasOwnProperty(name));
                        await addSongToQueue(musicQueue, AllMessages, name, index, searchResult[o].url, searchResult[o].title, message, client);
                    }
                    console.log('finish');
                } else {
                    console.log(contentMessage[1]);
                    await addSongToQueue(musicQueue, AllMessages, name, index, searchResult.videoUrl, searchResult.name, message, client);   
                }
            }

        });
    } else {
        await searchVideoByName(getContent(contentMessage), false, message).then(async searchResult => {
            if (searchResult) {
                await addSongToQueue(musicQueue, AllMessages, name, index, searchResult.videoUrl, searchResult.name, message, client);
            }
        });
    }
}

const playMusic = async (index, name, message, client) => {
    let counter = musicQueue[index][name].counter

    connection = joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
    });

    musicQueue[index][name].connection = connection
    playQueueMusic(musicQueue[index][name].url[counter], message, client);
    musicQueue[index][name].status = 'playing';

    const back = new ButtonBuilder()
        .setCustomId('previous')
        .setStyle('Secondary')
        .setEmoji({ name: "⏮️" });

    const stop = new ButtonBuilder()
        .setCustomId('stop')
        .setStyle('Secondary')
        .setEmoji({ name: "⏹️" });


    const next = new ButtonBuilder()
        .setCustomId('next')
        .setStyle('Secondary')
        .setEmoji({ name: "⏭️" });

    const list = new ButtonBuilder()
        .setCustomId('list')
        .setStyle('Secondary')
        .setEmoji({ name: "🗒️" });


    const row = new ActionRowBuilder()
        .addComponents(back, stop, next, list);

    const embed = await new EmbedBuilder()
        .setAuthor({ name: message.guild.name, iconURL: client.user.displayAvatarURL(), url: 'https://discord.com/oauth2/authorize?client_id=828261122732851241&permissions=2097152&scope=bot' })
        .setDescription(`Playing [${musicQueue[index][name].videoName[counter]}](${musicQueue[index][name].url[counter]}) requested by [${message.author == undefined ? message.user.username : message.author.username}](https://discordapp.com/users/${message.author == undefined ? message.user.id : message.author.id})`)
        .setColor('#ffb300')
    if (lastMessages[message.guild == undefined ? message.guildId : message.guild.id]) {
        lastMessages[message.guild == undefined ? message.guildId : message.guild.id].delete();
        lastMessages[message.guild == undefined ? message.guildId : message.guild.id] = null
    }

    lastMessages[message.guild.id] = await message.channel.send({ embeds: [embed], components: [row] });
}

async function stopMusic(interaction, client) {
    let name = interaction.guildId
    let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
    if (index == -1) return
    musicQueue[index][name].subscription.unsubscribe()
    musicQueue[index][name].player.stop();
    musicQueue[index][name].connection.destroy()
    musicQueue.splice(index)

    let messageIndex = AllMessages.findIndex(item => item.hasOwnProperty(name));
    if (messageIndex != -1) {
        AllMessages[messageIndex][name].message.forEach(async (e) => {
            await e.delete().catch(error => {
                console.error("Failed to delete message: ", 'Mensaje ya eliminado');
            });
        })
        AllMessages.splice(messageIndex)
    }

    if (lastMessages[interaction.guild == undefined ? interaction.guildId : interaction.guild.id]) {
        await lastMessages[interaction.guild == undefined ? interaction.guildId : interaction.guild.id].delete().catch(error => {
            console.error("Failed to delete message: ", 'Mensaje ya eliminado');
        });
        lastMessages[interaction.guild == undefined ? interaction.guildId : interaction.guild.id] = null
    }
    interaction.channel.send(`Goodbye panita`);
}

function nextMusic(interaction, client) {
    if (!interaction.member.voice.channel) return
    let name = interaction.guildId
    let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
    if (index == -1) return

    musicQueue[index][name].counter += 1 // Remove the first item from the queue
    if (musicQueue[index][name].url.length == 0 || musicQueue[index][name].counter == musicQueue[index][name].url.length) {
        stopMusic(interaction, client)
        return;
    }
    playMusic(index, name, interaction, client)
}

function backMusic(interaction, client) {

    let name = interaction.guildId
    let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
    if (index == -1) return
    if (musicQueue[index][name].counter > 0) {
        musicQueue[index][name].counter -= 1 // Remove the first item from the queue
        playMusic(index, name, interaction, client)
    }
}

const searchVideoByName = async (name, status, message) => {
    const  apiKey = youtubeApi[2];
    const searchName = name
    let url = ''
    let check = status
    let youtubeId = youtube_parser(searchName)
    let playList = null;

    if (check == true) {
        const matches = name.match(/v=([a-zA-Z0-9_-]+).*list=([a-zA-Z0-9_-]+)/);
        console.log(matches);
        if (matches && matches[1] && matches[2]) {
            playList = true;
            let maxResults = 10;
            console.log(playlistIds(name))
            url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistIds(name).playlistId}&maxResults=${maxResults}&key=${apiKey}`;
        } else {
            url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(youtubeId)}&key=${apiKey}`;
        }

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
                    if (playList) {
                        let listVideos = []
                        data.items.map(item => {
                            if (item.snippet.title != 'Deleted video') {
                                listVideos.push({ 'title': item.snippet.title, 'url': `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}` });
                            }
                        });
                        return listVideos;
                    } else {
                        const videoUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
                        return { name: data.items[0].snippet.title, videoUrl: videoUrl }
                    }

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
