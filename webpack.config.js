module.exports = function (options, webpack) {
  // const lazyImports = [
  //   '@nestjs/microservices/microservices-module',
  //   '@nestjs/websockets/socket-module',
  //   '@nestjs/swagger',
  //   'nestjs-zod',
  // ];

  return {
    ...options,
    devtool: 'source-map',
    // externals: [],
    // plugins: [
    //   ...options.plugins,
    //   new webpack.IgnorePlugin({
    //     checkResource(resource) {
    //       if (lazyImports.includes(resource)) {
    //         try {
    //           require.resolve(resource);
    //         } catch (err) {
    //           return true;
    //         }
    //       }
    //       return false;
    //     },
    //   }),
    // ],
  };
};
