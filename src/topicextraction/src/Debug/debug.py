from sklearn.base import BaseEstimator, TransformerMixin


class Debug(BaseEstimator, TransformerMixin):
    """
    This class serves as a cache for passing data and exposes a Sklearn-compatible API.
    It is used to extract intermediate data in Sklearn pipelines.
    """
    def transform(self, X: np.ndarray, y:np.ndarray=None, **kwargs):
        self.data = X
        # what other output you want
        return X

    def fit(self, X, y=None, **fit_params):
        return self

    def fit_transform(self, X, y=None, **fit_params):
        self.fit(X, y)
        return self.transform(X, y)

    def inverse_transform(self, X, y=None):
        return X, y
