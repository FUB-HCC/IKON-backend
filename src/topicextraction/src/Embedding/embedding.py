from sklearn.base import BaseEstimator, TransformerMixin
from gensim.corpora.dictionary import Dictionary
from gensim.sklearn_api import TfIdfTransformer, D2VTransformer
from scipy.sparse import csr_matrix
csr_matrix.__hash__ = object.__hash__
import numpy as np
import functools
from multiprocessing import cpu_count
from joblib import load
from gensim.matutils import corpus2csc
import socket

class TfIdf(object):
    def __init__(self, dict_path='/models/dict/dict.joblib', model_path='/models/tfidf/tfidf.joblib', **kwargs):
        self.model = load(model_path, mmap_mode='r')
        self.dict = load(dict_path, mmap_mode='r')

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        return corpus2csc(self.model[[self.dict.doc2bow(doc) for doc in X]]).T

class Doc2Vec(object):
    def __init__(self, model_path='/models/doc2vec/doc2vec.joblib', **kwargs):
        self.model = load(model_path, mmap_mode='r')

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        return np.array([self.model.infer_vector(doc) for doc in X])

class HDP(object):
    def __init__(self, dict_path='/models/dict/dict.joblib', model_path='/models/hdp/hdp.joblib', **kwargs):
        self.model = load(model_path, mmap_mode='r')
        self.dict = load(dict_path, mmap_mode='r')

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        return corpus2csc(self.model[[self.dict.doc2bow(doc) for doc in X]]).T

class BERT(object):
    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        bc = BertClient(ip=socket.gethostbyname_ex('BERTaaSIKON')[2][0])
        return bc.encode([list(x) for x in X], is_tokenized=True)
        pass


class Embedding(BaseEstimator, TransformerMixin):
    def __init__(self, method='tfidf', **kwargs):
        self.kwargs = kwargs
        self.method = method
        self.selector = self.initSelector(method, **kwargs)

    def initSelector(self, method, **kwargs):
        if method == 'TfIdf':
            return TfIdf(**kwargs)
        elif method == 'Doc2Vec':
            return Doc2Vec(**kwargs)
        elif method == 'BERT':
            return BERT(**kwargs)
        elif method == 'HDP':
            return HDP(**kwargs)
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

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        try:
            return self.selector.transform(X)
        except Exception as err:
            print(f'{self.__class__.__name__}: {err}')
        return X

    def fit_transform(self, X, y=None):
        self.fit(X, y)
        return self.transform(X, y)
