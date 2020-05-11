from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.cluster import MiniBatchKMeans

import numpy as np

from typing import Tuple, ClassVar


class Clustering(BaseEstimator, TransformerMixin):
    def __init__(self, features: int, method: str='kmeans', **kwargs):
        self.kwargs = kwargs
        self.features = features
        self.method = method
        self.selector = self.initSelector(method)

    def initSelector(self, method: str):
        if method == 'KMEANS':
            return MiniBatchKMeans(n_clusters=self.features)
        else:
            raise Exception(f'{self.__class__.__name__}: No valid method selected!')

    def fit(self, X: np.ndarray, y:np.ndarray=None, **kwargs) -> ClassVar:
        self.selector = self.selector.fit(X, **kwargs)
        return self

    def transform(self, X: np.ndarray, y:np.ndarray=None, **kwargs) -> Tuple[np.ndarray, np.ndarray]:
        try:
            return self.selector.transform(X, **kwargs), self.selector.predict(X, **kwargs)
        except Exception as err:
            print('Clustering.transform(): {}'.format(err))
        return X
