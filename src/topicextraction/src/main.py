import json

from fastapi import FastAPI
from starlette.middleware.gzip import GZipMiddleware




app = FastAPI()

app.add_middleware(GZipMiddleware)

@app.get("/clustering")
def read_root(targetDim: int=2,dimreduction: str='LSA', clustering: str='KMEANS', embedding: str='LDA', num_topics: int=20, granularity: int=5, perplexity: int=5, learning_rate: int=200, error: str='cluster_error', interpolation: str='linear', viz: str='scatter', width: int=400, height: int=600):
    with open('/data/c4-t50_LDA.json') as file:
        return json.load(file)
