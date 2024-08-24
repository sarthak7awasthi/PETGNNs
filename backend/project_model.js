const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ProjectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    default: uuidv4,
    unique: true,
  },
  projectName: {
    type: String,
    required: true,
  },
  taskName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  dataType: {
    type: String,
    enum: ["Tabular", "Text", "Image", "Audio", "Time Series", "Graph"],
    required: false,
  },
  labels: {
    type: String,
    enum: ["Binary", "Multi-Class", "Regression"],
    required: false,
  },
  preprocessingOptions: {
    wordTokenization: { type: Boolean, default: false },
    sentenceTokenization: { type: Boolean, default: false },
    lowercasing: { type: Boolean, default: false },
    removeStopwords: { type: Boolean, default: false },
    stemmingLemmatization: { type: Boolean, default: false },
    featureEngineering: {
      type: String,
      enum: ["TF-IDF", "Word Embeddings"],
      required: false,
    },
  },
  modelConfiguration: {
    modelArchitecture: {
      type: String,
      enum: ["GNN", "CNN", "LSTM", "Custom"],
      required: false,
    },
    customLayers: { type: String, required: false },
    hyperparameters: {
      learningRate: { type: Number, default: 0.001 },
      batchSize: { type: Number, default: 32 },
      numberOfEpochs: { type: Number, default: 10 },
    },
  },
  trainingConfiguration: {
    validationStrategy: {
      type: String,
      enum: ["Train-Validation-Test Split", "K-Fold Cross-Validation"],
      required: false,
    },
    optimization: {
      type: String,
      enum: ["Adam", "SGD"],
      required: false,
    },
    lossFunction: {
      type: String,
      enum: ["Binary Cross-Entropy", "Mean Squared Error"],
      required: false,
    },
  },
  evaluationMetrics: {
    accuracy: { type: Boolean, default: false },
    precision: { type: Boolean, default: false },
    recall: { type: Boolean, default: false },
    f1Score: { type: Boolean, default: false },
    aucRoc: { type: Boolean, default: false },
  },
  collaborators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  status: {
    type: String,
    enum: ["Active", "Inactive", "Completed"],
    default: "Active",
  },
  privacyStatus: {
    type: String,
    enum: ["Private", "Public"],
    default: "Private",
  },
  admin: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const ProjectModel = mongoose.model("Project", ProjectSchema);

module.exports = ProjectModel;
