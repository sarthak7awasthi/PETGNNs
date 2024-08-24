import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { encryptFile, applyDifferentialPrivacy } from "../../utils/encryption";
import {
  Container,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Modal,
  CircularProgress,
} from "@mui/material";
import Header from "./Header";
import {
  getProjectDetails,
  trainingOptions,
  addCollaborator,
} from "../requests/auth";
import Papa from "papaparse";
import JSON5 from "json5";
import JSZip from "jszip";
import Terminal from "./Terminal";

function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [template, setTemplate] = useState("Custom");
  const [dataType, setDataType] = useState("");
  const [labels, setLabels] = useState("");
  const [tokenizationOptions, setTokenizationOptions] = useState({
    wordTokenization: false,
    sentenceTokenization: false,
    lowercasing: false,
    removeStopwords: false,
    stemmingLemmatization: false,
  });
  const [featureEngineering, setFeatureEngineering] = useState("");
  const [modelArchitecture, setModelArchitecture] = useState("");
  const [customLayers, setCustomLayers] = useState("");
  const [sequenceLength, setsequenceLength] = useState(50);
  const [hyperparameters, setHyperparameters] = useState({
    learningRate: 0.001,
    batchSize: 32,
    numberOfEpochs: 10,
  });
  const [validationStrategy, setValidationStrategy] = useState("");
  const [optimization, setOptimization] = useState("");
  const [lossFunction, setLossFunction] = useState("");
  const [evaluationMetrics, setEvaluationMetrics] = useState({
    accuracy: false,
    precision: false,
    recall: false,
    f1Score: false,
    aucRoc: false,
  });
  const [openModal, setOpenModal] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [collaboratorModalOpen, setCollaboratorModalOpen] = useState(false);

  const [terminalOpen, setTerminalOpen] = useState(false);
  const [logs, setLogs] = useState("");
  const [version, setVersion] = useState("");

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await getProjectDetails(token, projectId);
        setProject(data);
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  const handleOpenCollaboratorModal = () => {
    setCollaboratorModalOpen(true);
  };

  const handleCloseCollaboratorModal = () => {
    setCollaboratorEmail("");
    setCollaboratorModalOpen(false);
  };

  const handleAddCollaborator = async () => {
    try {
      const token = localStorage.getItem("token");
      await addCollaborator(token, projectId, collaboratorEmail);
      console.log("Collaborator added successfully");
      handleCloseCollaboratorModal();
    } catch (error) {
      console.error("Failed to add collaborator:", error);
    }
  };

  const handleTemplateChange = (event) => {
    const selectedTemplate = event.target.value;
    setTemplate(selectedTemplate);

    switch (selectedTemplate) {
      case "Fake News Detection":
        setDataType("Text");
        setLabels("Binary");
        setTokenizationOptions({
          wordTokenization: true,
          sentenceTokenization: false,
          lowercasing: true,
          removeStopwords: true,
          stemmingLemmatization: true,
        });
        setFeatureEngineering("TF-IDF");
        setModelArchitecture("LSTM");
        setHyperparameters({
          learningRate: 0.001,
          batchSize: 32,
          numberOfEpochs: 10,
        });
        setValidationStrategy("Train-Validation-Test Split");
        setOptimization("Adam");
        setLossFunction("Binary Cross-Entropy");
        setEvaluationMetrics({
          accuracy: true,
          precision: true,
          recall: true,
          f1Score: true,
          aucRoc: false,
        });
        setsequenceLength(50);
        break;
      case "Fraud Detection":
        setDataType("Tabular");
        setLabels("Binary");
        setTokenizationOptions({
          wordTokenization: false,
          sentenceTokenization: false,
          lowercasing: false,
          removeStopwords: false,
          stemmingLemmatization: false,
        });

        setFeatureEngineering("");
        setModelArchitecture("CNN");
        setHyperparameters({
          learningRate: 0.001,
          batchSize: 64,
          numberOfEpochs: 20,
        });
        setValidationStrategy("K-Fold Cross-Validation");
        setOptimization("Adam");
        setLossFunction("Binary Cross-Entropy");
        setEvaluationMetrics({
          accuracy: true,
          precision: true,
          recall: true,
          f1Score: true,
          aucRoc: true,
        });

        setsequenceLength(20);
        break;
      case "Community Detection":
        setDataType("Graph");
        setLabels("Multi-Class");
        setTokenizationOptions({
          wordTokenization: false,
          sentenceTokenization: false,
          lowercasing: false,
          removeStopwords: false,
          stemmingLemmatization: false,
        });
        setFeatureEngineering("");
        setModelArchitecture("GNN");
        setHyperparameters({
          learningRate: 0.01,
          batchSize: 128,
          numberOfEpochs: 30,
        });
        setValidationStrategy("Train-Validation-Test Split");
        setOptimization("SGD");
        setLossFunction("Mean Squared Error");
        setEvaluationMetrics({
          accuracy: true,
          precision: false,
          recall: false,
          f1Score: false,
          aucRoc: false,
        });
        break;
      default:
        setDataType("");
        setLabels("");
        setTokenizationOptions({
          wordTokenization: false,
          sentenceTokenization: false,
          lowercasing: false,
          removeStopwords: false,
          stemmingLemmatization: false,
        });
        setFeatureEngineering("");
        setModelArchitecture("");
        setCustomLayers("");
        setHyperparameters({
          learningRate: 0.001,
          batchSize: 32,
          numberOfEpochs: 10,
        });
        setValidationStrategy("");
        setOptimization("");
        setLossFunction("");
        setEvaluationMetrics({
          accuracy: false,
          precision: false,
          recall: false,
          f1Score: false,
          aucRoc: false,
        });
    }
  };

  const handleTokenizationChange = (event) => {
    setTokenizationOptions({
      ...tokenizationOptions,
      [event.target.name]: event.target.checked,
    });
  };

  const handleEvaluationMetricsChange = (event) => {
    setEvaluationMetrics({
      ...evaluationMetrics,
      [event.target.name]: event.target.checked,
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      setUploadedFile(file);
      const reader = new FileReader();

      if (dataType === "Graph" && file.type === "application/zip") {
        reader.onload = (e) => {
          const content = e.target.result;
          const zip = new JSZip();
          zip
            .loadAsync(content)
            .then((zip) => {
              const filePromises = [];
              zip.forEach((relativePath, zipEntry) => {
                filePromises.push(
                  zipEntry.async("string").then((fileData) => ({
                    fileName: relativePath,
                    content: fileData,
                  }))
                );
              });

              return Promise.all(filePromises);
            })
            .then((files) => {
              console.log("Extracted files from zip:", files);
              validateAndParseData(files);
            })
            .catch((error) => {
              setValidationError("Error extracting or parsing zip file.");
              setLoading(false);
            });
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type === "text/csv") {
        reader.onload = (e) => {
          const content = e.target.result;
          Papa.parse(content, {
            header: true,
            complete: (results) => {
              validateAndParseData(results.data);
            },
            error: (error) => {
              setValidationError("Error parsing CSV file.");
              setLoading(false);
            },
          });
        };
        reader.readAsText(file);
      } else if (file.type === "application/json") {
        reader.onload = (e) => {
          const content = e.target.result;
          try {
            const jsonData = JSON5.parse(content);
            validateAndParseData(jsonData);
          } catch (error) {
            setValidationError("Invalid JSON format.");
            setLoading(false);
          }
        };
        reader.readAsText(file);
      } else {
        setValidationError("Unsupported file format.");
        setLoading(false);
      }
    }
  };

  const validateAndParseData = (data) => {
    const isValid = validateDataset(data);
    if (isValid) {
      setParsedData(data);
      setOpenModal(true);
      setValidationError("");
    } else {
      setValidationError("Invalid dataset. Please check your data.");
    }
    setLoading(false);
  };

  const validateDataset = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return false;
    }

    const headers = Object.keys(data[0]);

    if (headers.length < 2) {
      return false;
    }

    return true;
  };

  const handleModalClose = () => {
    setOpenModal(false);
  };

  const handleConfirm = () => {
    setOpenModal(false);
    console.log("Confirmed dataset:", parsedData);
  };

  const handleStartTraining = async () => {
    try {
      const formData = new FormData();
      const token = localStorage.getItem("token");

      formData.append(
        "config",
        JSON.stringify({
          dataType,
          sequenceLength,
          labels,
          tokenizationOptions,
          featureEngineering,
          modelArchitecture,
          customLayers,
          hyperparameters,
          validationStrategy,
          optimization,
          lossFunction,
          evaluationMetrics,
        })
      );

      formData.append("projectId", projectId);

      console.log(
        "Config:",
        JSON.stringify({
          dataType,
          labels,
          tokenizationOptions,
          featureEngineering,
          modelArchitecture,
          customLayers,
          hyperparameters,
          validationStrategy,
          optimization,
          lossFunction,
          evaluationMetrics,
        })
      );

      if (uploadedFile) {
        const fileArrayBuffer = await uploadedFile.arrayBuffer();
        const fileContent = new Uint8Array(fileArrayBuffer);

        const privateFileData = applyDifferentialPrivacy(
          Array.from(fileContent)
        );

        const privateFileContent = new Uint8Array(privateFileData);

        const processedFile = await encryptFile(
          new Blob([privateFileContent], { type: uploadedFile.type })
        );

        formData.append("dataset", processedFile);
      }

      const response = await trainingOptions(token, formData);
      console.log("Training started with configuration:", formData);

      console.log("res", response);

      setLogs(response.data.logs);
      setVersion(response.version);
      setTerminalOpen(true);
    } catch (error) {
      console.error("Error starting training:", error);
    }
  };

  const handleSeeModels = () => {
    navigate(`/modelDetails/${projectId}`);
  };

  if (!project) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f5f5f5",
      }}
    >
      <Header />
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 4,
          }}
        >
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {project.projectName}
          </Typography>
          <Button variant="contained" onClick={handleOpenCollaboratorModal}>
            Add Collaborator
          </Button>

          <Button variant="contained" color="primary" onClick={handleSeeModels}>
            See Models
          </Button>
        </Box>
        <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel>Template</InputLabel>
          <Select
            value={template}
            onChange={handleTemplateChange}
            label="Template"
          >
            <MenuItem value="Fake News Detection">Fake News Detection</MenuItem>
            <MenuItem value="Fraud Detection">Fraud Detection</MenuItem>
            <MenuItem value="Community Detection">Community Detection</MenuItem>
            <MenuItem value="Custom">Custom</MenuItem>
          </Select>
        </FormControl>

        <Box component="form">
          <TextField
            label="Task Name"
            value={project.taskName}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Description"
            value={project.description}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            variant="outlined"
          />

          <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 4 }}>
            Data Configuration
          </Typography>
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel>Data Type</InputLabel>
            <Select
              value={dataType}
              onChange={(e) => setDataType(e.target.value)}
              label="Data Type"
            >
              <MenuItem value="Tabular">Tabular</MenuItem>
              <MenuItem value="Text">Text</MenuItem>
              <MenuItem value="Image">Image</MenuItem>
              <MenuItem value="Audio">Audio</MenuItem>
              <MenuItem value="Time Series">Time Series</MenuItem>
              <MenuItem value="Graph">Graph</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button variant="contained" component="label">
              Upload Dataset
              <input type="file" hidden onChange={handleFileUpload} />
            </Button>
            {uploadedFile && (
              <Typography variant="body1" sx={{ ml: 2 }}>
                {uploadedFile.name}
              </Typography>
            )}
          </Box>
          {loading && <CircularProgress sx={{ mt: 2 }} />}
          {validationError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {validationError}
            </Typography>
          )}
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel>Labels</InputLabel>
            <Select
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              label="Labels"
            >
              <MenuItem value="Binary">Binary</MenuItem>
              <MenuItem value="Multi-Class">Multi-Class</MenuItem>
              <MenuItem value="Regression">Regression</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 4 }}>
            Preprocessing Options
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={tokenizationOptions.wordTokenization}
                onChange={handleTokenizationChange}
                name="wordTokenization"
              />
            }
            label="Word Tokenization"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={tokenizationOptions.sentenceTokenization}
                onChange={handleTokenizationChange}
                name="sentenceTokenization"
              />
            }
            label="Sentence Tokenization"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={tokenizationOptions.lowercasing}
                onChange={handleTokenizationChange}
                name="lowercasing"
              />
            }
            label="Lowercasing"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={tokenizationOptions.removeStopwords}
                onChange={handleTokenizationChange}
                name="removeStopwords"
              />
            }
            label="Remove Stopwords"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={tokenizationOptions.stemmingLemmatization}
                onChange={handleTokenizationChange}
                name="stemmingLemmatization"
              />
            }
            label="Stemming/Lemmatization"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Feature Engineering</InputLabel>
            <Select
              value={featureEngineering}
              onChange={(e) => setFeatureEngineering(e.target.value)}
            >
              <MenuItem value="TF-IDF">TF-IDF</MenuItem>
              <MenuItem value="Word Embeddings">Word Embeddings</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 4 }}>
            Model Configuration
          </Typography>
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel>Model Architecture</InputLabel>
            <Select
              value={modelArchitecture}
              onChange={(e) => setModelArchitecture(e.target.value)}
              label="Model Architecture"
            >
              <MenuItem value="GNN">GNN</MenuItem>
              <MenuItem value="CNN">CNN</MenuItem>
              <MenuItem value="LSTM">LSTM</MenuItem>
              <MenuItem value="Custom">Custom</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Custom Layers"
            value={customLayers}
            onChange={(e) => setCustomLayers(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Learning Rate"
            type="number"
            value={hyperparameters.learningRate}
            onChange={(e) =>
              setHyperparameters({
                ...hyperparameters,
                learningRate: e.target.value,
              })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Batch Size"
            type="number"
            value={hyperparameters.batchSize}
            onChange={(e) =>
              setHyperparameters({
                ...hyperparameters,
                batchSize: e.target.value,
              })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Number of Epochs"
            type="number"
            value={hyperparameters.numberOfEpochs}
            onChange={(e) =>
              setHyperparameters({
                ...hyperparameters,
                numberOfEpochs: e.target.value,
              })
            }
            fullWidth
            margin="normal"
          />

          <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 4 }}>
            Training Configuration
          </Typography>

          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel>Validation Strategy</InputLabel>
            <Select
              value={validationStrategy}
              onChange={(e) => setValidationStrategy(e.target.value)}
              label="Validation Strategy"
            >
              <MenuItem value="Train-Validation-Test Split">
                Train-Validation-Test Split
              </MenuItem>
              <MenuItem value="K-Fold Cross-Validation">
                K-Fold Cross-Validation
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel>Optimization</InputLabel>
            <Select
              value={optimization}
              onChange={(e) => setOptimization(e.target.value)}
              label="Optimization"
            >
              <MenuItem value="Adam">Adam</MenuItem>
              <MenuItem value="SGD">SGD</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel>Loss Function</InputLabel>
            <Select
              value={lossFunction}
              onChange={(e) => setLossFunction(e.target.value)}
              label="Loss Function"
            >
              <MenuItem value="Binary Cross-Entropy">
                Binary Cross-Entropy
              </MenuItem>
              <MenuItem value="Mean Squared Error">Mean Squared Error</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 4 }}>
            Evaluation Metrics
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={evaluationMetrics.accuracy}
                onChange={handleEvaluationMetricsChange}
                name="accuracy"
              />
            }
            label="Accuracy"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={evaluationMetrics.precision}
                onChange={handleEvaluationMetricsChange}
                name="precision"
              />
            }
            label="Precision"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={evaluationMetrics.recall}
                onChange={handleEvaluationMetricsChange}
                name="recall"
              />
            }
            label="Recall"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={evaluationMetrics.f1Score}
                onChange={handleEvaluationMetricsChange}
                name="f1Score"
              />
            }
            label="F1-Score"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={evaluationMetrics.aucRoc}
                onChange={handleEvaluationMetricsChange}
                name="aucRoc"
              />
            }
            label="AUC-ROC"
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 4, mb: 4 }}
            onClick={handleStartTraining}
          >
            Start Training
          </Button>
        </Box>

        <Terminal
          open={terminalOpen}
          handleClose={() => setTerminalOpen(false)}
          logs={logs}
          projectName={project.projectName}
          project_id={projectId}
        />

        <Modal open={openModal} onClose={handleModalClose}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "80%",
              maxHeight: "80%",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              overflowY: "auto",
              border: "2px solid #000",
            }}
          >
            <Typography variant="h6" component="h2" gutterBottom>
              Review Dataset
            </Typography>
            <Box
              sx={{
                maxHeight: "60vh",
                overflowY: "auto",
                border: "1px solid #ccc",
                borderRadius: 1,
                p: 2,
              }}
            >
              <pre>{JSON.stringify(parsedData, null, 2)}</pre>
            </Box>
            {validationError ? (
              <Typography color="error" sx={{ mt: 2 }}>
                {validationError}
              </Typography>
            ) : (
              <Typography color="success.main" sx={{ mt: 2 }}>
                Dataset is valid.
              </Typography>
            )}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleConfirm}
              >
                Confirm Upload
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleModalClose}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Modal>
        <Modal
          open={collaboratorModalOpen}
          onClose={handleCloseCollaboratorModal}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" component="h2">
              Add Collaborator
            </Typography>
            <TextField
              label="Collaborator Email"
              value={collaboratorEmail}
              onChange={(e) => setCollaboratorEmail(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
              <Button variant="contained" onClick={handleAddCollaborator}>
                Confirm
              </Button>
              <Button variant="outlined" onClick={handleCloseCollaboratorModal}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Modal>
      </Container>
    </Box>
  );
}

export default ProjectDetails;
