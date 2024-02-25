import {
    EmbedBuilder,
    WebhookClient
} from 'discord.js'
import dotenv from 'dotenv'
import axios from 'axios';
import { assetsToPunkId } from './assets.js';
dotenv.config()


const webhookClient = new WebhookClient({
    url: process.env.DISCORD
});

async function getMetaData(tokenID) {
    while(true) {
    try {
        const response = await axios.get(`https://api.mpunks.org/metadata/${tokenID}/`);
        return response.data;
    } catch (error) {
        console.error("metadata error");
    }
    await new Promise(resolve => setTimeout(resolve, 5000));
}
}

async function constructMetadata(metadata) {
    let values = '';
    for (const attribute in metadata.attributes) {
        if (attribute < metadata.attributes.length - 1) {
            values += metadata.attributes[attribute].value + ', ';
        } else {
            values += metadata.attributes[attribute].value;
        }
    }

    return values;
}

async function checkBurnable(tokenID) {
    let res = await getMetaData(tokenID);
    let metadata = await constructMetadata(res);

    if (metadata in assetsToPunkId) {
        return assetsToPunkId[attribute];
    }

    return -1;

}

async function getPoolNonces() {
    while(true) {
    try {
        const response = await axios.get(`http://mpunkspool.com/nonces.txt`);
        return response.data;
    } catch (error) {
        console.error("pool nonces errors");
    }
    await new Promise(resolve => setTimeout(resolve, 5000));
}
}

//Embeds allow masked links (e.g. [Guide](https://discordjs.guide/ 'optional hovertext')), but only in description and field values

export async function sendWebhook(update, tokenID, from, to, txId, block, imageLink) {
    const embed = new EmbedBuilder()
        .setTitle(update)
        .setURL(`https://etherscan.io/tx/${txId}`)
        .setColor(0x00FFFF)
        .setThumbnail(imageLink) //enter mpunk image link
        .addFields({
            name: 'From',
            value: from
        }, {
            name: '\u200B',
            value: '\u200B'
        }, {
            name: 'To',
            value: to
        }, )
        .setTimestamp();

    // if (true) {
    //     embed.setDescription(`[This asset is burnable as its identical to OG CryptoPunk #${5600}](https://opensea.io/assets/ethereum/0x595a8974c1473717c4b5d456350cd594d9bda687/11725)`);
    // }

    try {

        let burnableID = await checkBurnable(tokenID);

        if (burnableID != -1) {
            embed.setDescription(`This asset is really burnable as its identical to OG CryptoPunk #${burnableID}`);
        }
    } catch (err) {
        console.log(err)
    }

    try {

        let poolNonces = await getPoolNonces()
        const punkValues = poolNonces.map(object => object.punk).slice(0, 10);
        let metadata = await getMetaData(tokenID);
        metadata = await constructMetadata(metadata);


        if (punkValues.includes(metadata)) {
            console.log("Mined in pool")
            embed.setFooter({
                text: `Mined in Pool • Block: ${block}`
            });
        } else {
            embed.setFooter({
                text: `Block ${block}`
            });
        }
    } catch (err) {
        embed.setFooter({
            text: `Block ${block}`
        });
    }


    webhookClient.send({
        username: 'Mpunk Status Bot',
        avatarURL: 'https://cdn.discordapp.com/icons/892979774488711168/a591c85498c01f94d7a872ec93c49402.webp?size=1024',
        embeds: [embed],
    });
}