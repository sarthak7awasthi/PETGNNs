import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import Header from "./Header";
import { getUserProjects, getCollaboratorProjects } from "../requests/auth";

function Projects() {
  const navigate = useNavigate();
  const [userProjects, setUserProjects] = useState([]);
  const [collaboratorProjects, setCollaboratorProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [privacyFilter, setPrivacyFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      fetchProjects(token);
      fetchCollaboratorProjects(token);
    }
  }, [navigate]);

  const fetchProjects = async (token) => {
    try {
      setLoading(true);
      const data = await getUserProjects(token);
      setUserProjects(data);
    } catch (error) {
      console.error("Error fetching user projects:", error);
      setError("Error fetching user projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchCollaboratorProjects = async (token) => {
    try {
      setLoading(true);
      const data = await getCollaboratorProjects(token);
      setCollaboratorProjects(data);
    } catch (error) {
      console.error("Error fetching collaborator projects:", error);
      setError("Error fetching collaborator projects");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCardClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const filteredUserProjects = userProjects.filter((project) => {
    return (
      (statusFilter === "All" || project.status === statusFilter) &&
      (privacyFilter === "All" || project.privacyStatus === privacyFilter) &&
      (project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const filteredCollaboratorProjects = collaboratorProjects.filter(
    (project) => {
      return (
        (statusFilter === "All" || project.status === statusFilter) &&
        (privacyFilter === "All" || project.privacyStatus === privacyFilter) &&
        (project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
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
          Projects
        </Typography>

        {/* Search and Filter */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 4,
            gap: 2,
          }}
        >
          <TextField
            label="Search Projects"
            value={searchTerm}
            onChange={handleSearch}
            margin="normal"
            sx={{ flex: 1, minWidth: "250px" }}
          />
          <FormControl fullWidth sx={{ minWidth: "120px", flex: "none" }}>
            {" "}
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ minWidth: "120px", flex: "none" }}>
            {" "}
            <InputLabel>Privacy</InputLabel>
            <Select
              value={privacyFilter}
              onChange={(e) => setPrivacyFilter(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Private">Private</MenuItem>
              <MenuItem value="Public">Public</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Snackbar
                open={Boolean(error)}
                autoHideDuration={6000}
                onClose={() => setError("")}
              >
                <Alert
                  onClose={() => setError("")}
                  severity="error"
                  sx={{ width: "100%" }}
                >
                  {error}
                </Alert>
              </Snackbar>
            )}

            {/* User Projects */}
            <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
              Your Projects
            </Typography>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {filteredUserProjects.map((project, index) => (
                <Grid item xs={12} md={4} key={`user-${index}`}>
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
                      <Typography variant="body2" color="textSecondary">
                        Privacy: {project.privacyStatus}
                      </Typography>
                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Button variant="outlined" color="primary">
                          Edit
                        </Button>
                        <Button variant="outlined" color="secondary">
                          Delete
                        </Button>
                        <Button variant="contained" color="primary">
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Collaborator Projects */}
            <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
              Collaborator Projects
            </Typography>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {filteredCollaboratorProjects.map((project, index) => (
                <Grid item xs={12} md={4} key={`collaborator-${index}`}>
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
                      <Typography variant="body2" color="textSecondary">
                        Privacy: {project.privacyStatus}
                      </Typography>
                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Button variant="outlined" color="primary">
                          Edit
                        </Button>
                        <Button variant="outlined" color="secondary">
                          Delete
                        </Button>
                        <Button variant="contained" color="primary">
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
}

export default Projects;
