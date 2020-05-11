from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.decomposition import TruncatedSVD
import numpy as np

class TopicExtraction(BaseEstimator, TransformerMixin):
    def __init__(self, features, method='lsa', **kwargs):
        self.kwargs = kwargs
        self.features = features
        self.method = method
        self.selector = self.initSelector(method)

    def initSelector(self, method):
        if method == 'LSA':
            return TruncatedSVD(n_components=self.features, random_state=0)
        else:
            raise Exception(f'{self.__class__.__name__}: No valid method selected!')

    def fit(self, X: np.ndarray, y:np.ndarray=None, **kwargs):
        self.selector = self.selector.fit(X)
        return self

    def transform(self, X: np.ndarray, y:np.ndarray=None, **kwargs):
        try:
            return self.selector.transform(X)
        except Exception as err:
            print('TopicExtraction.transform(): {}'.format(err))
        return X

    def inverse_transform(self, X: np.ndarray, y:np.ndarray=None, **kwargs):
        return self.selector.inverse_transform(X)
