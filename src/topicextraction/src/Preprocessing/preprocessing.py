from sklearn.base import BaseEstimator, TransformerMixin

# data wrangling
import spacy
    


class Preprocessing(BaseEstimator, TransformerMixin):
    """
    This class preprocesses a list of texts by lemmatization and stop word removal and exposes a Sklearn-compatible API.
    """
    def __init__(self, workers=-1, **kwargs):
        self.nlp = spacy.load('de_core_news_sm', disable=["ner", "tagger", "parser", "textcat"])
        self.workers = workers

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        try:
            return self.preprocessText(X)
        except Exception as err:
            print('Preprocessor.transform(): {}'.format(err))
        return X

    def preprocessText(self, texts):
        data = []
        for doc in self.nlp.pipe(texts, batch_size=64, n_process=self.workers):
            if(doc.lang_ == 'de'):
                data.append(tuple([token.lemma_ for token in doc if self.filterType(token)]))
        return data
        
    def filterType(self, token):
        return token.is_alpha and not (token.is_stop or token.like_num or token.is_punct) and len(token.lemma_) > 3



    def fit_transform(self, X, y=None):
        self.fit(X, y)
        return self.transform(X, y)
