import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: "production",
  entry: "./src/main.ts",

  output: {
    filename: "bundle.[contenthash].js",
    path: path.resolve(__dirname, "dist"),
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
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  plugins: [
    // copia TUDO de src/ para dist/, exceto arquivos TS
    new CopyPlugin({
      patterns: [
        {
          from: "src",
          to: ".",
          globOptions: {
            ignore: ["**/*.ts"], // ts é empacotado pelo webpack
          },
        },
      ],
    }),

    // injeta bundle.js apenas no index principal
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
      inject: "body",
    }),
  ],

  devServer: {
    static: [
      path.resolve(__dirname, "src"), // serve HTMLs do src no dev
      path.resolve(__dirname, "dist"), // serve bundle no dev
    ],
    hot: true,
    open: true,
    port: 3000,
  },
};
