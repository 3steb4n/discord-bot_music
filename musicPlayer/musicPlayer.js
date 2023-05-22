export { getContent, getList, playLofi, youtube_parser, searchVideoByName, validateUrl, playQueueMusic, playMusic, stopMusic, nextMusic, backMusic, startMusic }

import { joinVoiceChannel, AudioPlayerStatus, createAudioPlayer, createAudioResource, getVoiceConnection } from "@discordjs/voice";
import { EmbedBuilder, ButtonBuilder, ActionRowBuilder } from 'discord.js';
import { musicQueue } from "../index.js";
import { getContent, validateUrl, youtube_parser } from "./utils.js";
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
    if (index === -1) {
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
                await addSongToQueue(musicQueue, AllMessages, name, index, searchResult.videoUrl, searchResult.name, message, client);
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

function stopMusic(interaction, client) {
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
        lastMessages[interaction.guild == undefined ? interaction.guildId : interaction.guild.id].delete();
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
    const apiKey = youtubeApi[2];
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
