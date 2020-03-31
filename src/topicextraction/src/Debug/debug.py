from sklearn.base import BaseEstimator, TransformerMixin


class Debug(BaseEstimator, TransformerMixin):

    def transform(self, X, y=None):
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