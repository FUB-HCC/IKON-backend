
exports.apidocs={
  swagger: '2.0',

  // all routes will now have /v3 prefixed.
  basePath: '/',

  info: {
    title: 'express-openapi sample project',
    version: '3.0.0'
  },

  // paths are derived from args.routes.  These are filled in by fs-routes.
  paths: {}
};