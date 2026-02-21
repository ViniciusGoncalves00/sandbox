import path from "path";
import { fileURLToPath } from "url";
import CopyPlugin from "copy-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_PATH = "/sandbox/";

export default {
  mode: "production",

  entry: "./src/main.ts",

  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: BASE_PATH,
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
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
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "src",
          to: "sandbox",
          globOptions: {
            ignore: ["**/*.ts"],
          },
        },
      ],
    }),
  ],

  devServer: {
    static: {
      directory: path.resolve(__dirname, "dist"),
      publicPath: BASE_PATH,
    },
    port: 3000,
    open: [BASE_PATH],
  },
};