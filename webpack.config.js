const path = require("path")
const nodeExternals = require("webpack-node-externals")

module.exports= {
  mode: "development",
  target: 'node',
  entry: "./src/app.ts",
  externals : ['mongodb-client-encryption', nodeExternals()],
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