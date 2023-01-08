import { config } from 'dotenv-flow'
import { createServer } from 'http'
import express from 'express'
import { logicError } from '@tsdy/express-plugin-exception'
import router from './router/index.mjs'
import { modelInit } from './model/index.mjs'
import bodyParser from 'body-parser'
import { CorsMiddleware } from './middleware/cors.mjs'
import { wsInit } from './ws/index.mjs'

const app = express()
const server = createServer(app)
config()
modelInit()
wsInit(server)

app.use(CorsMiddleware)
app.use(bodyParser.json())
app.use(process.env.BASE, router)

app.use((err, req, res, next) => {
    logicError(err, res)
    next()
})


server.listen(Number(process.env.PORT))