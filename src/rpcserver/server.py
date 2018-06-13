from concurrent import futures
import time

import grpc
from rpc import rpc_pb2 as messages
from rpc import rpc_pb2_grpc as grpcio
from nlp import tdidf



_ONE_DAY_IN_SECONDS = 60 * 60 * 24

class RPCServicer(grpcio.RPCserverServicer):
    """Provides methods that implement functionality of route guide server."""

    def __init__(self):
        self.tfs = tdidf.TfIdf(tdidf.cleanProjectTexts())
        pass


    def cluster(self, request, context):
        return messages.Matrix(row=1, col=1)


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    grpcio.add_RPCserverServicer_to_server (
        RPCServicer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    try:
        while True:
            time.sleep(_ONE_DAY_IN_SECONDS)
    except KeyboardInterrupt:
        server.stop(0)


if __name__ == '__main__':
    serve()