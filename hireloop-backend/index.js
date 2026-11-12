import express from "express"
import 'dotenv/config'
import cors from "cors";
import { MongoClient } from 'mongodb';

const app = express();
const port = process.env.port || 5000;

app.use(express.json());


app.use(cors({
    origin: `${process.env.FRONTEND_URL_LOCAL}`,
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



app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})