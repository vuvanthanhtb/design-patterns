/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { PythonExample } from "@/lib/ml/types";
import { decisionTree } from "./decision-tree";
import { gradientDescent } from "./gradient-descent";
import { kMeans } from "./k-means";
import { knn } from "./knn";
import { linearRegression } from "./linear-regression";
import { logisticRegression } from "./logistic-regression";
import { naiveBayes } from "./naive-bayes";
import { neuralNetwork } from "./neural-network";
import { pca } from "./pca";
import { randomForest } from "./random-forest";
import { svm } from "./svm";

export const ML_CODE: Record<string, PythonExample> = {
  "decision-tree": decisionTree,
  "gradient-descent": gradientDescent,
  "k-means": kMeans,
  knn: knn,
  "linear-regression": linearRegression,
  "logistic-regression": logisticRegression,
  "naive-bayes": naiveBayes,
  "neural-network": neuralNetwork,
  pca: pca,
  "random-forest": randomForest,
  svm: svm,
};
