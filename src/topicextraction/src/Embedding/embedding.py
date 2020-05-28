from sklearn.base import BaseEstimator, TransformerMixin
import numpy as np
from joblib import load
from gensim.matutils import corpus2csc

class HDP(object):
    """
    This class loads a pretrained HDP Model via memory mapping and exposes a Sklearn-compatible API
    """
    def __init__(self, dict_path='/models/dict/dict.joblib', model_path='/models/hdp/hdp.joblib', **kwargs):
        self.model = load(model_path, mmap_mode='r')
        self.dict = load(dict_path, mmap_mode='r')

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        return corpus2csc(self.model[[self.dict.doc2bow(doc) for doc in X]]).T.todense()

class Embedding(BaseEstimator, TransformerMixin):
    """
    This class unifies and abstracts several embedding models and exposes a Sklearn-compatible API.
    Currently only TfIdf and HDP are supported.
    """
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

    def fit(self, X: np.ndarray, y: np.ndarray = None, **kwargs):
        return self

    def transform(self, X: np.ndarray, y:np.ndarray=None, **kwargs):
        try:
            return self.selector.transform(X)
        except Exception as err:
            print(f'{self.__class__.__name__}: {err}')
        return X
