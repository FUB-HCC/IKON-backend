import os, sys
print (os.getcwd())
from Embedding.embedding import Embedding
from Topicextraction.topicextraction import TopicExtraction
from Clustering.clustering import Clustering
from Planereduction.planereduction import PlaneReduction
from Linearization.linearization import mapToSpaceSampling, computeClusterTopography
from Debug.debug import Debug

from scipy.sparse import vstack, csr_matrix
from sklearn.metrics import silhouette_samples
from sklearn.pipeline import Pipeline
import numpy as np
from bokeh.palettes import d3

def compute_topicextraction(train, test, embedding: str='tfidf', dimreduction: str='lsa', clustering: str='kmeans', planereduction: str='tsne', num_topics: int=20, granularity: int=5, perplexity: int=5, learning_rate: int=200,  interpolation: str='linear', viz: str='linearized', width: int=400, height: int=600):
    pipe = Pipeline([('Embedding', Embedding(method=embedding)),
                         ('EmbeddingData', Debug()),
                         ('TopicExtraction', TopicExtraction(num_topics, method=dimreduction)),
                         ('TopicExtractionData', Debug()),
                         ('Clustering', Clustering(granularity, method=clustering)),
                         ('PlaneReduction', PlaneReduction(2, method=planereduction, perplexity=perplexity, learning_rate=learning_rate))], './', verbose=True)


    data = tuple([tuple(i) for i in train[0][:100] + test[0]])
    tfs_plane, labels = pipe.fit_transform(data)
    tfs_plane = tfs_plane[-len(test):]
    labels = labels[-len(test):]

    tfs_reduced = pipe.named_steps.TopicExtractionData.data[-len(test):]

    subpipe = pipe[:3]

    # compute linearization
    tfs_mapped = mapToSpaceSampling(tfs_plane)

    # compute top words
    cluster_words = subpipe.inverse_transform(pipe.named_steps.Clustering.selector.cluster_centers_)
    top_words = subpipe.inverse_transform(tfs_reduced)

    # compute cluster topography
    similarity_to_cluster_centers = silhouette_samples(tfs_plane, labels=labels)

    interpolated_topography = computeClusterTopography(tfs_plane if viz == 'scatter' else tfs_mapped, silhouette_samples(tfs_reduced, labels), width, height, interpolation)

    return {
            'params': {
                'dimreduction': dimreduction,
                'clustering': clustering,
                'embedding': embedding,
                'num_topics': num_topics,
                'num_clusters': granularity,
                'perplexity': perplexity,
                'learning_rate': learning_rate
            },
            'project_data': [{'id':pid,'reducedpoint': reducedpoint, 'embpoint':embpoint, 'mappoint':mappoint, 'cluster':cluster, 'error':error, 'title': title, 'words': words} for pid, reducedpoint, embpoint, mappoint, cluster, error, title, words in zip(
                test[1],
                tfs_reduced.tolist(),
                tfs_plane.tolist(),
                tfs_mapped.tolist(),
                labels.tolist(),
                similarity_to_cluster_centers.tolist(),
                test[2],
                top_words.tolist()

            )],
            'cluster_data': {
                'cluster_words': cluster_words.tolist(),
                'cluster_colour': d3['Category20'][granularity]
            },
            'cluster_topography': np.flip(interpolated_topography, axis=0).flatten().tolist(),
            'topography_width': width,
            'topography_height': height
        }


