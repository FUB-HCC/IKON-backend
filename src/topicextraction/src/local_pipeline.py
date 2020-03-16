import json

from scipy.sparse import vstack, csr_matrix
from sklearn.metrics import silhouette_samples
import numpy as np
import os

from pipeline import compute_topicextraction
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

data = compute_topicextraction(train, test, viz='linearized')
print(data)

import matplotlib.pyplot as plt
plt.imshow(np.array(data['cluster_topography']).reshape((data['topography_width'],data['topography_height'])), cmap='hot', interpolation='nearest')
plt.show()

plt.scatter(*zip(*[x['mappoint'] for x in data['project_data']]))
plt.show()