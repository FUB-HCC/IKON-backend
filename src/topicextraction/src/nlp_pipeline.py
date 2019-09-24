
# coding: utf-8

# # Topic extraction from the GEPRiS dataset and creation of an user-centric visualisation
# Author: Tim Korjakow        
# Summer term 2018      
# Freie Universität Berlin     
# Fachgebiet Human-Centered Computing

# ![Process graph](nlpflowchart.svg)

# In[1]:


# general imports
import numpy as np
#import sklearn
import os

# data wrangling
import json
import spacy
spacy.prefer_gpu()
from spacy_langdetect import LanguageDetector
import psycopg2
from multiprocessing import Pool, cpu_count

# document embedding
from gensim.models import TfidfModel
from gensim.corpora import Dictionary
from gensim.matutils import corpus2csc
from gensim.models.doc2vec import Doc2Vec, TaggedDocument
from gensim.test.utils import get_tmpfile
from gensim.parsing.preprocessing import preprocess_string, STOPWORDS, strip_tags, strip_punctuation, strip_multiple_whitespaces, strip_numeric, strip_short
import scipy

# topic extraction
from sklearn.decomposition import TruncatedSVD
from sklearn.decomposition import NMF as NonnegativeMatrixFactorization
from gensim.models.coherencemodel import CoherenceModel
import keras
from sklearn.preprocessing import normalize


#clustering
from numpy import triu_indices
from sklearn.cluster import KMeans, AgglomerativeClustering, FeatureAgglomeration
from sklearn.neighbors import radius_neighbors_graph

# projection into 2d
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.manifold import TSNE

# linearization
from lapjv import lapjv
from scipy.spatial.distance import cdist
from scipy.interpolate import griddata
from numpy.linalg import norm
from sklearn.preprocessing import normalize

# quality metrics of the clustering
from sklearn.metrics import silhouette_samples

import pickle



# ## Loading and Cleaning
# The first step in every NLP project which works with texts is always the preparation of the input data. In this example the Project dump from GEPRIS is loaded and the project descriptions are extracted. After that the texts get cleaned by removing all non-alphabetic chars and all stopwords from the texts. English texts are getting filtered in oder to make the analysis simpler and more comparable.

# In[ ]:

with open(os.environ['PG_PASSWORD']) as password_file:
    password = password_file.read().strip()
    conn = psycopg2.connect(dbname="ikon", user="ikonuser", password=password, port=5432, host='Postgres')

class DataLoader(object):
    def __init__(self, query, clean=True, stream=False, workers=cpu_count()):
        self.query = query
        self.data = self.loadFromDB(self.query).fetchall()
            
    def __iter__(self):
        self.pos = 0
        return self
    
    def __next__(self):
        if self.pos >= len(self.data):
            raise StopIteration
        self.pos += 1
        return self.data[self.pos-1]
    
    def  __getitem__(self, pos):
        text, *args = self.data[pos]
        return self.data[self.pos]
    
    def __len__(self):
        return len(self.data)
    
    def __str__(self):
        return str(self.data)
    
    def loadFromDB(self, query):
        cursor = conn.cursor()
        cursor.execute(query)
        return cursor
        
class DataPreprocessor(DataLoader):
    def __init__(self, query, clean=True, stream=False, workers=cpu_count()):
        self.query = query
        self.clean = clean
        self.nlp = spacy.load('de', disable=["ner", "tagger"])                

        data = self.chunkify(self.loadFromDB(self.query).fetchall(), workers)
        with Pool(workers) as pool:
            self.data = [item for sublist in pool.map(self.preprocessText, data) for item in sublist]
        
        self.filepath = get_tmpfile(str(hash(tuple(self.data))))
        with open(self.filepath, "w") as file:
            for text, *args in self.data:
                file.write("%s\n" % " ".join(text))
    
    def getIDs(self):
        return [id for (text, id, title) in self.data]
    
    def getTitles(self):
        return [title for (text, id, title) in self.data]
        
    def  __getitem__(self, pos):
        text, *args = self.data[pos]
        return TaggedDocument(text, [pos])

    def loadEnglishStopwords(self):
        with open('../data/stopwords_eng.json', 'r') as datafile:
            return set(json.load(datafile))
        
    def preprocessText(self, results):
        texts, *args = zip(*results)
        data = []
        for doc, *args in zip(self.nlp.pipe(texts, batch_size=100, n_threads=-1), *args):
            if(doc._.language['language'] == 'de'):
                data.append((tuple([token.lemma_ for token in doc if self.filterType(token)]), *args))
        return data
    
    def chunkify(self, lst, n):
        return [lst[i::n] for i in range(n)]
        
    def filterType(self, token):
        return token.is_alpha and not (token.is_stop or token.like_num or token.is_punct) and len(token.lemma_) > 3


# In[3]:


traindata = DataPreprocessor('''SELECT FIRST(project_abstract), FIRST(id), FIRST(title) FROM projects WHERE project_abstract NOT LIKE '%Keine Zusammenfassung%' GROUP BY project_abstract LIMIT 100;''')


# In[10]:


mfndata = DataPreprocessor('''SELECT summary, id, titelprojekt FROM mfnprojects WHERE summary NOT LIKE '%Zusammenfassung%';''')


# ## Data
# Firstly we are going to have a look at the type of texts we have:

# In[4]:


# ## Document Embedding

# ### TF-IDF
# *Summary*:
# This technique vectorizes a corpus, e.g. a collection of documents, by counting all appearences of words in the corpus and computing the tf-idf measure for each document, word pair.

# In[ ]:


class TfidfModelExtended(TfidfModel):
    def top_words(self, vector, dct=None ,topn=5):
        if isinstance(vector, scipy.sparse.csr_matrix):
            vector = vector.todense()
        return [dct.get(entry) for entry in np.argpartition(np.asarray(vector).ravel(), -topn)[-topn:]]


# In[ ]:


dct = Dictionary(doc.words for doc in traindata)  # fit dictionary')
traincorpus = [dct.doc2bow(doc.words) for doc in traindata]  # convert corpus to BoW format
tfidf_model = TfidfModelExtended(traincorpus)  # fit model')


# In[ ]:


mfncorpus = [dct.doc2bow(doc.words) for doc in mfndata]  # convert corpus to BoW format
docs_vectorized_tfidf = corpus2csc(tfidf_model[mfncorpus]).T


# ### Doc2Vec
# *Summary*:
# This technique vectorizes a corpus, e.g. a collection of documents, by counting all appearences of words in the corpus and computing the tf-idf measure for each document, word pair.

# In[ ]:


class Doc2VecExtended(Doc2Vec):
    def top_words(self, vector, dct=None, topn=5):
        return [word for word, prob in self.wv.similar_by_vector(vector, topn=topn)]


# In[ ]:


print('Doc2Vec setup and vocabulary building:')
doc2vec_model = Doc2VecExtended(corpus_file=traindata.filepath, total_words=dct.num_pos, vector_size=100, window=20, min_count=4, workers=cpu_count(), epochs=30)
print('Doc2Vec training:')
doc2vec_model.train(corpus_file=traindata.filepath, total_words=dct.num_pos, total_examples=doc2vec_model.corpus_count, epochs=doc2vec_model.epochs)


# In[ ]:


docs_vectorized_doc2vec = np.array([doc2vec_model.infer_vector(doc.words) for doc in mfndata])


# # Topic extraction

# ## Latent Semantic Analysis
# *Summary*:
# The LSA transforms an corpus from its word space given by the tf-idf matrice into its semantic space. In this semantic space the dimensions denote topics in the corpus and every document vector is a linear combination of all the implicitly extracted topics.

# In[ ]:


def LSA(tfs,num_topics=40):
    lsa = TruncatedSVD(n_components=num_topics, random_state=0).fit(tfs)
    return lsa.transform(tfs), lsa


# ## Autoencoder
# Summary: **Coming soon**

# In[ ]:


from keras.layers import Input, Dense
from keras.models import Model
from keras import regularizers

def create_autoencoder(input_dim, encoding_dim=50):
    # this is our input placeholder
    input_img = Input(shape=(input_dim,))
    # "encoded" is the encoded representation of the input
    encoded = Dense(encoding_dim, activation='relu', activity_regularizer=regularizers.l1(10e-5))(input_img)
    # "decoded" is the lossy reconstruction of the input
    decoded = Dense(input_dim, activation='sigmoid')(encoded)

    # this model maps an input to its reconstruction
    autoencoder = Model(input_img, decoded)

    # this model maps an input to its encoded representation
    encoder = Model(input_img, encoded)

    # create a placeholder for an encoded (32-dimensional) input
    encoded_input = Input(shape=(encoding_dim,))
    # retrieve the last layer of the autoencoder model
    decoder_layer = autoencoder.layers[-1]
    # create the decoder model
    decoder = Model(encoded_input, decoder_layer(encoded_input))
    autoencoder.compile(optimizer='adadelta', loss='binary_crossentropy')

    return autoencoder, encoder, decoder


# In[ ]:


input_train_doc2vec = normalize(doc2vec_model.docvecs.vectors_docs)
input_test_doc2vec = normalize(docs_vectorized_doc2vec)
autoencoder_doc2vec, encoder_doc2vec, decoder_doc2vec = create_autoencoder(doc2vec_model.docvecs.vectors_docs.shape[1])
history = autoencoder_doc2vec.fit(input_train_doc2vec, input_train_doc2vec,
                epochs=75,
                batch_size=256,
                shuffle=True,
                validation_data=(input_test_doc2vec, input_test_doc2vec),
                verbose=0)


# ## Clustering

# ### K-Means
# Summary: Given a clustering the LDA can be used to find a projection into a lower dimensional space which maximizes inter-class variance and minimizes intra-class variance. This leads to neater cluster, but is grounded in the hypotheses that the clusters have some real semantic meaning. Otherwise it may enforce preexisting biases.

# In[ ]:


def clusterNumberHeuristic(tfs):
    return (tfs.shape[0]*tfs.shape[1])//tfs.count_nonzero()

def clusterkm(tfs_reduced, num_topics=10):
    km = KMeans(n_clusters=num_topics).fit(tfs_reduced)
    return km


# ### Agglomerative Clustering

# In[17]:


ind = triu_indices(docs_vectorized_doc2vec.shape[0], 1)
wmds = np.zeros((docs_vectorized_doc2vec.shape[0], docs_vectorized_doc2vec.shape[0]))
euds = np.zeros((docs_vectorized_doc2vec.shape[0], docs_vectorized_doc2vec.shape[0]))
def symmetrize(a):
    return a + a.T - np.diag(a.diagonal())

def wmd(x):
    return doc2vec_model.wv.wmdistance(mfndata[x[0]].words, mfndata[x[1]].words)

def eud(x):
    return norm(doc2vec_model[x[0]] - doc2vec_model[x[1]])

with Pool(cpu_count()) as p:
    wmds[ind] = p.map(wmd, zip(*ind))
    euds[ind] = p.map(eud, zip(*ind))
wmds = symmetrize(wmds)
euds = symmetrize(euds)

# In[19]:


def clusterag(tfs_reduced, num_clusters=5):
    am = AgglomerativeClustering(n_clusters=num_clusters, affinity='precomputed', memory='/tmp', linkage='average').fit(wmds)
    return am


# # Embedding into 2D

# ## Linear Discriminant Analysis
# *Summary*:
# Given a clustering the LDA can be used to find a projection into a lower dimensional space which maximizes inter-class variance and minimizes intra-class variance. This leads to neater cluster, but is grounded in the hypotheses that the clusters have some real semantic meaning. Otherwise it may enforce preexisting biases.

# In[ ]:


def dimReductionLDA(tfs_reduced, clusters, targetDim=2):
    lda = LinearDiscriminantAnalysis(n_components=targetDim)
    tfs_2d = lda.fit(tfs_reduced, clusters.labels_).transform(tfs_reduced)
    return tfs_2d, lda


# ## tSNE
# *Summary*:
# 
# 
# *In-depth explanation*:

# In[ ]:


def dimReductiontSNE(tfs_reduced, perplexity=30, learning_rate=100, targetDim=2):
    print('t-SNE:')
    tfs_2d = TSNE(n_components=targetDim, perplexity=perplexity, learning_rate=learning_rate).fit_transform(tfs_reduced)
    return tfs_2d


# # Linearize results into a grid

# In[ ]:


def mapToSpaceSampling(points):
    # just take the first n² < #points Points
    points = points[: int(np.sqrt(len(points)))**2]
    grid = np.dstack(np.meshgrid(np.linspace(np.min(points[:, 0]), np.max(points[:, 0]), int(np.sqrt(len(points)))),
                       np.linspace(np.min(points[:, 1]), np.max(points[:, 1]), int(np.sqrt(len(points)))))).reshape(-1, 2)
    cost = cdist(points, grid, "sqeuclidean").astype(np.float64)
    cost *= 100000 / cost.max()
    row_ind_lapjv, col_ind_lapjv, _ = lapjv(cost, verbose=True, force_doubles=True)
    return grid[row_ind_lapjv]


# In[ ]:


def computeClusterTopography(points, values, width, height, interpolation='linear'):
    # lay grid over the points so that all points are covered
    grid_x, grid_y = np.mgrid[np.min(points[:,0]):np.max(points[:,0]):width*1j, np.min(points[:,1]):np.max(points[:,1]):height*1j]
    return griddata(np.array(points), np.array(values[:len(points)]), (grid_x, grid_y), method=interpolation, fill_value=np.min(values[:len(points)]))


# In[ ]:


def compute(tfs, emb_model, targetDim, dimreduction, clustering, embedding, num_topics, num_clusters, perplexity, learning_rate, error, interpolation, viz, width, height):
    
    if dimreduction == 'LSA':
        tfs_reduced, red_model = LSA(tfs, num_topics=num_topics)
    elif dimreduction == 'Autoencoder':
        print('Autoencoder:')
        tfs_reduced, red_model = encoder_doc2vec.predict(tfs), None
    else:
        return 'No dimensionality reduction technique was selected!'
    
    if clustering == 'KMEANS':
        clusters = clusterkm(tfs_reduced, num_topics=num_clusters)
        cluster_centers_ = clusters.cluster_centers_
    elif clustering == 'Agglomerative Clustering':
        clusters = clusterag(tfs_reduced, num_clusters=num_clusters)
        cluster_centers_ = [np.mean(tfs[clusters.labels_[clusters.labels_ == x]]) for x in range(num_clusters)]
    else:
        return 'No clustering technique was selected!'
    
    sim_kernel = 1/(1+wmds)
    if embedding == 'LDA':
        tfs_embedded, lda = dimReductionLDA(tfs_reduced, clusters=clusters, targetDim=targetDim)
    elif embedding == 'tSNE':
        tfs_embedded = dimReductiontSNE(tfs_reduced, perplexity=perplexity, learning_rate=learning_rate, targetDim=targetDim)
    else:
        return 'No dimensionality reduction technique was selected!'
    
    # compute linearization
    tfs_mapped = mapToSpaceSampling(tfs_embedded) if targetDim == 2 else np.array([[0,0]]*len(tfs_embedded)) 
    
    # compute top words
    cluster_words = [emb_model.top_words(np.mean(tfs[clusters.labels_==cluster], axis=0), dct=dct, topn=5) for cluster in range(num_clusters)]
    top_words = [emb_model.top_words(project, dct=dct, topn=5) for project in tfs]
    # compute coherence score
    cm = CoherenceModel(topics=cluster_words, window_size=10, texts=[list(doc.words) for doc in traindata], dictionary=dct, processes=cpu_count())
    
    #compute cluster topography
    similarity_to_cluster_centers = silhouette_samples(tfs_embedded, labels=clusters.labels_)
    #reduction_error = np.max(lda.decision_function(tfs_reduced), axis=1) if (embedding == 'LDA') else [0]* len(tfs_embedded)
    #eduction_error = reduction_error / norm(reduction_error)
    interpolated_topography = computeClusterTopography(tfs_embedded if viz == 'scatter' else tfs_mapped, silhouette_samples(tfs_reduced, clusters.labels_), width, height, interpolation)
    #interpolated_topography = np.array([1])*len(interpolated_topography)
    return tfs_reduced, clusters, tfs_embedded, tfs_mapped, cluster_words, top_words, similarity_to_cluster_centers, interpolated_topography, cm