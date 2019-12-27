import json
import spacy
spacy.prefer_gpu()
from os import path
from multiprocessing import Pool, cpu_count

class DataLoader(object):
    def __init__(self, query, clean=True, stream=False, workers=cpu_count()):
        self.query = query
        self.data = self.loadFromDB(self.query).fetchall()

    def __iter__(self):
        self.pos = 0
        return self

    def __next__(self):
        if self.pos >= len(self.data):
            raise StopIteration
        self.pos += 1
        return self.__getitem__(self.pos - 1)

    def __getitem__(self, pos):
        return self.data[self.pos]

    def __len__(self):
        return len(self.data)

    def __str__(self):
        return str(self.data)

    def loadFromDB(self, query, conn):
        cursor = conn.cursor()
        cursor.execute(query)
        return cursor


class DataPreprocessor(DataLoader):
    def __init__(self, query, conn, clean=True, stream=False, workers=cpu_count()):
        self.query = query
        self.clean = clean
        self.nlp = spacy.load('de', disable=["ner", "tagger"])
        self.nlp.Defaults.stop_words |= self.loadEnglishStopwords()
        data = self.chunkify(self.loadFromDB(self.query, conn).fetchall(), workers)
        with Pool(workers) as pool:
            self.data = [item for sublist in pool.map(self.preprocessText, data) for item in sublist]

    def getIDs(self):
        return [id for (text, id, title) in self.data]

    def getTitles(self):
        return [title for (text, id, title) in self.data]

    def __getitem__(self, pos):
        text, *args = self.data[pos]
        return text

    def __hash__(self):
        return hash(self.data)

    def loadEnglishStopwords(self):
        filepath = '../data/stopwords_eng.json'
        if not path.exists(filepath):
            filepath = '../../../assets/data/nlp/stopwords_eng.json'

        with open(filepath, 'r') as datafile:
            return set(json.load(datafile))

    def preprocessText(self, results):
        texts, *args = zip(*results)
        data = []
        for doc, *args in zip(self.nlp.pipe(texts, batch_size=100, n_threads=-1), *args):
            if doc.lang_ == 'de' and len(doc) > 0:
                filter_doc = tuple([token.lemma_ for token in doc if self.filterType(token)])
                if len(filter_doc) > 0:
                    data.append((filter_doc, *args))
        return data

    def chunkify(self, lst, n):
        return [lst[i::n] for i in range(n)]

    def filterType(self, token):
        return token.is_alpha and not (token.is_stop or token.like_num or token.is_punct) and len(token.lemma_) > 3
