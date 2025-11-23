import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: {
    main: "./src/main.ts",
    handler: "./src/handler/main.ts",
    terrain: "./src/terrain/main.ts",
    marchingsquares: "./src/marchingsquares/main.ts",
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name]/bundle.[contenthash].js",
    clean: true,
    publicPath: "",
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|glb|gltf|obj|fbx)$/i,
        type: "asset/resource",
      },
    ],
  },

  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
      chunks: ["main"],
      inject: "body",
    }),

    new HtmlWebpackPlugin({
      template: "./src/handler/index.html",
      filename: "handler/index.html",
      chunks: ["handler"],
      inject: "body",
    }),

    new HtmlWebpackPlugin({
      template: "./src/terrain/index.html",
      filename: "terrain/index.html",
      chunks: ["terrain"],
      inject: "body",
    }),

    new HtmlWebpackPlugin({
      template: "./src/marchingsquares/index.html",
      filename: "marchingsquares/index.html",
      chunks: ["marchingsquares"],
      inject: "body",
    }),
  ],

  devServer: {
    static: "./dist",
    open: true,
    hot: true,
    port: 3000,
  },
};
