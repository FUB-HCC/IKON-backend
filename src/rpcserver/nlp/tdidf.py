import time
import json
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
import regex as re
from langdetect import detect
from sklearn.decomposition import TruncatedSVD
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.decomposition import NMF


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

# compute the tfidf matrice of the given corpus
def TfIdf(dict):
    start = time.time()
    tfidf = TfidfVectorizer(tokenizer=lemmatize)
    tfs = tfidf.fit_transform(list(dict.values())[:40])
    print('TFIDF execution time: ', time.time() - start)
    return tfs

# cluster the data in its semantic space by topic
def cluster(tfs, num_topics=10):
    start = time.time()
    km = KMeans(n_clusters=num_topics).fit(tfs)
    print('Clustering execution time: ', time.time() - start)
    return km

# perform a dimension reduction which maximizes inter-class variance and minimizes intra-class variance in order to get clean clusters
def dimReduction(tfs_reduced, clusters):
    start = time.time()
    tfs_2d = LinearDiscriminantAnalysis(n_components=2).fit(tfs_reduced, clusters.labels_).transform(tfs_reduced)
    print('Dimension reduction execution time: ', time.time() - start)
    return tfs_2d

def clusterNumberHeuristic(tfs):
    return (tfs.shape[0]*tfs.shape[1])//tfs.count_nonzero()

def topicExtractionNMF(tfs):
    return NMF().fit_transform(tfs)
# plot the documents in the corpus clustered by topics as a scatterplot
def show(tfs):
    k = clusterNumberHeuristic(tfs)//3
    tfs_reduced = TruncatedSVD(n_components=k, random_state=0).fit_transform(tfs)
    tfs_topics = topicExtractionNMF(tfs)
    print(tfs_topics.shape)
    clusters = cluster(tfs_reduced, num_topics=3)
    tfs_2d = dimReduction(tfs_reduced, clusters)
    print(tfs_2d.shape)
    plt.scatter(tfs_2d[:, 0], tfs_2d[:, 1], marker="x", c = clusters.labels_)
    plt.show()


show(TfIdf(cleanProjectTexts()))