from typing import List
from enum import Enum

from fastapi import FastAPI
from starlette.middleware.gzip import GZipMiddleware
from pydantic import BaseModel

from sklearn.metrics import silhouette_samples
from sklearn.pipeline import Pipeline
import numpy as np
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
    HDP = "HDP"

preprocessing = Preprocessing(workers=1)

models = {
    'HDP': Embedding(method='HDP')
}

@app.post("/embedding")
def topic_extraction(descriptions: List[str], method: Model = Model.HDP):
    """
    This method ties all steps of the topic extraction together and performs the computations which are send to its endpoint.

    :param descriptions: This is the list of texts on which the topic extraction should be performed.
    :param method: This is the name of the model which is used for the embedding step. Currently only the HDP model is enabled.
    :return: The method returns a JSON formatted string which includes information concerning the data points and their embeddings and uncertainties as well as the cluster topography and its dimensions.
    """
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
            'cluster_topography': np.flip(interpolated_topography.T, axis=0).flatten().tolist(),
            'topography_width': 200,
            'topography_height': 200
        }
