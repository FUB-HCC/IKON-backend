from sklearn.base import BaseEstimator, TransformerMixin
from scipy.sparse import csr_matrix
csr_matrix.__hash__ = object.__hash__
import numpy as np
from joblib import load
from gensim.matutils import corpus2csc

class TfIdf(object):
    def __init__(self, dict_path='/models/dict/dict.joblib', model_path='/models/tfidf/tfidf.joblib', **kwargs):
        self.model = load(model_path, mmap_mode='r')
        self.dict = load(dict_path, mmap_mode='r')

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        return corpus2csc(self.model[[self.dict.doc2bow(doc) for doc in X]]).T

class HDP(object):
    def __init__(self, dict_path='/models/dict/dict.joblib', model_path='/models/hdp/hdp.joblib', **kwargs):
        self.model = load(model_path, mmap_mode='r')
        self.dict = load(dict_path, mmap_mode='r')

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        return corpus2csc(self.model[[self.dict.doc2bow(doc) for doc in X]]).T

class Embedding(BaseEstimator, TransformerMixin):
    def __init__(self, method='tfidf', **kwargs):
        self.kwargs = kwargs
        self.method = method
        self.selector = self.initSelector(method, **kwargs)

    def initSelector(self, method, **kwargs):
        if method == 'TfIdf':
            return TfIdf(**kwargs)
        elif method == 'HDP':
            return HDP(**kwargs)
        else:
            raise Exception(f'{self.__class__.__name__}: No valid method selected!')

    def fit(self, X: np.ndarray, y:np.ndarray=None, **kwargs):
        return self

    def transform(self, X: np.ndarray, y:np.ndarray=None, **kwargs):
        try:
            return self.selector.transform(X)
        except Exception as err:
            print(f'{self.__class__.__name__}: {err}')
        return X
