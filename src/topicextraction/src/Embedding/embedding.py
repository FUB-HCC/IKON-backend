from sklearn.base import BaseEstimator, TransformerMixin
from gensim.corpora.dictionary import Dictionary
from gensim.sklearn_api import TfIdfTransformer, D2VTransformer
from scipy.sparse import csr_matrix
csr_matrix.__hash__ = object.__hash__
import numpy as np
import functools
from multiprocessing import cpu_count

class Embedding(BaseEstimator, TransformerMixin):
    def __init__(self, method='tfidf', **kwargs):
        self.kwargs = kwargs
        self.method = method
        self.selector = self.initSelector(method)

    def initSelector(self, method):
        if method == 'tfidf':
            return TfIdfTransformer()
        elif method == 'doc2vec':
            return D2VTransformer(size=100, window=20, min_count=4, workers=cpu_count(), iter=30, **self.kwargs)

    def preprocess(self, X, y=None):
        if self.method == 'tfidf':
            return [self.dct.doc2bow(doc) for doc in X]
        elif self.method == 'doc2vec':
            return X
        else:
            raise Exception(f'{self.__class__.__name__}: No valid method selected!')

    def postprocess(self, X):
        if self.method == 'tfidf':
            i_s = []
            j_s = []
            val_s = []
            for i, row in enumerate(X):
                for j, val in row:
                    i_s.append(i)
                    j_s.append(j)
                    val_s.append(val)
            return csr_matrix((val_s, (i_s, j_s)))
        elif self.method == 'doc2vec':
            return csr_matrix(X)

    @functools.lru_cache(maxsize=None)
    def fit(self, X, y=None):
        if self.method == 'tfidf':
            self.dct = Dictionary(doc for doc in X)
        self.selector = self.selector.fit(self.preprocess(X))
        return self

    @functools.lru_cache(maxsize=None)
    def transform(self, X, y=None):
        try:
            return self.postprocess(self.selector.transform(self.preprocess(X)))
        except Exception as err:
            print('Embedding.transform(): {}'.format(err))
        return X

    @functools.lru_cache(maxsize=None)
    def fit_transform(self, X, y=None):
        self.fit(X, y)
        return self.transform(X, y)

    def top_words(self, vector, topn=5):
        if self.method == 'tfidf':
            return [self.dct.get(entry) for entry in np.argpartition(vector, -topn)[-topn:]]
        elif self.method == 'doc2vec':
            return[word for word, prob in self.selector.gensim_model.wv.similar_by_vector(vector, topn=topn)]

    def inverse_transform(self, X, y=None, topn=5):
        return np.apply_along_axis(self.top_words, 1, X[0], topn=topn)