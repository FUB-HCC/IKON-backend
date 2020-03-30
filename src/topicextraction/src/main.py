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


models = {
	'TfIdf': Embedding(method='TfIdf'),
	'Doc2Vec': Embedding(method='Doc2Vec'),
	'BERT': Embedding(method='BERT')
}

@app.post("/embedding")
def topic_extraction(descriptions: List[str], method: Model = Model.Doc2Vec):
    
    pipe = Pipeline([('Preprocessing', Preprocessing()),
                 ('Embedding',  models[method]),
                 ('TopicExtraction', TopicExtraction(50, method='LSA')),
                 ('TopicExtractionData', Debug()),
                 ('Clustering', Clustering(10, method='KMEANS')),
                 ('PlaneReduction', PlaneReduction(2, method='TSNE', perplexity=10, learning_rate=100))], verbose=True)

    tfs_plane, labels = pipe.fit_transform(descriptions)

    tfs_reduced = pipe.named_steps.TopicExtractionData.data

    # compute linearization
    tfs_mapped = mapToSpaceSampling(tfs_plane)

    # compute cluster topography
    similarity_to_cluster_centers = silhouette_samples(tfs_plane, labels=labels)

    interpolated_topography = computeClusterTopography(tfs_mapped, silhouette_samples(tfs_reduced, labels), 200, 200, 'linear')

    return {
            'project_data': [{'mappoint':mappoint, 'cluster':cluster} for mappoint, cluster in zip(
                tfs_mapped.tolist(),
                labels.tolist(),
            )],
            'cluster_data': {
                'cluster_colour': d3['Category20'][20]
            },
            'cluster_topography': np.flip(interpolated_topography, axis=0).flatten().tolist(),
            'topography_width': 200,
            'topography_height': 200
        }
