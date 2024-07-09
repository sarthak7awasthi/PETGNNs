require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');
const UserModel = require('./auth_model'); 
const ProjectModel = require('./project_model');
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('Connected to MongoDB');
  }).catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
  });

const express = require('express');
const app = express();

const cors = require('cors');


app.use(cors());
const JWT_SECRET = process.env.JWT_SECRET;



const bodyParser = require('body-parser');

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json());



app.post('/signup', async (req, res) => {
    try {
      console.log("body", req.body);
      
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
      const user = new UserModel({
        email: req.body.email,
        password: hashedPassword
      
      });
      await user.save();
      res.status(201).send('User created successfully');
    } catch (error) {
      console.error('Error in signup:', error);
      res.status(500).send('Error in signup');
    }
  });
  
  
  app.post('/login', async (req, res) => {
    try {
    
      let user = await UserModel.findOne({ email: req.body.email });
      let userType = 'instructor'; 
  
     
      if (!user) {
        user = await StudentModel.findOne({ email: req.body.email });
        userData = { fullName: user.fullName };
        userType = 'student';
      }
  
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) {
        return res.status(401).send('Invalid password');
      }
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      if (userType === 'student') {
      
        return res.status(200).json({ token, student: true,  userData });
      } else {
        
        return res.status(200).json({ token, student: false });
      }
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).send('Error in login');
    }
  });
  
  
  app.post('/logout',  async (req, res) => {
    try {
      
  
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      
      const userId = decodedToken.userId;
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send('Invalid token');
        } else {
          res.status(200).send('Logged out successfully');
        }
      });
    } catch (error) {
      console.error('Error in logout:', error);
      res.status(500).send('Error in logout');
    }
  });
  


  // Create a new project
app.post('/projects', async (req, res) => {
  try {
      const { name, description, collaborators, taskType, gnnDetails, privacySettings } = req.body;
      const project = new ProjectModel({
          name,
          description,
          collaborators,
          taskType,
          gnnDetails,
          privacySettings
      });
      await project.save();
      res.status(201).json(project);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Get all projects for a specific user
app.get('/projects/:email', async (req, res) => {
  try {
      const email = req.params.email;
      const projects = await ProjectModel.find({ collaborators: email });
      res.status(200).json(projects);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Get a single project by name
app.get('/projects/project/:name', async (req, res) => {
  try {
      const projectName = req.params.name;
      const project = await ProjectModel.findOne({ name: projectName });
      if (!project) {
          return res.status(404).json({ message: 'Project not found' });
      }
      res.status(200).json(project);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Update a project by name
app.put('/projects/:name', async (req, res) => {
  try {
      const projectName = req.params.name;
      const updatedData = req.body;
      const project = await ProjectModel.findOneAndUpdate({ name: projectName }, updatedData, { new: true });
      if (!project) {
          return res.status(404).json({ message: 'Project not found' });
      }
      res.status(200).json(project);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;