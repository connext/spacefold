const images = require('@rollup/plugin-image');
const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = {
  rollup(config, options) {
    config.plugins = [
      postcss({
        modules: true,
        plugins: [
          autoprefixer(),
          cssnano({
            preset: 'default',
          }),
        ],
        sourceMap: true,
        inject: true,
        extract: false,
      }),
      images({ include: ['**/*.png', '**/*.jpg', '**/*.gif'] }),
      ...config.plugins,
    ];

    return config;
  },
};
