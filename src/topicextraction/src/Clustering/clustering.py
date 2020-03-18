from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.cluster import MiniBatchKMeans

class Clustering(BaseEstimator, TransformerMixin):
    def __init__(self, features, method='kmeans', **kwargs):
        self.kwargs = kwargs
        self.features = features
        self.method = method
        self.selector = self.initSelector(method)

    def initSelector(self, method):
        if method == 'KMEANS':
            return MiniBatchKMeans(n_clusters=self.features)
        else:
            raise Exception(f'{self.__class__.__name__}: No valid method selected!')

    def fit(self, X, y=None):
        self.selector = self.selector.fit(X)
        return self

    def transform(self, X, y=None):
        try:
            return self.selector.transform(X), self.selector.predict(X)
        except Exception as err:
            print('Clustering.transform(): {}'.format(err))
        return X

    def fit_transform(self, X, y=None):
        self.fit(X, y)
        return self.transform(X, y)

    def inverse_transform(self, X, y):
        raise Exception(f'Inverse transform not defined for clustering')
