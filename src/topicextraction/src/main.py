from typing import List
from enum import Enum

from fastapi import FastAPI
from starlette.middleware.gzip import GZipMiddleware
from pydantic import BaseModel

from sklearn.metrics import silhouette_samples
from sklearn.pipeline import Pipeline
import numpy as np
from bokeh.palettes import d3
import functools
from scipy.stats import entropy

from Preprocessing.preprocessing import Preprocessing
from Embedding.embedding import Embedding
from Topicextraction.topicextraction import TopicExtraction
from Clustering.clustering import Clustering
from Planereduction.planereduction import PlaneReduction
from Linearization.linearization import mapToSpaceSampling, computeClusterTopography
from Debug.debug import Debug

app = FastAPI()

app.add_middleware(GZipMiddleware)

class Embeddings(BaseModel):
    id: int
    description: str


class Model(str, Enum):
    TfIdf = "TfIdf"
    Doc2Vec = "Doc2Vec"
    BERT = "BERT"
    HDP = "HDP"

preprocessing = Preprocessing(workers=1)

models = {
    'TfIdf': Embedding(method='TfIdf'),
    'Doc2Vec': Embedding(method='Doc2Vec'),
    'BERT': Embedding(method='BERT'),
    'HDP': Embedding(method='HDP')
}

@app.post("/embedding")
def topic_extraction(descriptions: List[str], method: Model = Model.HDP):
    
    pipe = Pipeline([('Preprocessing', preprocessing),
                 ('Embedding',  models[method]),
                 ('EmbeddingData', Debug()),
                 ('TopicExtraction', TopicExtraction(50, method='LSA')),
                 ('Clustering', Clustering(10, method='KMEANS')),
                 ('PlaneReduction', PlaneReduction(2, method='TSNE', perplexity=10, learning_rate=100))], verbose=True)

    tfs_plane, labels = pipe.fit_transform(descriptions)

    # compute linearization
    tfs_mapped = mapToSpaceSampling(tfs_plane)

    # compute cluster topography
    uncertainty = entropy(np.array(pipe.named_steps.EmbeddingData.data.todense()).T)

    interpolated_topography = computeClusterTopography(tfs_mapped, uncertainty, 200, 200, 'cubic')

    return {
            'project_data': [{'mappoint':mappoint, 'cluster':cluster, 'entropy': entropy} for mappoint, cluster, entropy in zip(
                tfs_mapped.tolist(),
                labels.tolist(),
                uncertainty.tolist()
            )],
            'cluster_data': {
                'cluster_colour': d3['Category20'][20]
            },
            'cluster_topography': np.flip(interpolated_topography.T, axis=0).flatten().tolist(),
            'topography_width': 200,
            'topography_height': 200
        }
