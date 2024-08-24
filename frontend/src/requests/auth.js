require("dotenv").config();

const API_URL = process.env.API_URL;

export const signup = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Signup failed");
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Error during signup");
  }
};

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Error during login");
  }
};

export const logout = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Logout failed");
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Error during logout");
  }
};

export const getUserProfile = async (token) => {
  try {
    const response = await fetch(`${API_URL}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch profile");
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Error fetching profile");
  }
};

export const getUserProjects = async (token) => {
  try {
    const response = await fetch(`${API_URL}/user-projects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user projects");
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Error fetching user projects");
  }
};

export const getPublicProjects = async () => {
  try {
    const response = await fetch(`${API_URL}/public-projects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch public projects");
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Error fetching public projects");
  }
};

export const createProject = async (
  token,
  projectName,
  taskName,
  description,
  privacyStatus
) => {
  try {
    const response = await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        projectName,
        taskName,
        description,
        privacyStatus,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create project");
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Error creating project");
  }
};

export const getProjectDetails = async (token, projectId) => {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch project details");
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Error fetching project details");
  }
};

export const trainingOptions = async (token, formData) => {
  try {
    const response = await fetch(`${API_URL}/training-options`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Training request failed");
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Error during training request");
  }
};

export const fetchLearningCurves = async (projectId, token) => {
  try {
    const response = await fetch(`${API_URL}/learning-curves`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ projectId }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching learning curves:", error);
    throw error;
  }
};

export const downloadModel = async (projectId, version) => {
  try {
    const response = await fetch(`${API_URL}/download-model`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ project_id: projectId, version }),
    });

    if (!response.ok) {
      throw new Error("Failed to download the model.");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `model_${version}.pt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading model:", error);
    alert("Failed to download the model.");
  }
};

export const getDeployUrl = async (projectId, version) => {
  try {
    const response = await fetch(`${API_URL}/get-deploy-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ project_id: projectId, version }),
    });

    if (!response.ok) {
      throw new Error("Failed to get deployment URL.");
    }

    const data = await response.json();
    return data.deploy_url;
  } catch (error) {
    console.error("Error fetching deployment URL:", error);
    throw error;
  }
};

export const getConfusionMatrix = async (projectId, version) => {
  try {
    const response = await fetch(`${API_URL}/get-confusion-matrix`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ project_id: projectId, version }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch confusion matrix.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching confusion matrix:", error);
    throw error;
  }
};

export const addCollaborator = async (token, projectId, email) => {
  try {
    const response = await fetch(`${API_URL}/add-collaborators`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, projectId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add collaborator");
    }

    return data;
  } catch (error) {
    console.error("Error adding collaborator:", error);
    throw error;
  }
};

export async function getCollaboratorProjects(token) {
  try {
    const response = await fetch(`${API_URL}/collaborators-projects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch collaborator projects");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching collaborator projects:", error);
    throw error;
  }
}

export const getSelectedMetrics = async (projectIds) => {
  try {
    const response = await fetch(`${API_URL}/selected-metrics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ project_ids: projectIds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch selected metrics.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching selected metrics:", error);
    return {
      error: error.message || "An error occurred while fetching metrics.",
    };
  }
};
