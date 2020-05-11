from sklearn.base import BaseEstimator, TransformerMixin
import numpy as np

class Debug(BaseEstimator, TransformerMixin):

    def transform(self, X: np.ndarray, y:np.ndarray=None, **kwargs):
        self.data = X
        # what other output you want
        return X

    def fit(self, X: np.ndarray, y:np.ndarray=None, **kwargs):
        return self

    def inverse_transform(self, X: np.ndarray, y:np.ndarray=None, **kwargs):
        return X, y