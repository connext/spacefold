module.exports = {
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs`, `net`, `express` module
    if (!isServer) {
      config.node = {
        fs: "empty",
        net: "empty",
        express: "empty",
        tls: "empty",
      };
    }

    return config;
  },
};
