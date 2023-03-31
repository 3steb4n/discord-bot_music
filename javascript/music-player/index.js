

import play from 'play-dl'
import fetch from "node-fetch";
import { joinVoiceChannel, VoiceConnectionStatus, AudioPlayerStatus, createAudioPlayer, createAudioResource, NoSubscriberBehavior, getVoiceConnection  } from "@discordjs/voice";
import { Configuration, OpenAIApi } from 'openai';

const musicQueue = [];
const configuration = new Configuration({
    apiKey: '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',
});
const openai = new OpenAIApi(configuration);
export let musicBot = (client) => client.on('messageCreate', async (message) => {

    
    let player = createAudioPlayer();
    
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
        const apiKey = 'AIzaSyA0HrKNE6MrbHqs22gdzuZgkHvZ-O5QvcA';
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
                    if(data.items.length == 0){
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

    let connection = getVoiceConnection(message.guild.id);
    
    if (connection != undefined) {
        connection.on(VoiceConnectionStatus.Disconnected , (e) => {
    
            let name = message.guild.name
            let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
    
            player.stop();
            connection.destroy();
            musicQueue.splice(index)
            message.channel.send(`Adios papi`);
    
        });
    }
    


    const playQueueMusic = async (urlVideo) => {
        // Descargar el audio del video de YouTube
        play.setToken({
            youtube : {
                cookie: "VISITOR_INFO1_LIVE=ZrxVIPDRiIQ; _ga=GA1.1.1339776614.1659837072; _ga_VCGEPY40VB=GS1.1.1669169551.1.0.1669169555.0.0.0; DEVICE_INFO=ChxOekU0TnpRNU5qRXpNVEV3TmpjM09EZzRNUT09EKa7/J0GGKa7/J0G; LOGIN_INFO=AFmmF2swRgIhAMahPQLU_8uqNHcIghIv4c4r_vB1jpDu8zSH-IefxqR9AiEAtWpnIdvZIc_lBGGRys_761WLHTJMo4O5xfO-aU9t8g8:QUQ3MjNmd2JqZ1FtM0ZKaDBKeEZkQTloZGh3NHhkdnZZeWVRako3SEo3VzZXTjJoLUotLW1SRDFGel9kRUpLM3poSk80emRPZk8zOEVFQU9XTWZiNjhlbUhZcTQ1cDFINmJ1SGlOeHBINkVEN3dXaFdNRmNFcU82TWYyVmJVRkQ5T0NTMWY0SU5RQTMtUEV2ajItak1kNG9uUWZaRk91MEtlem9ISGhUaThqVmNBRlR6ZC1SUHMzM1VobHcyMnNadk8zaFEtSkVVMDlIS3hsREVyMUFYWEc0U3ZsZ3dqTmpIQQ==; PREF=f6=401&volume=50&tz=America.Bogota&f5=30000&f7=100; SID=UgjSWKWO8OWZNbnwD-4UIO5DTS4cXkCswbfqMTn8AcazK33IiWJXFiJ-Sfvt7v3bjR2YTg.; __Secure-1PSID=UgjSWKWO8OWZNbnwD-4UIO5DTS4cXkCswbfqMTn8AcazK33Isoxe-YCX-ejt4kaMbvVRAw.; __Secure-3PSID=UgjSWKWO8OWZNbnwD-4UIO5DTS4cXkCswbfqMTn8AcazK33ImMswlwJnHc25Higioylong.; HSID=ArRJcEFSdQhZucu9c; SSID=ADuaDzdLG-KdBqSEQ; APISID=pP9wiiXI-96_5t_S/AkyyCy5emFEUHF9zN; SAPISID=zt1kJ8BwcorXr2WK/AvyYNc_8qkMxGdW-n; __Secure-1PAPISID=zt1kJ8BwcorXr2WK/AvyYNc_8qkMxGdW-n; __Secure-3PAPISID=zt1kJ8BwcorXr2WK/AvyYNc_8qkMxGdW-n; YSC=l8uLdFoRDe8; SIDCC=AFvIBn8HqVnsexGJQDVvzxdQHEWaFDls4fHU3dbiP7koFP9cinCvNnzpORwAT07o6-d6By2AWg; __Secure-1PSIDCC=AFvIBn-DTQ6cbUUGcI7z-sAw1PBw0HtkyolgUUIjmW9QqCedAmUKpiIYjOEYmCSVZKvFNQHrxNo; __Secure-3PSIDCC=AFvIBn9hfYVZlWWYxu5h49WeDHAjF36mJ68gFbkvYgMzdm1Uq1psO-nfxOIPZmdJs5iB93hZ_5Q"
            }
        }) // YouTube Cookies

        const stream = await play.stream(urlVideo)

        // Reproducir el audio en el canal de voz
        let resource = createAudioResource(stream.stream, {
            inputType: stream.type
        })

        player.play(resource);
        connection.subscribe(player);

    }

    const playMusic = async (index, name) => {
        let counter = musicQueue[index][name].counter
        playQueueMusic(musicQueue[index][name].url[counter]);
        musicQueue[index][name].status = 'playing';
        message.channel.send(`you are playing ${musicQueue[index][name].url[counter]}, ${musicQueue[index][name].url.length} videos in the list`);
    }

    if (message.content.startsWith('!plays')) {
        if (!message.member.voice.channel) {
            return message.reply('¡Por favor únete a un canal de voz primero!');
        }
        const contentMessage = message.content.split(' ');

        if (validateUrl(contentMessage[1])) {
            await searchVideoByName(contentMessage[1], true).then(re => {
                if (re == false) {
                    return
                }
                let name = message.guild.name
                let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
                if (index === -1) {
                    musicQueue.push({
                        [name]: {
                            name: message.guild.name,
                            url: [re.videoUrl],
                            videoName: [re.name],
                            counter: 0,
                            status: 'idle'
                        }
                    });
                    connection = joinVoiceChannel({
                        channelId: message.member.voice.channel.id,
                        guildId: message.guild.id,
                        adapterCreator: message.guild.voiceAdapterCreator
                    });
                    index = musicQueue.findIndex(item => item.hasOwnProperty(name));
                    playMusic(index, name)

                } else {
                    musicQueue[index][name].url.push(re.videoUrl)
                    musicQueue[index][name].videoName.push(re.name);
                    message.channel.send(`se ha guardado en la cola de reproduccion ${musicQueue[index][name].url[musicQueue[index][name].url.length - 1]}, ${musicQueue[index][name].url.length} videos in the list`);
                }
            });
        } else {
            await searchVideoByName(getContent(contentMessage)).then(re => {
                if (re == false) {
                    return
                }
                let name = message.guild.name
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
                }
                index = musicQueue.findIndex(item => item.hasOwnProperty(name));

                if (musicQueue[index][name].url.length === 1 && musicQueue[index][name].status == 'idle') {
                    if (!message.member.voice.channel) {
                        return
                
                    } else {
                        connection = joinVoiceChannel({
                            channelId: message.member.voice.channel.id,
                            guildId: message.guild.id,
                            adapterCreator: message.guild.voiceAdapterCreator
                        });
                    };
                    playMusic(index, name)
                } else {
                    // counter += 1;
                    message.channel.send(`se ha guardado en la cola de reproduccion ${musicQueue[index][name].url[musicQueue[index][name].url.length - 1]}, ${musicQueue[index][name].url.length} videos in the list`);
                }
            });
        }
    }

    if (message.content === '!stop') {
        // Stop playing the current song
        if (!message.member.voice.channel) {
            return
    
        } else {
            connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            });
        };
        let name = message.guild.name
        let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
        player.stop();
        connection.destroy();
        musicQueue.splice(index)
        message.channel.send(`Adios papi`);
    }

    if (message.content === '!next') {
        let name = message.guild.name
        let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
        if (index == -1) {
            return
        }

        if (!message.member.voice.channel) {
            return
    
        } else {
            connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            });
        };
        musicQueue[index][name].counter += 1 // Remove the first item from the queue
        if (musicQueue[index][name].url.length == 0 || musicQueue[index][name].counter == musicQueue[index][name].url.length) {
            connection.destroy();
            musicQueue.splice(index)
            return;
        }
        playMusic(index, name)
    }

    if (message.content === '!back') {
        // musicQueue.shift();  
        let name = message.guild.name
        let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
        if (index == -1) {
            return
        }
        if (musicQueue[index][name].counter > 0) {
            musicQueue[index][name].counter -= 1 // Remove the first item from the queue
            playMusic(index, name)
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

    if (message.content === '!test') {
        console.log('-------------------------------------------------------------------------------')
        musicQueue.forEach((e) => {
            console.log(e)
        })
        console.log('-------------------------------------------------------------------------------')
    }

    if (message.content === '!list') {
        let name = message.guild.name
        let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
        if (index == -1)return

        let text = ''
        musicQueue[index][name].videoName.forEach((e) => {
            text = text + `\n -${e}`
        })
        message.channel.send(`***list:*** ${text}`);
    }

    player.on(AudioPlayerStatus.Idle, () => {
        let name = message.guild.name
        let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
        musicQueue[index][name].status = 'idle';
        // musicQueue.shift(); // Remove the first item from the queue
        musicQueue[index][name].counter += 1;

        if (musicQueue[index][name].url.length == 0 || musicQueue[index][name].counter == musicQueue[index][name].url.length) {
            connection.destroy();
            musicQueue.splice(index)
            return;
        }
        playMusic(index, name); // Play the next item in the queue

    });

    player.on(AudioPlayerStatus.Playing, () => {

    });
    player.on(AudioPlayerStatus.AutoPaused, (e) => {
        connection.configureNetworking();
        player.unpause()
    });
});


