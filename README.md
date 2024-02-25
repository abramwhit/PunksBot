
# Mpunks Mint Alert Bot

This bot has a subscription with an ETH node. When the Mpunks contract has a mint it posts to a discord webhook.

The python api is required to render the Mpunks image on discord. Since the natural image is in SVG format, it is unsupported in discord.  To overcome this, the python api converts SVG to PNG and then uploads to IPFS. This IPFS link is then rendered in discord. The IPFS client used is Pinata.




## Deployment

- `git clone https://github.com/mgpai22/mpunks-mint-alert-bot.git && cd mpunks-mint-alert-bot`
- Fill in all the `environment` variables in the `docker-compose.yml` file
    - Get all the Pinata information [here](https://app.pinata.cloud/developers/api-keys)
    - For `NODE` make sure to use a websocket link (ws/wss)
    - For `DISCORD` use a discord webhook (found within the settings of channels)
- Install [Docker](https://docs.docker.com/get-docker/)
- run `docker-compose up -d`
    - to stop run `docker-compose down`
    - if you modified something and want to start it back up run `docker-compose up -d --build`


