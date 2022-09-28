const path = require("path")

module.exports= {
  mode: "development",
  target: 'node',
  entry: "./src/app.ts",
  externals : ['mongodb-client-encryption'],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.node$/,
        use: "node-loader",
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist'),
  },
}