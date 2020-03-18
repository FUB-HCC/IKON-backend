FROM tensorflow/tensorflow:1.12.0-py3

RUN pip install bert-serving-server

CMD bert-serving-start -model_dir /model/ -num_worker=1 -cpu -cased_tokenization -max_seq_len NONE -ckpt_name model.ckpt

EXPOSE 5555
EXPOSE 5556
