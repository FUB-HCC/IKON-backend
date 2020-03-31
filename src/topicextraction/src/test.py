from typing import List

from scipy.sparse import vstack, csr_matrix
from sklearn.metrics import silhouette_samples
from sklearn.pipeline import Pipeline
import numpy as np
from bokeh.palettes import d3

from Preprocessing.preprocessing import Preprocessing
from Embedding.embedding import Embedding
from Topicextraction.topicextraction import TopicExtraction
from Clustering.clustering import Clustering
from Planereduction.planereduction import PlaneReduction
from Linearization.linearization import mapToSpaceSampling, computeClusterTopography
from Debug.debug import Debug

# preload preprocessor
print('Starting to load the NLP engine')
preprocessor = Preprocessing()

# preload models
print('Starting to load the models')

models = {
	#'Doc2Vec': Embedding(method='Doc2Vec'),
	'TfIdf': Embedding(method='TfIdf', dict_path='../../../assets/models/tfidf/dict.lzma', model_path='../../../assets/models/tfidf/tfidf.lzma'),
	#'BERT': Embedding(method='BERT')
}

print('Finished loading')

descriptions = [
        "Ich habe aua!",
        "Dies ist nicht gut, aber was solls.",
        "Das ist echt langweilig"
]

pipe = Pipeline([('Preprocessing', preprocessor),
                 ('Embedding', models['TfIdf']),
                 ('TopicExtraction', TopicExtraction(50, method='LSA')),
                 ('TopicExtractionData', Debug()),
                 ('Clustering', Clustering(2, method='KMEANS')),
                 ('PlaneReduction', PlaneReduction(2, method='TSNE', perplexity=10, learning_rate=100))])

tfs_plane, labels = pipe.fit_transform(descriptions)

tfs_reduced = pipe.named_steps.TopicExtractionData.data

# compute linearization
tfs_mapped = mapToSpaceSampling(tfs_plane)

# compute cluster topography
similarity_to_cluster_centers = silhouette_samples(tfs_plane, labels=labels)

interpolated_topography = computeClusterTopography(tfs_mapped, silhouette_samples(tfs_reduced, labels), 200, 200, 'linear')
