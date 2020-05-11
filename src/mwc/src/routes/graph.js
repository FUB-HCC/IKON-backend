module.exports = function(loginPromise, mediaWikiConnector) {
  let operations = {
    GET
  };

  async function GET(req, res, next) {
    const result = (await mediaWikiConnector.fetchGraph(loginPromise));
    res.status(200).send(result);
  }

  // NOTE: We could also use a YAML string here.
  GET.apiDoc = {
    summary: 'Returns JSON graph build from the data from VIA',
    operationId: 'getGraph',
    responses: {
      200: {
        description: 'A marshalled version of the graph',
        schema: {
          type: 'string',
        }
      },
      default: {
        description: 'An error occurred',
        schema: {
          additionalProperties: true
        }
      }
    }
  };

  return operations;
}
