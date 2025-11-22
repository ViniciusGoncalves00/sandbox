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
    ],
  },

  resolve: {
    extensions: [".ts", ".js"],
  },

  plugins: [
    // Copia toda a pasta src/ para dist/ (exceto .ts)
    new CopyPlugin({
      patterns: [
        {
          from: "src",
          to: ".",
          globOptions: {
            ignore: ["**/*.ts", "**/*.tsx"], // ignorar arquivos TS
          },
        },
      ],
    }),

    // Injeta o bundle apenas no index.html principal
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
      inject: "body",
    }),
  ],

  devServer: {
    static: {
      directory: path.resolve(__dirname, "src"), // servir src como raiz no DEV
    },
    open: true,
    hot: true,
    port: 3000,
  },
};
