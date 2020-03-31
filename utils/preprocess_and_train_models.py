# general imports
import numpy as np
import os

# data wrangling
import json
import spacy
from multiprocessing import Pool, cpu_count
from joblib import dump, load

# document embedding
from gensim.models import TfidfModel
from gensim.corpora import Dictionary
from gensim.matutils import corpus2csc
from gensim.models.doc2vec import Doc2Vec, TaggedDocument
from gensim.test.utils import get_tmpfile
import bz2

from gensim.parsing.preprocessing import preprocess_string, STOPWORDS, strip_tags, strip_punctuation, strip_multiple_whitespaces, strip_numeric, strip_short
import scipy
        
class DataPreprocessor(object):
    def __init__(self, path, workers=cpu_count()-1):
        self.nlp = spacy.load('de_core_news_md', disable=["ner", "tagger", "parser", "textcat"])
        self.workers = workers

        with bz2.open(path, mode='rt') as f:
        	self.data = self.preprocessText(f)
        
        self.filepath = get_tmpfile(str(hash(tuple(self.data))))
        with open(self.filepath, "w") as file:
            for text in self.data:
                file.write("%s\n" % " ".join(text))
        
    def  __getitem__(self, pos):
        return TaggedDocument(self.data[pos], [pos])

    def preprocessText(self, texts):
        data = []
        for doc in self.nlp.pipe(texts, batch_size=64, n_process=self.workers):
            if(doc.lang_ == 'de'):
                data.append(tuple([token.lemma_ for token in doc if self.filterType(token)]))
        return data
        
    
    def chunkify(self, lst, n):
        return [lst[i::n] for i in range(n)]
        
    def filterType(self, token):
        return token.is_alpha and not (token.is_stop or token.like_num or token.is_punct) and len(token.lemma_) > 3

traindata = DataPreprocessor('../assets/data/train.txt.bz2')

dct = Dictionary(doc.words for doc in traindata)  # fit dictionary
traincorpus = [dct.doc2bow(doc.words) for doc in traindata]  # convert corpus to BoW format
tfidf_model = TfidfModel(traincorpus)  # fit model
dump(tfidf_model, '../assets/models/tfidf/tfidf.joblib')
dump(dct, '../assets/models/tfidf/dict.joblib')

print('Doc2Vec setup and vocabulary building:')
doc2vec_model = Doc2Vec(corpus_file=traindata.filepath, total_words=dct.num_pos, vector_size=100, window=20, min_count=4, workers=cpu_count(), epochs=30)
print('Doc2Vec training:')
doc2vec_model.train(corpus_file=traindata.filepath, total_words=dct.num_pos, total_examples=doc2vec_model.corpus_count, epochs=doc2vec_model.epochs)
doc2vec_model.delete_temporary_training_data(keep_doctags_vectors=False)
dump(doc2vec_model, '../assets/models/doc2vec/doc2vec.joblib')
