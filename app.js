import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import connectDB from "./Database/DB-connection.js"
import employeeRoutes from "./routes/employeeRoutes.js"
import { fileURLToPath } from 'url'
import { dirname, join } from "path"
import { errorHandler, notFound } from "./middlewares/errorMiddleWare.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename);

dotenv.config()

const app = express()

const port = process.env.PORT || 5000

connectDB()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res, next) => {
    res.send("Api is Running...!")
})

app.use('/employee', employeeRoutes)
app.use('/', express.static(join(__dirname, 'uploads')))

app.use(notFound)
app.use(errorHandler)

app.listen(port, () => console.log(`Server started running on port ${port}`))