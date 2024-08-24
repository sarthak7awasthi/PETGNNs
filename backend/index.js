require("dotenv").config();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");
const UserModel = require("./auth_model");
const ProjectModel = require("./project_model");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());
const JWT_SECRET = process.env.JWT_SECRET;

const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const upload = multer();

const bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post("/signup", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new UserModel({
      email: req.body.email,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ message: "Error in signup" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Error in login" });
  }
});

app.post("/logout", (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ message: "Error in logout" });
  }
});

app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ email: user.email });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

app.get("/user-projects", authenticateToken, async (req, res) => {
  try {
    const projects = await ProjectModel.find({ userId: req.user.userId });
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching user projects:", error);
    res.status(500).json({ message: "Error fetching user projects" });
  }
});

app.get("/collaborators-projects", authenticateToken, async (req, res) => {
  try {
    const projects = await ProjectModel.find({
      collaborators: req.user.userId,
    });

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching user projects:", error);
    res.status(500).json({ message: "Error fetching user projects" });
  }
});

app.get("/public-projects", async (req, res) => {
  try {
    const projects = await ProjectModel.find({ privacyStatus: "Public" });
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching public projects:", error);
    res.status(500).json({ message: "Error fetching public projects" });
  }
});

app.post("/projects", authenticateToken, async (req, res) => {
  try {
    const newProject = new ProjectModel({
      projectName: req.body.projectName,
      taskName: req.body.taskName,
      description: req.body.description,
      privacyStatus: req.body.privacyStatus,
      status: "Active",

      userId: req.user.userId,
    });
    await newProject.save();
    res
      .status(201)
      .json({ message: "Project created successfully", project: newProject });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Error creating project" });
  }
});

app.get("/projects/:projectId", authenticateToken, async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error("Error fetching project details:", error);
    res.status(500).json({ message: "Error fetching project details" });
  }
});

app.post(
  "/training-options",
  authenticateToken,
  upload.single("dataset"),
  async (req, res) => {
    const userId = req.user.userId;
    const config = JSON.parse(req.body.config);
    const project_id = req.body.projectId;
    const file = req.file;

    console.log("User ID:", userId);
    console.log("Project_id", project_id);
    console.log("Configuration:", JSON.stringify(config, null, 2));

    if (file) {
      console.log("File received:", file.originalname);
    }

    const formData = new FormData();
    formData.append("configuration", JSON.stringify({ ...config, userId }));
    if (file) {
      formData.append("file", file.buffer, file.originalname);
    }
    formData.append("project_id", project_id);

    try {
      const response = await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );

      res.status(200).json({
        message: "Configuration and file forwarded successfully",
        data: response.data,
      });
    } catch (error) {
      console.error("Error forwarding to Central Python Server:", error);
      res
        .status(500)
        .json({ message: "Error forwarding to Central Python Server" });
    }
  }
);

app.post("/download-model", async (req, res) => {
  try {
    const { project_id, version } = req.body;

    if (!project_id || !version) {
      return res.status(400).send("project_id and version are required.");
    }

    const response = await axios.post(
      "http://localhost:5000/download-model",
      req.body,
      {
        responseType: "stream",
      }
    );

    res.setHeader(
      "Content-Disposition",
      response.headers["content-disposition"] || "attachment"
    );
    res.setHeader(
      "Content-Type",
      response.headers["content-type"] || "application/octet-stream"
    );

    response.data.pipe(res);
  } catch (error) {
    console.error("Error forwarding request:", error.message);
    res.status(500).send("Error retrieving the file.");
  }
});

app.post("/learning-curves", authenticateToken, async (req, res) => {
  const project_id = req.body.projectId;

  console.log("Project_id", project_id);

  try {
    const response = await axios.post(
      "http://localhost:5000/learning-curves",
      { project_id },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({
      message: "Project_id forwarded successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error forwarding to Central Python Server:", error);
    res
      .status(500)
      .json({ message: "Error forwarding to Central Python Server" });
  }
});

app.post("/get-deploy-url", async (req, res) => {
  try {
    const { project_id, version } = req.body;

    if (!project_id || !version) {
      return res.status(400).send("project_id and version are required.");
    }

    const response = await axios.post(
      "http://localhost:5000/deploy-model",
      req.body
    );

    const { url } = response.data;

    if (!url) {
      return res.status(500).send("Deployment URL not received.");
    }

    res.json({ deploy_url: url });
  } catch (error) {
    console.error("Error processing request:", error.message);
    res.status(500).send("Error retrieving the deployment URL.");
  }
});

app.post("/get-confusion-matrix", async (req, res) => {
  try {
    const { project_id, version } = req.body;

    if (!project_id || !version) {
      return res
        .status(400)
        .json({ error: "project_id and version are required." });
    }

    const response = await axios.post(
      "http://localhost:5000/confusion-matrix",
      {
        project_id,
        version,
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error("Error forwarding request:", error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res
      .status(500)
      .json({ error: "Error retrieving the confusion matrix data." });
  }
});

app.post("/add-collaborators", async (req, res) => {
  try {
    const { projectId } = req.body;
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.collaborators.includes(user._id)) {
      return res
        .status(400)
        .json({ message: "User is already a collaborator" });
    }

    project.collaborators.push(user._id);
    await project.save();

    res
      .status(200)
      .json({ message: "Collaborator added successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Error updating collaborators", error });
  }
});

app.post("/selected-metrics", async (req, res) => {
  const { project_ids } = req.body;

  if (!Array.isArray(project_ids)) {
    return res.status(400).json({ error: "project_ids should be a list" });
  }

  try {
    const response = await axios.post(
      "http://localhost:5000/selected-metrics",
      {
        project_ids,
      }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      res.status(500).json({ error: "No response from the Python API" });
    } else {
      res.status(500).json({ error: "Error in making request to Python API" });
    }
  }
});

module.exports = app;
