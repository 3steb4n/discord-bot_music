import Canvas, { loadImage } from '@napi-rs/canvas';
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url);
const shardMaestries = ['adaptive', 'armor', 'health', 'attack_speed', 'magic_resist', 'Scalling']
const champions_es = require('../public/LeagueOfLegendsSource/data/es_MX/champion.json');
const items_es = require('../public/LeagueOfLegendsSource/data/es_MX/item.json');
const runes_es = require('../public/LeagueOfLegendsSource/data/es_MX/runesReforged.json');

const allItems = {
    boots: [
        '3006',
        '3009',
        '3047',
        '3111',
        '3020',
        '3117',
        '3158'
    ],
    suppStarterItems: [
        '3850',
        '3854',
        '3858',
        '3862',
    ],
    jungleStarter: [
        '1101',
        '1102',
        '1103'
    ],
    myticsItems: [
        '6671', '6672', '6673', '4644', '3078', '6630', '6631', '6632', '3051', '3152',
        '4633', '4636', '6653', '6655', '6665', '6691', '6692', '6693', '6662',
        '6656', '6657', '7020', '3001', '3190', '4005', '6617'
    ],
    LegendaryItems: [
        '3089', '3031', '3074', '3161', '6675', '3153', '3748', '6333', '3072', '3193', '6694',
        '3053', '3071', '3091', '3003', '3026', '3033', '3036', '3004', '3083', '3100',
        '3115', '3139', '3142', '3143', '3157', '3165', '4628', '4629', '4637', '4645', '6035',
        '6676', '6696', '8020', '3065', '3156', '3508', '3742', '3814', '4401', '3135',
        '3181', '6609', '6664', '3068', '3075', '3095', '3110', '3119', '3046', '3085', '3102',
        '3116', '3124', '6695', '3094', '8001', '3050', '3011', '3107', '3109', '3179',
        '3222', '3504', '6616'
    ]
}

const getRandom = (object, base) => {
    let length = object.length - 1
    return Math.floor(Math.random() * (length - base + 1) + base)
}

const getRamdomShard = () => {
    let config = {
        first: [
            'StatModsAdaptiveForceIcon',
            'StatModsAttackSpeedIcon',
            'StatModsCDRScalingIcon'
        ],
        second: [
            'StatModsAdaptiveForceIcon',
            'StatModsArmorIcon',
            'StatModsMagicResIcon.MagicResist_Fix',
        ],
        third: [
            'StatModsHealthScalingIcon',
            'StatModsArmorIcon',
            'StatModsMagicResIcon.MagicResist_Fix',
        ]
    }

    return [
        config.first[getRandom(config.first, 0)],
        config.second[getRandom(config.second, 0)],
        config.third[getRandom(config.third, 0)],
    ]
}

const getRandomRune = (runes) => {

    let config = {
        runes: {
            first: 0,
            second: 0,
        },
        subRunesA: {
            A: 0,
            B: 0,
            C: 0,
            D: 0,
        },
        subRunesB: {
            A: 0,
            B: 0,
        },
        RandomRunesB: {
            first: 0,
            second: 0,
        }
    }

    while (true) {
        config.runes.first = getRandom(runes, 0)
        config.runes.second = getRandom(runes, 0)

        if (config.runes.first == config.runes.second) {
            config.runes.second = getRandom(runes, 0)
        } else {
            break;
        }
    }

    // console.log(runes[config.runes.first].slots[0].runes[], 'aaaa')
    // return
    config.subRunesA.A = getRandom(runes[config.runes.first].slots[0].runes, 0)
    config.subRunesA.B = getRandom(runes[config.runes.first].slots[1].runes, 0)
    config.subRunesA.C = getRandom(runes[config.runes.first].slots[2].runes, 0)
    config.subRunesA.D = getRandom(runes[config.runes.first].slots[3].runes, 0)


    while (true) {
        config.RandomRunesB.first = getRandom(runes[config.runes.second].slots, 1)
        config.RandomRunesB.second = getRandom(runes[config.runes.second].slots, 1)
        if (config.RandomRunesB.first != config.RandomRunesB.second) break
    }

    config.subRunesB.A = getRandom(runes[config.runes.second].slots[config.RandomRunesB.first].runes, 0)
    config.subRunesB.B = getRandom(runes[config.runes.second].slots[config.RandomRunesB.second].runes, 0)

    return config
}

export async function lolRandomize(lane, message) {
    const getRandomItem = (items) => {
        let itemName;
        do {
            itemName = items[Math.floor(Math.random() * items.length)];
        } while (!whitelist.has(itemName) || selectedItems.has(itemName));
        selectedItems.add(itemName);
        return itemName;
    };

    const loadItems = async () => {
        //loadItems
        const filteredItems = items.filter(item => whitelist.has(item));

        if (filteredItems.length < 5) {
            throw new Error('Not enough items in the whitelist to create a list of 5 unique items.');
        }

        for (let i = 0; i < 4; i++) {
            let itemName = getRandomItem(filteredItems);
            itemImages[i] = await Canvas.loadImage(`./public/LeagueOfLegendsSource/item/${itemName}.png`);
        }
        itemImages[4] = await Canvas.loadImage(`./public/LeagueOfLegendsSource/item/${allItems.myticsItems[getRandom(allItems.myticsItems, 0)]}.png`)
        itemImages[5] = await Canvas.loadImage(`./public/LeagueOfLegendsSource/item/${allItems.boots[getRandom(allItems.boots, 0)]}.png`)
        const itemWidth = canvas.width / 20;
        const itemHeight = canvas.height / 12;
        const itemSpacing = 20; // Adjust this value to change the spacing between images
        for (let i = 0; i < 6; i++) {
            const xPos = canvas.width / 3.7 + (itemWidth + itemSpacing) * i;
            const yPos = canvas.height / 2.4;
            // Draw the image
            context.drawImage(itemImages[i], xPos, yPos, itemWidth, itemHeight);
            // Draw a black stroke around the image
            context.strokeStyle = 'black';
            context.lineWidth = 10; // Adjust this value to change the stroke width
            context.strokeRect(xPos, yPos, itemWidth, itemHeight);
        }
    }

    const loadText = async () => {
        //Text
        context.font = '120px sans-serif';
        // Select the style that will be used to fill the text in
        context.fillStyle = '#ffffff';
        // Actually fill the text with a solid color
        context.fillText(RandomChampion, 500, 210, canvas.width / 2, canvas.height / 1.8);
        const inputString = champions_es.data[RandomChampion].blurb;

        // Split the inputString into an array of words
        const words = inputString.split(' ');

        // Add a line break every 10 words
        const stringWithBreaks = words.map((word, index) => {
            return (index !== 0 && index % 12 === 0) ? `\n${word}` : word;
        }).join(' ');

        // Split the stringWithBreaks into an array of lines
        const lines = stringWithBreaks.split('\n');

        // Set the font and text size
        const fontSize = 25; // Adjust the font size to fit your needs
        context.font = `${fontSize}px sans-serif`;

        // Define the line spacing
        const lineHeight = fontSize + 4; // Adjust this value to change the spacing between lines

        // Calculate the width and height of the text block
        const textWidth = Math.max(...lines.map(line => context.measureText(line).width));
        const textHeight = lines.length * lineHeight;

        // Determine the appropriate starting position for the text
        const startX = 510;
        const startY = (canvas.height - textHeight) / 3.3;

        // Iterate through the lines and draw each one separately
        for (let i = 0; i < lines.length; i++) {
            context.fillText(lines[i], startX, startY + i * lineHeight);
        }
    }

    //create canvas
    const canvas = Canvas.createCanvas(1920, 1080)
    const context = canvas.getContext('2d');

    //load information champions, items, runes, shard
    const champions = Object.keys(champions_es.data)
    const items = Object.keys(items_es.data)

    //get runes as a dictionary already mix it 
    const runes = getRandomRune(runes_es, 0)
    const shard = getRamdomShard()

    //load all the whitelistItems
    const whitelist = new Set(
        allItems.LegendaryItems
    );
    const selectedItems = new Set();
    const itemImages = [];

    //generateRandom Champion
    let RandomChampion = champions[getRandom(champions, 0)]

    //load champions
    const champion = await Canvas.loadImage(`./public/LeagueOfLegendsSource/champion/${RandomChampion}.png`);

    //load runes1
    const rune1Sub1 = await Canvas.loadImage(`./public/LeagueOfLegendsSource/${runes_es[runes.runes.first].slots[0].runes[runes.subRunesA.A].icon}`);
    const rune1Sub2 = await Canvas.loadImage(`./public/LeagueOfLegendsSource/${runes_es[runes.runes.first].slots[1].runes[runes.subRunesA.B].icon}`);
    const rune1Sub3 = await Canvas.loadImage(`./public/LeagueOfLegendsSource/${runes_es[runes.runes.first].slots[2].runes[runes.subRunesA.C].icon}`);
    const rune1Sub4 = await Canvas.loadImage(`./public/LeagueOfLegendsSource/${runes_es[runes.runes.first].slots[3].runes[runes.subRunesA.D].icon}`);

    //load runes2
    const rune2Sub1 = await Canvas.loadImage(`./public/LeagueOfLegendsSource/${runes_es[runes.runes.second].slots[runes.RandomRunesB.first].runes[runes.subRunesB.A].icon}`);
    const rune2Sub2 = await Canvas.loadImage(`./public/LeagueOfLegendsSource/${runes_es[runes.runes.second].slots[runes.RandomRunesB.second].runes[runes.subRunesB.B].icon}`);

    //loadShards
    const shard1 = await Canvas.loadImage(`./public/LeagueOfLegendsSource/perk-images/StatMods/${shard[0]}.png`);
    const shard2 = await Canvas.loadImage(`./public/LeagueOfLegendsSource/perk-images/StatMods/${shard[1]}.png`);
    const shard3 = await Canvas.loadImage(`./public/LeagueOfLegendsSource/perk-images/StatMods/${shard[2]}.png`);

    const laneIco = await Canvas.loadImage(`./public/LeagueOfLegendsSource/lanes/${lane}.png`);


    // Draw the canvas
    context.fillStyle = "#181b1d";
    // draw Background
    context.fillRect(0, 0, canvas.width, canvas.height);
    //draw champiton
    context.drawImage(champion, 50, 100, canvas.width / 5, canvas.height / 3);
    //draw lane
    context.drawImage(laneIco, 1500, 100, canvas.width / 11, canvas.height / 7);


    //drawn runes
    context.drawImage(rune1Sub1, 130, 480, canvas.width / 8, canvas.height / 5);
    context.drawImage(rune1Sub2, 200, 700, canvas.width / 20, canvas.height / 10.5);
    context.drawImage(rune1Sub3, 200, 820, canvas.width / 20, canvas.height / 10.5);
    context.drawImage(rune1Sub4, 200, 950, canvas.width / 20, canvas.height / 10.5);

    // draw runes2
    context.drawImage(rune2Sub1, 350, 700, canvas.width / 20, canvas.height / 10.5);
    context.drawImage(rune2Sub2, 350, 820, canvas.width / 20, canvas.height / 10.5);

    // draw shards 

    context.drawImage(shard1, 500, 700, canvas.width / 20, canvas.height / 10.5);
    context.drawImage(shard2, 500, 820, canvas.width / 20, canvas.height / 10.5);
    context.drawImage(shard3, 500, 950, canvas.width / 20, canvas.height / 10.5);

    //suport or jg selector

    if (lane == 'supp' || lane == 'jg') {
        context.font = '30px sans-serif';
        context.fillStyle = '#ffffff';
        
        context.fillText('Starter', 1308, 580, canvas.width / 2, canvas.height / 1.8);


        const itemWidth = canvas.width / 20;
        const itemHeight = canvas.height / 12;
        if (lane == 'supp') {
            const starter = await Canvas.loadImage(`./public/LeagueOfLegendsSource/item/${allItems.suppStarterItems[getRandom(allItems.suppStarterItems, 0)]}.png`)
            console.log(starter)
            context.drawImage(starter, 1300, canvas.height / 2.4, itemWidth, itemHeight);
        } else {
            const starter = await Canvas.loadImage(`./public/LeagueOfLegendsSource/item/${allItems.jungleStarter[getRandom(allItems.jungleStarter, 0)]}.png`)
            context.drawImage(starter, 1300, canvas.height / 2.4, itemWidth, itemHeight);

        }
        context.strokeStyle = 'black';
        context.lineWidth = 10; // Adjust this value to change the stroke width
        context.strokeRect(1300, canvas.height / 2.4, itemWidth, itemHeight);

    }

    await loadItems()
    await loadText()
    return canvas
}

