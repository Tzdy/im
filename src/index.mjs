import { config } from 'dotenv-flow'
import express from 'express'
import router from './router/index.mjs'
import { modelInit } from './model/index.mjs'
import bodyParser from 'body-parser'
import { CorsMiddleware } from './middleware/cors.mjs'
config()
modelInit()
const app = express()
app.use(CorsMiddleware)
app.use(bodyParser.json())
app.use(process.env.BASE, router)

app.listen(Number(process.env.PORT))