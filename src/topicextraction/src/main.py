import json

from fastapi import FastAPI
from starlette.middleware.gzip import GZipMiddleware
from pipeline import compute_topicextraction

with open('/data/train') as f:
    train, *rest = json.load(f)

with open('/data/test') as f:
    test, ids, titles = json.load(f)



app = FastAPI()

app.add_middleware(GZipMiddleware)

@app.get("/clustering")
def read_root(embedding: str='tfidf', dimreduction: str='lsa', clustering: str='kmeans', planereduction: str='tsne', num_topics: int=20, granularity: int=5, perplexity: int=5, learning_rate: int=200,  interpolation: str='linear', viz: str='scatter', width: int=400, height: int=600):
    return compute_topicextraction(train, test, embedding, dimreduction, clustering, planereduction, num_topics, granularity, perplexity, learning_rate,  interpolation, viz, width, height)
