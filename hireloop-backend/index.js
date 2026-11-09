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



app.get('/', (req, res) => {
    res.send('Hello! Welcome to Hireloop Server')
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})