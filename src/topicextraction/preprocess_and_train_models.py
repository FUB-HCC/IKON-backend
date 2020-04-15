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
from gensim.models.hdpmodel import HdpModel
from gensim.test.utils import get_tmpfile
import bz2

from src.Preprocessing.preprocessing import Preprocessing
import itertools
        
print('Loading and preprocessing data')
with bz2.open('../../assets/data/train.txt.bz2', mode='rt') as f:
    traindata = Preprocessing().fit_transform(f)

print('Building dict and training TfIdf model:')
dct = Dictionary(doc for doc in traindata)  # fit dictionary
traincorpus = [dct.doc2bow(doc) for doc in traindata]  # convert corpus to BoW format
tfidf_model = TfidfModel(traincorpus)  # fit model
dump(tfidf_model, '../../assets/models/tfidf/tfidf.joblib')
dump(dct, '../../assets/models/dict/dict.joblib')

#print('Doc2Vec setup and vocabulary building:')
#doc2vec_model = Doc2Vec(corpus_file=traindata.filepath, total_words=dct.num_pos, vector_size=100, #window=20, min_count=4, workers=cpu_count(), epochs=30)
#print('Doc2Vec training:')
#doc2vec_model.train(corpus_file=traindata.filepath, total_words=dct.num_pos, #total_examples=doc2vec_model.corpus_count, epochs=doc2vec_model.epochs)
#doc2vec_model.delete_temporary_training_data(keep_doctags_vectors=False)
#dump(doc2vec_model, '../assets/models/doc2vec/doc2vec.joblib')

print('HDPModel training:')
hdp_model = HdpModel(traincorpus, dct)
dump(hdp_model, '../../assets/models/hdp/hdp.joblib')


