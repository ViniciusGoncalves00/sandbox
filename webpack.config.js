const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    main: "./src/main.ts",
    terrain: "./src/Terrain/terrain.ts",
    handler: "./src/handler/handler.ts",
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      }
    ]
  },

  resolve: {
    extensions: [".ts", ".js"],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
      chunks: ["main"],
    }),

    new HtmlWebpackPlugin({
      template: "./src/Terrain/index.html",
      filename: "Terrain/index.html",
      chunks: ["terrain"],
    }),

    new HtmlWebpackPlugin({
      template: "./src/handler/index.html",
      filename: "handler/index.html",
      chunks: ["handler"],
    }),
  ]
};
