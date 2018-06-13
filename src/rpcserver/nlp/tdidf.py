import time
import json
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
import regex as re
from langdetect import detect
from sklearn.manifold import TSNE
from sklearn.decomposition import TruncatedSVD
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans


def loadProjects():
    with open('../../../assets/data/projects.json', 'r') as datafile:
        return json.load(datafile)

def loadGermanStopwords():
    with open('../../../assets/data/stopwords_de.json', 'r') as datafile:
        return json.load(datafile)

def loadEnglishStopwords():
    with open('../../../assets/data/stopwords_eng.json', 'r') as datafile:
        return json.load(datafile)

def cleanProjectTexts():
    cleanedProjectTexts = {}
    stopwordsDE = set(loadGermanStopwords())
    stopwordsENG = set(loadEnglishStopwords())
    for key,project in loadProjects().items():
        if detect(project['beschreibung']) == 'de':
            letters_only = re.sub('[^\w]', ' ', project['beschreibung'])
            words = letters_only.lower().split()
            usefulWords = [x for x in words if not (x in stopwordsDE or x in stopwordsENG)]
            cleanedProjectTexts[key] = ' '.join(usefulWords)
    return cleanedProjectTexts

def lemmatize(text):
    nlp = spacy.load('de')
    return nlp(text)

def TfIdf(dict):
    start = time.time()
    tfidf = TfidfVectorizer(tokenizer=lemmatize)
    tfs = tfidf.fit_transform(list(dict.values())[:90])
    print('TFIDF execution time: ', time.time() - start)
    return tfs

def kmeans(tfs):
    start = time.time()
    k = 50
    km = KMeans(n_clusters=k, init='k-means++', max_iter=100, n_init=5)
    km.fit(tfs)
    print('K-Means execution time: ', time.time() - start)
    return km


def tsne(tfs):
    start = time.time()
    clusters = kmeans(tfs)
    k = 50
    tfs_reduced = TruncatedSVD(n_components=k, random_state=0).fit_transform(tfs)
    tfs_embedded = TSNE(n_components=2, perplexity=2).fit_transform(tfs_reduced)
    print('TSNE execution time: ', time.time() - start)
    fig = plt.figure()
    ax = plt.axes()
    plt.scatter(tfs_embedded[:, 0], tfs_embedded[:, 1], marker="x", c = clusters.labels_)
    plt.show()


tsne(TfIdf(cleanProjectTexts()))