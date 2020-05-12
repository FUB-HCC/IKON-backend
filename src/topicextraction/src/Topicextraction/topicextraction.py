from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.decomposition import TruncatedSVD

class TopicExtraction(BaseEstimator, TransformerMixin):
    """
    This class unifies and abstracts several dimensionality reduction models and exposes a Sklearn-compatible API.
    Currently only LSA (TruncatedSVD) is supported.
    """
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

    def fit(self, X, y=None):
        self.selector = self.selector.fit(X)
        return self

    def transform(self, X, y=None):
        try:
            return self.selector.transform(X)
        except Exception as err:
            print('TopicExtraction.transform(): {}'.format(err))
        return X

    def fit_transform(self, X, y=None):
        self.fit(X, y)
        return self.transform(X, y)

    def inverse_transform(self, X, y=None):
        return self.selector.inverse_transform(X)
