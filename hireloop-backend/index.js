import express from "express"
import 'dotenv/config'
import cors from "cors";
import { MongoClient,ObjectId } from 'mongodb';

const app = express();
const port = process.env.port || 5000;

app.use(express.json());


app.use(cors({
    origin: process.env.FRONTEND_URL_LOCAL,
    credentials: true,
}));



//connect Mongodb
const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("You successfully connected to MongoDB!");
        return client;
    } catch (err) {
        console.dir(err);
    }
}

const connectedClient = await connectToMongoDB();
const database = connectedClient.db("hireloop-db1");
const users = database.collection("user");
const jobs = database.collection("jobs");
const companies = database.collection("companies");
const savedJobs = database.collection("savedJobs");
const applications = database.collection("applications");
await Promise.all([
  savedJobs.createIndex({ userId: 1, jobId: 1 }, { unique: true }),
  applications.createIndex({ userId: 1, jobId: 1 }, { unique: true }),
]);


//server home : http://localhost:5000
app.get('/', (req, res) => {
    res.send('Hello! Welcome to Hireloop Server')
})

//post job
app.post("/employer/add-job", async (req, res) => {
    const newJob = {
        ...req.body,
        createdAt: new Date(),
    };
    console.log("data from client", newJob); //message to server console    

    const result = await jobs.insertOne(newJob);
    res.send(result);
});


app.get("/employer/jobs", async (req, res) => {
    const allJobs = await jobs.find({}).toArray();
    res.send(allJobs);

})


// browse jobs with search + filter combined (basic)
// app.get("/jobs", async (req, res) => {
//   const search = req.query.search || "";
//   const jobType = req.query.jobType;

//   const query = {};

//   // Search by job title
//   if (search) {
//     query.title = {
//       $regex: search,
//       $options: "i",
//     };
//   }

//   // Filter by job type
//   if (jobType) {
//     query.jobType = jobType;
//   }

//   const result = await jobs.find(query).toArray();

//   res.send(result);
// });


// browse jobs with search + filter combined 

app.get("/jobs", async (req, res) => {
  try {
    // 1. Read and validate query parameters
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const jobType =
      typeof req.query.jobType === "string"
        ? req.query.jobType
        : "";

    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      50
    );

    const sort =
      typeof req.query.sort === "string"
        ? req.query.sort
        : "newest";

    // 2. Escape special regex characters
    const escapedSearch = search.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    // 3. Build search query
    const searchQuery = {};

    if (escapedSearch) {
      searchQuery.title = {
        $regex: escapedSearch,
        $options: "i",
      };
    }

    // 4. Build complete query (search + filter)
    const query = { ...searchQuery };

    if (jobType && jobType !== "All") {
      query.jobType = jobType;
    }

    // 5. Sorting options with stable tie-breaker
    const sortOptions = {
      newest: { createdAt: -1, _id: -1 },
      oldest: { createdAt: 1, _id: 1 },
      titleAsc: { title: 1, _id: 1 },
      titleDesc: { title: -1, _id: -1 },
    };

    const sortOrder =
      sortOptions[sort] || sortOptions.newest;

    // 6. Pagination
    const skip = (page - 1) * limit;

    // 7. Fetch jobs
    const items = await jobs
      .find(query)
      .sort(sortOrder)
      .skip(skip)
      .limit(limit)
      .toArray();

    // 8. Count all matching jobs (search + filter)
    const total = await jobs.countDocuments(query);

    // 9. Count job types (search only, excluding jobType filter)
    const typeCounts = await jobs.aggregate([
      { $match: searchQuery },
      {
        $group: {
          _id: "$jobType",
          count: { $sum: 1 },
        },
      },
    ]).toArray();

    // 10. Send response
    res.send({
      items,
      total,
      page,
      limit,
      typeCounts,
    });

  } catch (error) {
    console.error("Failed to fetch jobs:", error);

    res.status(500).send({
      message: "Failed to fetch jobs",
    });
  }
});



const AUTH_BASE_URL = process.env.BETTER_AUTH_URL || process.env.FRONTEND_URL_LOCAL;

async function loadSessionUser(req) {
  if (!AUTH_BASE_URL || !req.headers.cookie) return null;
  const response = await fetch(new URL("/api/auth/get-session", AUTH_BASE_URL), {
    headers: { cookie: req.headers.cookie },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Better Auth session lookup failed with ${response.status}`);
  const sessionData = await response.json();
  return sessionData?.user ?? null;
}

async function optionalAuth(req, res, next) {
  try {
    req.user = await loadSessionUser(req);
  } catch (error) {
    console.error("Optional session lookup failed:", error);
    req.user = null;
  }
  next();
}

async function requireAuth(req, res, next) {
  try {
    const user = await loadSessionUser(req);
    if (!user) return res.status(401).send({ message: "Authentication required" });
    req.user = user;
    next();
  } catch (error) {
    console.error("Session validation failed:", error);
    res.status(503).send({ message: "Authentication service unavailable" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).send({ message: "Authentication required" });
    if (req.user.role !== role) return res.status(403).send({ message: "Insufficient permissions" });
    next();
  };
}
// Convert and validate MongoDB IDs
const isValidId = (id) => ObjectId.isValid(id);

// Get authenticated user's ID
const getUserId = (req) => req.user.id;

// 1. GET /jobs/:jobId
// Get complete job details
app.get("/jobs/:jobId", optionalAuth, async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!isValidId(jobId)) {
      return res.status(400).send({ message: "Invalid job ID" });
    }

    const job = await jobs.findOne({
      _id: new ObjectId(jobId),
    });

    if (!job) {
      return res.status(404).send({ message: "Job not found" });
    }

    // Find company information
    const company = job.companyId && ObjectId.isValid(job.companyId)
      ? await companies.findOne({ _id: new ObjectId(job.companyId) })
      : null;

    // Check whether the authenticated seeker saved this job
    let isSaved = false;

    if (req.user?.role === "jobSeeker") {
      const savedJob = await savedJobs.findOne({
        userId: getUserId(req),
        jobId: job._id,
      });

      isSaved = Boolean(savedJob);
    }

    const jobDetails = {
      ...job,
      experience: job.experience || "",
      company: {
        name: company?.name || job.companyName,
        logoUrl: company?.logoUrl || "",
        verified: company?.verified || false,
        size: company?.size || "",
        industry: company?.industry || "",
        website: company?.website || "",
      },
      isSaved,
    };

    res.send(jobDetails);
  } catch (error) {
    console.error("Get job details error:", error);
    res.status(500).send({ message: "Failed to get job details" });
  }
});


// 2. POST /job-seeker/saved-jobs
// Save a job
app.post(
  "/job-seeker/saved-jobs",
  requireAuth,
  requireRole("jobSeeker"),
  async (req, res) => {
    try {
      const { jobId } = req.body;

      if (!jobId || !isValidId(jobId)) {
        return res.status(400).send({ message: "Invalid job ID" });
      }

      const jobObjectId = new ObjectId(jobId);

      const job = await jobs.findOne({ _id: jobObjectId });

      if (!job) {
        return res.status(404).send({ message: "Job not found" });
      }

      const userId = getUserId(req);

      const existingSave = await savedJobs.findOne({
        userId,
        jobId: jobObjectId,
      });

      if (existingSave) {
        return res.status(409).send({
          message: "Job is already saved",
        });
      }

      const result = await savedJobs.insertOne({
        userId,
        jobId: jobObjectId,
        createdAt: new Date(),
      });

      res.status(201).send({
        message: "Job saved successfully",
        savedJobId: result.insertedId,
      });
    } catch (error) {
      // Handles duplicate requests protected by the unique index
      if (error.code === 11000) {
        return res.status(409).send({
          message: "Job is already saved",
        });
      }

      console.error("Save job error:", error);
      res.status(500).send({ message: "Failed to save job" });
    }
  }
);


// 3. DELETE /job-seeker/saved-jobs/:jobId
// Unsave a job
app.delete(
  "/job-seeker/saved-jobs/:jobId",
  requireAuth,
  requireRole("jobSeeker"),
  async (req, res) => {
    try {
      const { jobId } = req.params;

      if (!isValidId(jobId)) {
        return res.status(400).send({ message: "Invalid job ID" });
      }

      const result = await savedJobs.deleteOne({
        userId: getUserId(req),
        jobId: new ObjectId(jobId),
      });

      if (result.deletedCount === 0) {
        return res.status(404).send({
          message: "Saved job not found",
        });
      }

      res.send({ message: "Job removed from saved jobs" });
    } catch (error) {
      console.error("Unsave job error:", error);
      res.status(500).send({ message: "Failed to unsave job" });
    }
  }
);


// 4. GET /job-seeker/saved-jobs/:jobId
// Check whether a job is saved
app.get(
  "/job-seeker/saved-jobs/:jobId",
  requireAuth,
  requireRole("jobSeeker"),
  async (req, res) => {
    try {
      const { jobId } = req.params;

      if (!isValidId(jobId)) {
        return res.status(400).send({ message: "Invalid job ID" });
      }

      const savedJob = await savedJobs.findOne({
        userId: getUserId(req),
        jobId: new ObjectId(jobId),
      });

      res.send({ isSaved: Boolean(savedJob) });
    } catch (error) {
      console.error("Check saved job error:", error);
      res.status(500).send({
        message: "Failed to check saved job",
      });
    }
  }
);


// 5. POST /job-seeker/applications
// Apply for a job
app.post(
  "/job-seeker/applications",
  requireAuth,
  requireRole("jobSeeker"),
  async (req, res) => {
    try {
      const { jobId } = req.body;

      if (!jobId || !isValidId(jobId)) {
        return res.status(400).send({ message: "Invalid job ID" });
      }

      const jobObjectId = new ObjectId(jobId);
      const userId = getUserId(req);

      const job = await jobs.findOne({
        _id: jobObjectId,
      });

      if (!job) {
        return res.status(404).send({ message: "Job not found" });
      }

      // Reject closed or expired jobs
      const today = new Date().toISOString().slice(0, 10);

      if (
        job.status === "closed" ||
        (job.deadline && job.deadline < today)
      ) {
        return res.status(400).send({
          message: "This job is no longer accepting applications",
        });
      }

      // Prevent duplicate applications
      const existingApplication = await applications.findOne({
        userId,
        jobId: jobObjectId,
      });

      if (existingApplication) {
        return res.status(409).send({
          message: "You have already applied for this job",
        });
      }

      const application = {
        userId,
        jobId: jobObjectId,
        status: "submitted",
        appliedAt: new Date(),
      };

      const result = await applications.insertOne(application);

      // Update the job's applicant count
      await jobs.updateOne(
        { _id: jobObjectId },
        { $inc: { applicants: 1 } }
      );

      res.status(201).send({
        message: "Application submitted successfully",
        applicationId: result.insertedId,
        status: application.status,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).send({
          message: "You have already applied for this job",
        });
      }

      console.error("Apply for job error:", error);
      res.status(500).send({
        message: "Failed to submit application",
      });
    }
  }
);





app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})