import mysql from 'mysql2'

export let model = null

export function query(sql, placeholder) {
    return new Promise((resolve, reject) => {
        model.query(sql, placeholder, (err, result, fields) => {
            if (err) {
                return reject(err)
            } else {
                resolve(result)
            }
        })
    })
}

export function modelInit() {
    model = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

}