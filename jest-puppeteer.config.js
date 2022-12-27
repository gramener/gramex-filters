/* eslint-env node */

module.exports = {
  server: {
    command: "serve -l 4444",
    protocol: "http",
    port: 4444,
    path: "/package.json",
    usedPortAction: "ignore",
  },
};
