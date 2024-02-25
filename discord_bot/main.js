import Web3 from 'web3';
import Web3WsProvider from 'web3-providers-ws';
import {
    sendWebhook
} from './discord_webhooks.js';
import axios from 'axios';
import dotenv from 'dotenv'
dotenv.config()


async function getPNGLink(tokenID) {
    try {
        const response = await axios.get(`http://ipfs_api:5000/upload/${tokenID}/`);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}


const options = {
    // Enable auto reconnection
    clientConfig: {
        keepalive: true,
        keepaliveInterval: 60000
    },
    reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: false
    }
};

var provider = new Web3WsProvider(process.env.NODE, options)

const web3js = new Web3(provider);

let options721 = {
    address: "0x595A8974C1473717c4B5D456350Cd594d9bdA687",
    topics: [
        web3js.utils.sha3('Transfer(address,address,uint256)')
    ]
};
let subscription721 = web3js.eth.subscribe('logs', options721);

subscription721.on('data', async event => {
    if (event.topics.length == 4) {
        let transaction = web3js.eth.abi.decodeLog([{
                type: 'address',
                name: 'from',
                indexed: true
            }, {
                type: 'address',
                name: 'to',
                indexed: true
            }, {
                type: 'uint256',
                name: 'tokenId',
                indexed: true
            }],
            event.data,
            [event.topics[1], event.topics[2], event.topics[3]]);

        try {

            if (transaction.from === '0x0000000000000000000000000000000000000000') {


                console.log(`\n` +
                    `New ERC-712 transaction found in block ${event.blockNumber} with hash ${event.transactionHash}\n` +
                    `From: ${(transaction.from === '0x0000000000000000000000000000000000000000') ? 'New mint!' : transaction.from}\n` +
                    `To: ${transaction.to}\n` +
                    `Token contract: Mpunks\n` +
                    `Token ID: ${transaction.tokenId}`
                );

                let update = `Mint of Mpunk ${transaction.tokenId}`;

                let link;

                while(true) {
                    try {
                        link = await getPNGLink(transaction.tokenId);
                        if(link.link !== 'Mpunk does not exist') {
                            break;
                        }
                    } catch(err) {
                        // handle error
                        console.log("error with fetching link")
                    }
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
                
                sendWebhook(update, parseInt(transaction.tokenId), transaction.from, transaction.to, event.transactionHash, event.blockNumber, link.link)
            }


        } catch (err) {
            console.log(err)
        }

    }
})


subscription721.on('error', err => {
    console.log(err)
});

subscription721.on('connected', nr => console.log('Subscription on ERC-721 started with ID %s', nr));