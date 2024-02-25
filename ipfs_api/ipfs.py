import aiohttp
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()


async def main(file: str):

    headers = {
        "Authorization": f"Bearer {os.getenv('NFT_STORAGE_API_KEY')}",
        "Content-Type": "image/png"
    }
    async with aiohttp.ClientSession() as session:
        data = open(file, 'rb').read()
        async with session.post("https://api.nft.storage/upload", headers=headers, data=data) as resp:
            return await resp.json()

#
# asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
#
# response = asyncio.run(main())
# print(response['value']['cid'])
