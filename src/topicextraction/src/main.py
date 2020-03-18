import json
from typing import List
import socket

from fastapi import FastAPI
from starlette.middleware.gzip import GZipMiddleware
from pydantic import BaseModel

from bert_serving.client import BertClient

from scipy.sparse import vstack, csr_matrix
from sklearn.metrics import silhouette_samples
from sklearn.pipeline import Pipeline
import numpy as np
from bokeh.palettes import d3

from Topicextraction.topicextraction import TopicExtraction
from Clustering.clustering import Clustering
from Planereduction.planereduction import PlaneReduction
from Linearization.linearization import mapToSpaceSampling, computeClusterTopography
from Debug.debug import Debug

app = FastAPI()

app.add_middleware(GZipMiddleware)

class Description(BaseModel):
    id: int
    text: str

class Embeddings(BaseModel):
    id: int
    description: str


@app.post("/embedding")
def topic_extraction(descriptions: List[Description]):
    bc = BertClient(ip=socket.gethostbyname_ex('BERTaaSIKON')[2][0])
    embedding = bc.encode([x.text[:10] for x in descriptions])
    print(embedding.shape)

    pipe = Pipeline([('TopicExtraction', TopicExtraction(50, method='LSA')),
    				 ('TopicExtractionData', Debug()),
                     ('Clustering', Clustering(20, method='KMEANS')),
                     ('PlaneReduction', PlaneReduction(2, method='TSNE', perplexity=10, learning_rate=100))], verbose=True)

    tfs_plane, labels = pipe.fit_transform(embedding)

    tfs_reduced = pipe.named_steps.TopicExtractionData.data

    # compute linearization
    tfs_mapped = mapToSpaceSampling(tfs_plane)

    # compute cluster topography
    similarity_to_cluster_centers = silhouette_samples(tfs_plane, labels=labels)

    interpolated_topography = computeClusterTopography(tfs_mapped, silhouette_samples(tfs_reduced, labels), 200, 200, 'linear')

    return {
            'project_data': [{'id':pid, 'mappoint':mappoint, 'cluster':cluster} for pid, mappoint, cluster in zip(
                [x.id for x in descriptions],
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
