import express from "express"
import 'dotenv/config'


const app = express();
const port = process.env.port || 5000;

app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello! Welcome to Hireloop Server')
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})