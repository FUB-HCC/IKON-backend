from typing import List
from enum import Enum

from fastapi import FastAPI
from starlette.middleware.gzip import GZipMiddleware
from pydantic import BaseModel

from sklearn.pipeline import Pipeline
import numpy as np
from scipy.stats import entropy
from scipy.spatial.distance import jensenshannon

from Preprocessing.preprocessing import Preprocessing
from Embedding.embedding import Embedding
from Planereduction.planereduction import PlaneReduction
from Linearization.linearization import mapToSpaceSampling, computeClusterTopography
from Debug.debug import Debug

app = FastAPI()
app.add_middleware(GZipMiddleware)

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
         ('Embedding',  models["HDP"]),
         ('EmbeddingData', Debug()),
         ('PlaneReduction', PlaneReduction(2, method='TSNE', metric=jensenshannon))], verbose=True)

    tfs_plane = pipe.fit_transform(descriptions)

    # compute cluster topography
    print(pipe.named_steps.EmbeddingData.data.sum(axis=1))
    uncertainty = entropy(pipe.named_steps.EmbeddingData.data, axis=1)

    # compute linearization
    tfs_mapped = mapToSpaceSampling(tfs_plane)

    interpolated_topography = computeClusterTopography(tfs_mapped, uncertainty, 200, 200, 'cubic')

    return {
            'project_data': [{'mappoint':mappoint, 'entropy': entropy} for mappoint, entropy in zip(
                tfs_mapped.tolist(),
                uncertainty.tolist()
            )],
            'cluster_topography': np.flip(interpolated_topography.T, axis=0).flatten().tolist(),
            'topography_width': 200,
            'topography_height': 200
        }
