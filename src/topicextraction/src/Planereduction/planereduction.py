from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.manifold import TSNE, MDS
import functools


class PlaneReduction(BaseEstimator, TransformerMixin):
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
        elif method == 'MDS':
            return MDS(n_components=self.features, metric=False)
        else:
            raise Exception(f'{self.__class__.__name__}: No valid method selected!')

    def fit(self, X, y=None):
        if self.method == 'TSNE':
            pass
        elif self.method == 'LDA':
            self.selector = self.selector.fit(X, y)
        return self

    def transform(self, X, y=None):
        if self.method == 'TSNE':
            return self.selector.fit_transform(X)
        elif self.method == 'LDA':
            return self.selector.transform(X)
