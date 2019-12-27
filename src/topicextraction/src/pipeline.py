import json

from scipy.sparse import vstack, csr_matrix
from sklearn.metrics import silhouette_samples
import numpy as np

from src.topicextraction.src.Linearization.linearization import mapToSpaceSampling, computeClusterTopography
from src.topicextraction.src.Embedding.embedding import Embedding
from src.topicextraction.src.Input.input import DataPreprocessor
from src.topicextraction.src.Topicextraction.topicextraction import TopicExtraction
from src.topicextraction.src.Clustering.clustering import Clustering
from src.topicextraction.src.Planereduction.planereduction import PlaneReduction
from src.topicextraction.src.Debug.debug import Debug
import psycopg2

from sklearn.pipeline import Pipeline



#with open('../../../assets/secrets/postgres_password') as password_file:
#    password = password_file.read().strip()
#    conn = psycopg2.connect(dbname="ikon", user="ikonuser", password=password, port=5432, host='localhost')

#traindata = DataPreprocessor('''SELECT FIRST(project_abstract), FIRST(id), FIRST(title) \
#                                FROM projects \
#                                WHERE project_abstract NOT LIKE '%Keine Zusammenfassung%' \
#                                GROUP BY project_abstract \
#                                ;''', conn)

#with open('../../../assets/data/nlp/train', 'w') as f:
#    json.dump([[x for x in traindata],traindata.getIDs(), traindata.getTitles()], f)

#mfndata = DataPreprocessor('''SELECT summary, id, titelprojekt \
#                        FROM mfnprojects \
#                        WHERE summary NOT LIKE '%Zusammenfassung%';''', conn)

#with open('../../../assets/data/nlp/test', 'w') as f:
#    json.dump([[x for x in mfndata],mfndata.getIDs(), mfndata.getTitles()], f)


with open('../../../assets/data/nlp/train') as f:
    train, *rest = json.load(f)

with open('../../../assets/data/nlp/test') as f:
    test, ids, titles = json.load(f)

pipe = Pipeline([('Embedding', Embedding(method='tfidf')),
                 ('EmbeddingData', Debug()),
                 ('step2', TopicExtraction(40)),
                 ('TopicExtractionData', Debug()),
                 ('Clustering', Clustering(5)),
                 ('step4', PlaneReduction(2))], './', verbose=True)

data = tuple([tuple(i) for i in train[:100] + test])
tfs_plane, labels = pipe.fit_transform(data)

tfs_reduced = pipe.named_steps.TopicExtractionData.data[-len(test):]

subpipe = pipe[:3]
# compute linearization
#tfs_mapped = mapToSpaceSampling(tfs_plane)

# compute top words
cluster_words = subpipe.inverse_transform(pipe.named_steps.Clustering.selector.cluster_centers_)
top_words = subpipe.inverse_transform(tfs_reduced)

print(cluster_words)

# compute cluster topography
similarity_to_cluster_centers = silhouette_samples(tfs_plane, labels=labels)

interpolated_topography = np.array([1] * (
        400 * 600))


