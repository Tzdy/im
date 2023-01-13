import { config } from 'dotenv-flow'
import { fork } from 'child_process'
import express from 'express'
import { writeFile } from 'fs/promises'
import path, { resolve } from 'path'
config()

function formatConfig(key, value) {
    return `export const ${key} = '${value}';\n`
}

async function main() {
    let configJS = ''
    Object.keys(process.env).filter(item => item.includes('VUE_')).forEach(key => {
        configJS += formatConfig(key, process.env[key])
    })

    const child = fork(resolve('src', 'index.mjs'), {
        cwd: resolve(),
        env: {}
    })

    process.on('exit', () => {
        child.kill(9)
    })

    await writeFile(path.resolve('www', 'config.js'), configJS)
    const app = express()
    app.use('/', express.static(resolve('www'), {
        maxAge: 0
    }))
    app.listen(Number(process.env.VUE_PORT))

    console.log(`api: http://localhost:${process.env.SERVER_PORT}${process.env.SERVER_BASE}\nws: ws://localhost:${process.env.SERVER_PORT}${process.env.SERVER_WS_ROOT}\nweb: http://localhost:${process.env.VUE_PORT}${path.join('/', process.env.VUE_ROOT)}`)
}

main()