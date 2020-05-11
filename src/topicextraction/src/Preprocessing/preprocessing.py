from sklearn.base import BaseEstimator, TransformerMixin

from typing import List
import spacy
    


class Preprocessing(BaseEstimator, TransformerMixin):
    def __init__(self, workers=-1, **kwargs):
        self.nlp = spacy.load('de_core_news_sm', disable=["ner", "tagger", "parser", "textcat"])
        self.workers = workers

    def fit(self, X: List[str], y:List[str]=None, **kwargs):
        return self

    def transform(self, X: List[str], y:List[str]=None, **kwargs):
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
