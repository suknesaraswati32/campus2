const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const session = require("express-session");
const path = require("path");

const Job = require("./models/Job");
const Application = require("./models/Application"); 
const Company = require("./models/Company");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

const fs = require("fs");

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Routes
const studentRoutes = require("./routes/studentRoutes");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const companyAuthRoutes = require("./routes/companyAuthRoutes");
const app = express();

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "mysecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false   
  }
}));

// Static files
app.use(express.static(path.join(__dirname, "../client/public")));
app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api/students", studentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/company-auth", companyAuthRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Page Routes
app.get("/", (req, res) => res.render("index"));

app.get("/jobs", async (req, res) => {
  const jobs = await Job.find();
  res.render("jobs", { jobs });
});
app.get("/login", (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));
app.get("/jobs/new", (req, res) => res.render("newjobs"));
const Student = require("./models/Student");

app.get("/student-dashboard", async (req, res) => {

  console.log("SESSION:", req.session); // 👈 DEBUG

  if (!req.session.userId) {
    return res.redirect("/login");
  }

  const student = await Student.findById(req.session.userId);

  res.render("student-dashboard", { student });
});
app.get("/company-dashboard", async (req, res) => {
  if (!req.session.companyId) {
    return res.redirect("/company/login");
  }

  const company = await Company.findById(
    req.session.companyId
  ).populate("postedJobs");

  res.render("company-dashboard", { company });
});


app.post("/jobs", async (req, res) => {
  try {
    const {
      jobTitle,
      company,
      package,
      location,
      requiredSkills,
      minimumCGPA,
      deadline,
      category   
    } = req.body;

    const skillsArray = requiredSkills.split(",");

    const newJob = new Job({
      jobTitle,
      company,
      package,
      location,
      requiredSkills: skillsArray,
      minimumCGPA,
      deadline,
      category   
    });

    await newJob.save();

    res.redirect("/jobs");

  } catch (err) {
    console.log(err);
    res.send("Error saving job");
  }
});

//apply root

app.get("/apply/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    res.render("apply", { job });
  } catch (err) {
    res.send("Error loading application page");
  }
});




app.post("/apply/:id", upload.single("resume"), async (req, res) => {
  try {

    if (!req.session.userId) {
      return res.redirect("/login");
    }

    const {
      name,
      email,
      cgpa,
      skills,
      twelfthMarks,
      college,
      degree,
      coverLetter
    } = req.body;

    const newApplication = new Application({
      student: req.session.userId,
      job: req.params.id,

      name,
      email,
      cgpa,
      skills: skills ? skills.split(",") : [],

      twelfthMarks,
      college,
      degree,
      coverLetter,

      resume: req.file ? req.file.filename : null
    });

    await newApplication.save();

    res.redirect("/applications");

  } catch (err) {
    console.log(err);
    res.send("Error submitting application");
  }
});

app.get("/applications", async (req, res) => {

  try {
    if (!req.session.userId) {
      return res.redirect("/login");
    }

    const applications = await Application.find({ student: req.session.userId })
      .populate("job");

    res.render("admin-applications", { applications });

  } catch (err) {
    console.log(err);
    res.send("Error loading applications");
  }

});
  
app.get("/admin/applications", async (req, res) => {

  try {

    const applications = await Application.find()
      .populate("job")      
      .populate("student"); 

    res.render("admin-applications", { applications });

  } catch (err) {
    console.log(err);
    res.send("Error loading applications");
  }

});

 
// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));