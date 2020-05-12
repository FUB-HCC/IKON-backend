from sklearn.base import BaseEstimator, TransformerMixin
import numpy as np

class Debug(BaseEstimator, TransformerMixin):
    """
    This class serves as a cache for passing data and exposes a Sklearn-compatible API.
    It is used to extract intermediate data in Sklearn pipelines.
    """
    def transform(self, X: np.ndarray, y:np.ndarray=None, **kwargs):
        self.data = X
        return X

    def fit(self, X: np.ndarray, y:np.ndarray=None, **kwargs):
        return self
