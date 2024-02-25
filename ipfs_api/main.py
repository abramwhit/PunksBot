import asyncio
from fastapi import FastAPI, status
import cairosvg
from fastapi.responses import JSONResponse
from SQL_functions import write_to_mpunks_table, query_mpunks_table
from ipfs import main

app = FastAPI()


def convert_and_upload(token_id):
    try:
        query = query_mpunks_table("mpunks", "mpunks_table", token_id)
        if query is not None:
            return query[1]
    except Exception as e:
        pass
    try:
        cairosvg.svg2png(url=f'https://api.mpunks.org/image/{token_id}.svg', write_to=f'./data/{token_id}.png', scale=100)
    except Exception as e:
        return "Not Found"

    file = f'./data/{token_id}.png'

    # asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    res = asyncio.run(main(file))

    link = res['value']['cid']

    try:
        write_to_mpunks_table("mpunks", "mpunks_table", token_id, link)
    except Exception as e:
        return None
    return link


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/upload/{token_id}")
async def say_hello(token_id):
    try:
        token_id = int(token_id)
    except Exception as e:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"link": f"Must be an int"})
    if not isinstance(token_id, int):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"link": f"Must be an int"})

    if token_id < 10000 or token_id > 20000:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"link": f"Mpunk must be between 10000 and 20000"})
    link = convert_and_upload(token_id)
    if link == "Not Found":
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST,
                            content={"link": f"Mpunk does not exist"})
    return {"link": f"https://nftstorage.link/ipfs/{link}"}
