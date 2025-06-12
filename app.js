require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on("error",(e) => console.error(e))
db.once("open",() => console.log('Database connecte..!'))

app.use(express.json())
const allRoutes = require('./routes/allRoutes')
app.use('/api', allRoutes)

const uploadRouter = require('./routes/upload')
app.use('/api/upload', uploadRouter)

app.listen(3000,() => console.log("Server started"))