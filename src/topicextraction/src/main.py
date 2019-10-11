#from nlp_pipeline import *




from flask import Flask
app = Flask(__name__)
import json

@app.route("/clustering")
def read_root(targetDim: int=2,dimreduction: str='LSA', clustering: str='KMEANS', embedding: str='LDA', num_topics: int=20, granularity: int=5, perplexity: int=5, learning_rate: int=200, error: str='cluster_error', interpolation: str='linear', viz: str='scatter', width: int=400, height: int=600):
    with open('/data/c81-t22_tSNE_p22-lr450.json') as file:
        return json.load(file)

if __name__ == "__main__":
    # Only for debugging while developing
    app.run(host='0.0.0.0', debug=True, port=80)
