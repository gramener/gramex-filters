/* eslint-env node */

module.exports = {
  server: {
    command: "node-http-server port=4444 verbose",
    protocol: "http",
    port: 4444,
    path: "/package.json",
    usedPortAction: "ignore",
  },
};
