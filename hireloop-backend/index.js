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
    const newJob = req.body;
    console.log("data from client", newJob); //message to server console    
    const result = await jobs.insertOne(newJob);
    res.send(result);
});


app.get("/employer/jobs", async(req,res)=>{
    const allJobs = await jobs.find({}).toArray();
    res.send(allJobs);

})




app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})