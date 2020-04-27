# general imports
import numpy as np
import os
import csv

# data wrangling
import json
import spacy
from multiprocessing import Pool, cpu_count
from joblib import dump, load

# document embedding
from gensim.models import TfidfModel, HdpModel
from gensim.corpora import Dictionary
from gensim.matutils import corpus2csc
from gensim.models.doc2vec import Doc2Vec, TaggedDocument
from gensim.test.utils import get_tmpfile
import bz2

from Preprocessing.preprocessing import Preprocessing
import itertools
        
print('Loading and preprocessing data')
with bz2.open('/gepris_data/train.csv.bz2', mode='rt') as f:
    csvreader = csv.reader(f)
    traindata = Preprocessing().fit_transform((row[1] for row in csvreader))
    f.seek(0)
    doc2author = {i:row[3:] for i, row in enumerate(csvreader)}

print('Building dict and training TfIdf model:')
dct = Dictionary(doc for doc in traindata)  # fit dictionary
tfidf_model = TfidfModel((dct.doc2bow(doc) for doc in traindata))  # fit model
dump(tfidf_model, '/models/tfidf/tfidf.joblib')
dump(dct, '/models/dict/dict.joblib')

print('HDP training:')
hdp_model = HdpModel([dct.doc2bow(doc) for doc in traindata], id2word=dct)
dump(hdp_model, '/models/hdp/hdp.joblib')


