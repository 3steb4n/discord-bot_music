import { Client, GatewayIntentBits } from 'discord.js';
import { Configuration, OpenAIApi } from 'openai';
import { musicBot } from './javascript/music-player/index.js';

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

musicBot(client)


//     if (message.content.startsWith('!')) {
//         console.log(commands)
//         let check = false
//         for (let index = 0; index < commands.length; index++) {
//             const element = commands[index];
//             console.log(element, index)
//             if (element == message.content) {
//                 console.log('aa')
//                 check = true
//                 break
//             }
//         }
//         if (!check)return
//     } else {
//         return
//     }
    
//     let player = createAudioPlayer();
    
//     const getContent = valueMessage => {
//         let completMessage = '';
//         for (let i = 1; i < valueMessage.length; i++) {
//             completMessage += valueMessage[i] + ' '
//         }
//         return completMessage;
//     }

//     function youtube_parser(url) {
//         var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
//         var match = url.match(regExp);
//         return (match && match[7].length == 11) ? match[7] : false;
//     }

//     const searchVideoByName = async (name, status) => {
//         const apiKey = 'AIzaSyA0HrKNE6MrbHqs22gdzuZgkHvZ-O5QvcA';
//         const searchName = name
//         let url = ''
//         let check = status
//         let youtubeId = youtube_parser(searchName)
//         if (check == true) {
//             url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(youtubeId)}&key=${apiKey}`;

//         } else {

//             url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(searchName)}&type=video&key=${apiKey}`;
//         }
//         return fetch(url)
//             .then(response => response.json())
//             .then(data => {
//                 let exist = data.error

//                 if (exist) {
//                     message.channel.send(data.error.message);
//                     return false
//                 } else {
//                     if (check) {
//                         const videoUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
//                         return { name: data.items[0].snippet.title, videoUrl: videoUrl }

//                     } else {
//                         const videoId = data.items[0].id.videoId;
//                         const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
//                         return { name: data.items[0].snippet.title, videoUrl: videoUrl }
//                     }
//                 }
//             })
//             .catch(error => {
//                 message.channel.send(error);
//                 return false
//             });
//     }

//     const validateUrl = url => {
//         const youtubeUrlPattern = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
//         return youtubeUrlPattern.test(url);
//     }

//     let connection
//     if (!message.member.voice.channel) {
//         return

//     } else {
//         connection = joinVoiceChannel({
//             channelId: message.member.voice.channel.id,
//             guildId: message.guild.id,
//             adapterCreator: message.guild.voiceAdapterCreator
//         });
//     };

//     const playQueueMusic = async (urlVideo) => {
//         // Descargar el audio del video de YouTube
//         const stream = await play.stream(urlVideo);

//         // Reproducir el audio en el canal de voz
//         let resource = createAudioResource(stream.stream, {
//             inputType: stream.type
//         })

//         player.play(resource);
//         connection.subscribe(player);
//     }

//     const playMusic = async (index, name) => {
//         let counter = musicQueue[index][name].counter
//         playQueueMusic(musicQueue[index][name].url[counter]);
//         musicQueue[index][name].status = 'playing';
//         message.channel.send(`you are playing ${musicQueue[index][name].url[counter]}, ${musicQueue[index][name].url.length} videos in the list`);
//     }

//     if (message.content.startsWith('!plays')) {
//         if (!message.member.voice.channel) {
//             return message.reply('¡Por favor únete a un canal de voz primero!');
//         }
//         const contentMessage = message.content.split(' ');

//         if (validateUrl(contentMessage[1])) {
//             await searchVideoByName(contentMessage[1], true).then(re => {
//                 if (re == false) {
//                     return
//                 }
//                 let name = message.guild.name
//                 let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
//                 if (index === -1) {
//                     musicQueue.push({
//                         [name]: {
//                             name: message.guild.name,
//                             url: [re.videoUrl],
//                             videoName: [re.name],
//                             counter: 0,
//                             status: 'idle'
//                         }
//                     });
//                     index = musicQueue.findIndex(item => item.hasOwnProperty(name));
//                     playMusic(index, name)

//                 } else {
//                     musicQueue[index][name].url.push(re.videoUrl)
//                     musicQueue[index][name].videoName.push(re.name);
//                 }
//             });
//         } else {
//             await searchVideoByName(getContent(contentMessage)).then(re => {
//                 if (re == false) {
//                     return
//                 }
//                 let name = message.guild.name
//                 let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
//                 if (index === -1) {
//                     musicQueue.push({
//                         [name]: {
//                             url: [re.videoUrl],
//                             videoName: [re.name],
//                             counter: 0,
//                             status: 'idle'
//                         }
//                     });
//                 } else {
//                     musicQueue[index][name].url.push(re.videoUrl)
//                     musicQueue[index][name].videoName.push(re.name);
//                 }
//                 index = musicQueue.findIndex(item => item.hasOwnProperty(name));

//                 if (musicQueue[index][name].url.length === 1 && musicQueue[index][name].status == 'idle') {
//                     playMusic(index, name)
//                 } else {
//                     // counter += 1;
//                     message.channel.send(`se ha guardado en la cola de reproduccion ${musicQueue[index][name].url[musicQueue[index][name].url.length - 1]}, ${musicQueue[index][name].url.length} videos in the list`);
//                 }
//             });
//         }
//     }

//     if (message.content === '!stop') {
//         // Stop playing the current song
//         player.stop();
//         connection.destroy();
//         musicQueue.splice(0, musicQueue.length);
//         message.channel.send(`Adios papi`);

//     }

//     if (message.content === '!next') {
//         // musicQueue.shift();
//         let name = message.guild.name
//         let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
//         musicQueue[index][name].counter += 1 // Remove the first item from the queue
//         if (musicQueue[index][name].url.length === 0 || musicQueue[index][name].counter == musicQueue[index][name].url.length) {
//             console.log('Queue is empty, disconnecting...');
//             connection.destroy();
//             musicQueue.splice(index)
//             return;
//         }
//         playMusic(index, name)
//         // Play the next item in the queue
//     }

//     if (message.content === '!back') {
//         // musicQueue.shift();
//         let name = message.guild.name
//         let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
//         if (musicQueue[index][name].counter > 0) {
//             musicQueue[index][name].counter -= 1 // Remove the first item from the queue
//             playMusic(index, name)
//         }
//     }

//     if (message.content.startsWith('!question')) {

//         const contentMessage = message.content.split(' ');
//         let prompt = getContent(contentMessage)

//         const response = await openai.createCompletion({
//             model: "text-davinci-003",
//             prompt: prompt,
//             temperature: 0.7,
//             max_tokens: 256,
//             top_p: 1,
//             frequency_penalty: 0,
//             presence_penalty: 0,
//         });
//         message.channel.send(`\`\`\`${response.data.choices[0].text}\`\`\``)
//         // message.channel.send(`\`\`\`${prompt}\`\`\``)
//     }

//     // connection.on('stateChange', (old_state, new_state) => {
//     //     if (old_state.status === VoiceConnectionStatus.Ready && new_state.status === VoiceConnectionStatus.Connecting) {
//     //         connection.configureNetworking();
//     //     }
//     // });

//     if (message.content === '!test') {
//         console.log('-------------------------------------------------------------------------------')
//         musicQueue.forEach((e) => {
//             console.log(e)
//         })
//         console.log('-------------------------------------------------------------------------------')
//     }

//     if (message.content === '!list') {
//         let name = message.guild.name
//         let index = musicQueue.findIndex(item => item.hasOwnProperty(name));

//         let text = ''
//         musicQueue[index][name].videoName.forEach((e) => {
//             text = text + `\n -${e}`
//         })
//         message.channel.send(`***list:*** ${text}`);
//     }

//     player.on(AudioPlayerStatus.Idle, () => {
//         let name = message.guild.name
//         let index = musicQueue.findIndex(item => item.hasOwnProperty(name));
//         musicQueue[index][name].status = 'idle';
//         // musicQueue.shift(); // Remove the first item from the queue
//         musicQueue[index][name].counter += 1;

//         if (musicQueue[index][name].url.length == 0 || musicQueue[index][name].counter == musicQueue[index][name].url.length) {
//             console.log('Queue is empty, disconnecting...');
//             connection.destroy();
//             musicQueue.splice(index)
//             console.log('sesion terminada');
//             return;
//         }
//         playMusic(userInformation, index, name); // Play the next item in the queue

//     });

//     player.on(AudioPlayerStatus.Playing, () => {

//     });
//     player.on(AudioPlayerStatus.AutoPaused, (e) => {
//         console.log('fix')
//         connection.configureNetworking();
//         player.unpause()
//     });

//     return
// });

client.login('ODI4MjYxMTIyNzMyODUxMjQx.G5zOl-.5aQdonYax6fqWFoDE5G_yhyja86HQlzLG2457U');