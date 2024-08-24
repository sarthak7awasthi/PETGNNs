import React, { useState, useEffect } from "react";
import {
  fetchLearningCurves,
  downloadModel,
  getDeployUrl,
  getConfusionMatrix,
} from "../requests/auth";
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Modal,
  Paper,
} from "@mui/material";
import { Line, Bar } from "react-chartjs-2";
import { useParams } from "react-router-dom";
import Header from "./Header";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const ModelDetails = () => {
  const { project_id } = useParams();
  const token = localStorage.getItem("token");
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [deployUrl, setDeployUrl] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confusionMatrices, setConfusionMatrices] = useState({});

  useEffect(() => {
    const loadLearningCurves = async () => {
      try {
        const data = await fetchLearningCurves(project_id, token);
        console.log("Fetched data:", data.data.metrics);

        if (data && data.data.metrics) {
          const metrics = data.data.metrics;
          console.log("met", metrics);

          const versions = Object.keys(metrics);

          if (versions.length === 0) {
            console.warn("No version data available in metrics");
            return;
          }

          const defaultComparisonData = {
            labels: metrics[versions[0]].epochs.map(
              (epoch, index) => `Epoch ${index + 1}`
            ),
            datasets: versions.map((version) => ({
              label: `Training Accuracy - ${version}`,
              data: metrics[version].training_accuracy,
              borderColor: getColor(version),
              fill: false,
            })),
          };

          setComparisonData(defaultComparisonData);

          const modelList = versions.map((version) => ({
            version,
            data: metrics[version],
          }));

          setModels(modelList);
        } else {
          console.error("Metrics data is undefined or null");
        }
      } catch (error) {
        console.error("Error loading learning curves:", error);
      }
    };

    loadLearningCurves();
  }, [project_id, token]);

  useEffect(() => {
    const fetchConfusionMatrices = async () => {
      try {
        const matrices = {};
        for (let model of models) {
          const data = await getConfusionMatrix(project_id, model.version);
          console.log("that", data, model.version);
          matrices[model.version] =
            data.confusion_matrices[model.version] || null;
        }
        setConfusionMatrices(matrices);
      } catch (error) {
        console.error("Error fetching confusion matrices:", error);
      }
    };

    if (models.length > 0) {
      fetchConfusionMatrices();
    }
  }, [models, project_id]);

  const getColor = (version) => {
    const colors = {
      "version1.0": "rgba(255,99,132,1)",
      "version2.0": "rgba(54,162,235,1)",
      "version3.0": "rgba(255,206,86,1)",
      "version4.0": "rgba(75,192,192,1)",
    };
    return colors[version] || "rgba(153,102,255,1)";
  };

  const handleCardClick = (model) => {
    setSelectedModel(model);
  };

  const handleDownload = async () => {
    if (!selectedModel) {
      alert("Please select a model to download.");
      return;
    }
    try {
      await downloadModel(project_id, selectedModel.version);
    } catch (error) {
      console.error("Error downloading model:", error);
    }
  };

  const handleDeploy = async () => {
    if (!selectedModel) {
      alert("Please select a model to deploy.");
      return;
    }
    try {
      const url = await getDeployUrl(project_id, selectedModel.version);
      setDeployUrl(url);
      setModalOpen(true);
    } catch (error) {
      console.error("Error getting deployment URL:", error);
    }
  };

  const renderModelCards = () => {
    return models.map((model) => (
      <Card
        key={model.version}
        sx={{
          marginBottom: 2,
          cursor: "pointer",
          border:
            selectedModel?.version === model.version
              ? "2px solid #4b8bf4"
              : "1px solid #ccc",
        }}
        onClick={() => handleCardClick(model)}
      >
        <CardContent>
          <Typography variant="h6">{model.version}</Typography>
          <Typography variant="body2">Model statistics overview...</Typography>
        </CardContent>
      </Card>
    ));
  };

  const renderLearningCurves = () => {
    if (!selectedModel) {
      return (
        <Line
          data={comparisonData}
          options={{
            responsive: true,
            title: { display: true, text: "Default Comparison Graph" },
          }}
          key={"default"}
        />
      );
    }

    const selectedData = {
      labels: selectedModel.data.epochs.map(
        (epoch, index) => `Epoch ${index + 1}`
      ),
      datasets: [
        {
          label: "Training Accuracy",
          data: selectedModel.data.training_accuracy,
          borderColor: "rgba(75,192,192,1)",
          fill: false,
        },
        {
          label: "Training Loss",
          data: selectedModel.data.training_loss,
          borderColor: "rgba(255,99,132,1)",
          fill: false,
        },
      ],
    };

    return (
      <Line
        data={selectedData}
        options={{
          responsive: true,
          title: {
            display: true,
            text: `Learning Curves for ${selectedModel.version}`,
          },
        }}
        key={selectedModel.version}
      />
    );
  };

  const renderConfusionMatrix = () => {
    if (!selectedModel) return null;

    const matrixData = confusionMatrices[selectedModel.version];
    if (!matrixData) return null;

    const { true_positives, false_positives, true_negatives, false_negatives } =
      matrixData;

    const data = {
      labels: [
        "True Positives",
        "False Positives",
        "True Negatives",
        "False Negatives",
      ],
      datasets: [
        {
          label: "Count",
          data: [
            true_positives,
            false_positives,
            true_negatives,
            false_negatives,
          ],
          backgroundColor: [
            "rgba(75, 192, 192, 0.6)",
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
          ],
        },
      ],
    };

    const options = {
      indexAxis: "y",
      scales: {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Count",
          },
        },
        y: {
          title: {
            display: true,
            text: "Metrics",
          },
        },
      },
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const { raw } = context;
              return `Count: ${raw}`;
            },
          },
        },
      },
    };

    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          Confusion Matrix for {selectedModel.version}
        </Typography>
        <Bar data={data} options={options} />
      </Box>
    );
  };

  const renderModal = () => (
    <Modal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      aria-labelledby="deployment-url-modal-title"
      aria-describedby="deployment-url-modal-description"
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
        <Typography id="deployment-url-modal-title" variant="h6" component="h2">
          Deployment URL
        </Typography>
        <Paper
          sx={{
            mt: 2,
            p: 2,
            bgcolor: "#f5f5f5",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}
        >
          <Typography component="code">
            {`curl -X POST ${deployUrl} -H "Content-Type: application/json" -d '{"predict_against": ""}'`}
          </Typography>
        </Paper>
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          color="primary"
          onClick={() =>
            navigator.clipboard.writeText(
              `curl -X POST ${deployUrl} -H "Content-Type: application/json" -d '{"predict_against": ""}'`
            )
          }
        >
          Copy URL
        </Button>
      </Box>
    </Modal>
  );

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
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700, mt: 4 }}
        >
          Models Dashboard
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box sx={{ flex: 1 }}>{renderModelCards()}</Box>
          <Box sx={{ flex: 3 }}>
            {comparisonData && renderLearningCurves()}
            {renderConfusionMatrix()}
            {selectedModel && (
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDownload}
                >
                  Download Model
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleDeploy}
                >
                  Deploy API
                </Button>
              </Box>
            )}
          </Box>
        </Box>
        {renderModal()}
      </Container>
    </Box>
  );
};

export default ModelDetails;
