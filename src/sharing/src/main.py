from typing import List
from urllib.parse import unquote

from orderedshelf import OrderedShelf

from fastapi import FastAPI, HTTPException, Body
from starlette.middleware.gzip import GZipMiddleware
from pydantic import BaseModel, constr, Json

app = FastAPI()

app.add_middleware(GZipMiddleware)

class Description(BaseModel):
    id: int
    text: str

class Embeddings(BaseModel):
    id: int
    description: str

@app.get("/sharing/")
def get_all_keys() -> List[str]:
    with OrderedShelf('/cache.db', size=100) as hashtable:
        return list(hashtable.keys())

@app.get("/sharing/{state_name}")
def get_state(state_name: constr(max_length=30)) -> str:
    state_name = unquote(state_name)
    with OrderedShelf('/cache.db', size=100) as hashtable:
        try:
            return hashtable[state_name]
        except:
            raise HTTPException(status_code=404, detail="Key not in cache") 

@app.post("/sharing/{state_name}")
def post_state(state_name: str, state: str = Body(...)) -> None:
    state_name = unquote(state_name)
    with OrderedShelf('/cache.db', size=100) as hashtable:
        try:
            hashtable[state_name] = state
        except:
            raise HTTPException(status_code=409, detail="Duplicate state name") 
    return 
    
