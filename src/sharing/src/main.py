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
    """
    This method returns all keys of the OrderedShelf.
    :return: List of all Keys in the OrderedShelf
    """
    with OrderedShelf('/cache.db', size=100) as hashtable:
        return list(hashtable.keys())

@app.get("/sharing/{state_name}")
def get_state(state_name: constr(max_length=60)) -> str:
    """
    This method retrieves a state given its name.
    :param state_name: Key of the state which should be retrieved
    :return: Returns marshalled JSON state (the same format it was saved in)
    """
    state_name = unquote(state_name)
    with OrderedShelf('/cache.db', size=100) as hashtable:
        try:
            return hashtable[state_name]
        except:
            raise HTTPException(status_code=404, detail="Key not in cache") 

@app.post("/sharing/{state_name}")
def post_state(state_name: str, state: str = Body(...)) -> None:
    """
    This method saves a state given a name.
    :param state_name: Key of the state which should be saved
    :param state: Marshalled version of the state
    """
    state_name = unquote(state_name)
    with OrderedShelf('/cache.db', size=100) as hashtable:
        try:
            hashtable[state_name] = state
        except:
            raise HTTPException(status_code=409, detail="Duplicate state name")
    
