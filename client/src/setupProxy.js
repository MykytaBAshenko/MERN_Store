const { createProxyMiddleware } = require('http-proxy-middleware');
const config = {
    MAGIC_HOST: ""
  };
  if (process.env.NODE_ENV === 'production') {
    config.MAGIC_HOST=process.env.MY_HOST;
  } else {
    config.MAGIC_HOST='http://localhost:5000';
  }
  

module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: config.MAGIC_HOST,
            changeOrigin: true,
        })
    );
};