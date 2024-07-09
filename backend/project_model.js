const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  collaborators: [{
    type: String,
    required: true
  }],
  taskType: {
    type: String,
    enum: ['Fake News Detection', 'Fraud Detection'],
    required: true
  },
  gnnDetails: {
    dataset: {
      type: String
    },
    architecture: {
      type: String,
      enum: ['GCN', 'GAT', 'GraphSAGE', 'Other']
    },
    hyperparameters: {
      learningRate: Number,
      epochs: Number,
      batchSize: Number
    },
    performanceMetrics: {
      accuracy: Number,
      loss: Number
    },
    
    isTrained: {
      type: Boolean,
      default: false
    }
  },
  privacySettings: {
    differentialPrivacyLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High']
    },
    encryptionMethod: {
      type: String,
      enum: ['PHE', 'SHA-256', 'SHA3-256', 'BLAKE2b']
    },
    smpcProtocol: {
      type: String,
      enum: ['ABY', 'Cheetah', 'Naor-Pinkas OT', 'IKNP OT', 'KKRT OT', 'Secret-Shared Shuffle']
    },
    psiProtocol: {
      type: String,
      enum: ['ECDH-PSI', 'KKRT-PSI', 'Circuit-PSI']
    }
  }
});

const ProjectModel = mongoose.model('Project', ProjectSchema);

module.exports = ProjectModel;
