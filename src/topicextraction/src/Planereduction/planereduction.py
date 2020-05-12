from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.manifold import TSNE
import numpy as np


class PlaneReduction(BaseEstimator, TransformerMixin):
    """
    This class unifies and abstracts several dimensionality reduction models and exposes a Sklearn-compatible API.
    Currently only TSNE and LDA are supported.
    """
    def __init__(self, features, method, **kwargs):
        self.kwargs = kwargs
        self.features = features
        self.method = method
        self.selector = self.initSelector(method)

    def initSelector(self, method):
        if method == 'TSNE':
            return TSNE(n_components=self.features, **self.kwargs)
        elif method == 'LDA':
            return LinearDiscriminantAnalysis(n_components=self.features)
        else:
            raise Exception(f'{self.__class__.__name__}: No valid method selected!')

    def fit(self, X: np.ndarray, y:np.ndarray=None, **kwargs):
        data, y = X
        if self.method == 'tsne':
            pass
        elif self.method == 'lda':
            self.selector = self.selector.fit(data, y)
        return self

    def transform(self, X: np.ndarray, y:np.ndarray=None, **kwargs):
        print(X)
        data, y = X
        try:
            if self.method == 'tsne':
                return self.selector.fit_transform(data), y
            elif self.method == 'lda':
                return self.selector.transform(data), y
        except Exception as err:
            print('PlaneReduction.transform(): {}'.format(err))
        return X

    def fit_transform(self, X: np.ndarray, y:np.ndarray=None, **kwargs):
        data, y = X
        return self.selector.fit_transform(data, y), y

    def inverse_transform(self, X: np.ndarray, y:np.ndarray=None, **kwargs):
        raise Exception(f'Inverse transform not defined for clustering')
