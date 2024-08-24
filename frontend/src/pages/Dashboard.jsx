import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatisticsChart from "./StatisticsChart";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Modal,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  AddCircleOutline,
  Public,
  Assessment,
  Notifications,
} from "@mui/icons-material";
import Header from "./Header";
import {
  getUserProjects,
  getPublicProjects,
  createProject,
  getSelectedMetrics,
} from "../requests/auth";

function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [publicProjects, setPublicProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [privacyStatus, setPrivacyStatus] = useState("Private");
  const [metricsData, setMetricsData] = useState({}); // Use camelCase for state variables

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      fetchProjects(token);
      fetchPublicProjects();
    }
  }, [navigate]);

  const fetchProjects = async (token) => {
    try {
      const data = await getUserProjects(token);
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchPublicProjects = async () => {
    try {
      const data = await getPublicProjects();
      setPublicProjects(data);
    } catch (error) {
      console.error("Error fetching public projects:", error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await createProject(
        token,
        projectName,
        taskName,
        description,
        privacyStatus
      );
      fetchProjects(token);
      fetchPublicProjects();
      handleClose();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleCardClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const fetchSelectedMetrics = async () => {
    const privateProjectIds = projects
      .filter((project) => project.privacyStatus === "Private")
      .map((project) => project._id);

    if (privateProjectIds.length === 0) {
      console.log("No private projects found");
      return;
    }

    try {
      const data = await getSelectedMetrics(privateProjectIds);
      if (data && data.metrics) {
        setMetricsData(data.metrics);
      } else {
        setMetricsData({});
      }
    } catch (error) {
      console.error("Error fetching selected metrics:", error);
      setMetricsData({});
    }
  };

  useEffect(() => {
    if (projects.length > 0) {
      fetchSelectedMetrics();
    }
  }, [projects]);

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
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            mt: 4,
          }}
        >
          Project Dashboard
        </Typography>

        {/* Project Overview */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 4,
            mb: 2,
          }}
        >
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            Project Overview
          </Typography>
          <Button variant="contained" color="primary" onClick={handleOpen}>
            Create Project
          </Button>
        </Box>

        <Grid container spacing={3}>
          {projects.slice(0, 4).map((project, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                onClick={() => handleCardClick(project._id)}
                style={{ cursor: "pointer" }}
              >
                <CardContent>
                  <Typography variant="h6" component="h3">
                    {project.projectName}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 2 }}
                  >
                    {project.description}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Status: {project.status}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Public Projects */}
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{
            mt: 4,
            display: "flex",
            alignItems: "center",
            fontWeight: 600,
            borderBottom: 1,
            borderColor: "divider",
            pb: 1,
          }}
        >
          <Public sx={{ mr: 1 }} />
          Public Projects
        </Typography>
        <Grid container spacing={3}>
          {publicProjects.slice(0, 4).map((project, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                onClick={() => handleCardClick(project._id)}
                style={{ cursor: "pointer" }}
              >
                <CardContent>
                  <Typography variant="h6" component="h3">
                    {project.projectName}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 2 }}
                  >
                    {project.description}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Status: {project.status}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Statistics and Metrics */}
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{
            mt: 4,
            display: "flex",
            alignItems: "center",
            fontWeight: 600,
            borderBottom: 1,
            borderColor: "divider",
            pb: 1,
          }}
        >
          <Assessment sx={{ mr: 1 }} />
          Statistics and Metrics
        </Typography>
        <Box sx={{ mt: 2 }}>
          {Object.keys(metricsData).length > 0 ? (
            <StatisticsChart metrics={metricsData} />
          ) : (
            <Typography variant="body1">No metrics available.</Typography>
          )}
        </Box>
        {/* Modal for Creating Project */}
        <Modal open={open} onClose={handleClose}>
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
            <Typography variant="h6" component="h2" gutterBottom>
              Create New Project
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                fullWidth
                margin="normal"
              />
              <TextField
                label="Task Name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                required
                fullWidth
                margin="normal"
              />
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                fullWidth
                margin="normal"
                multiline
                rows={4}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Privacy Status</InputLabel>
                <Select
                  value={privacyStatus}
                  onChange={(e) => setPrivacyStatus(e.target.value)}
                  required
                >
                  <MenuItem value="Private">Private</MenuItem>
                  <MenuItem value="Public">Public</MenuItem>
                </Select>
              </FormControl>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Create
              </Button>
            </Box>
          </Box>
        </Modal>
      </Container>
    </Box>
  );
}

export default Dashboard;
