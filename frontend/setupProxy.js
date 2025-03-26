const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5555',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '' // remove /api prefix when forwarding to backend
      },
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
      },
      logLevel: 'debug' // Add this to get more detailed logging
    })
  );
};