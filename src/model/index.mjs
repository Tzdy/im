import mysql from 'mysql2'

/**
 * @type { mysql.Pool | null }
 */
let pool = null


export function query(sql, placeholder) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                return reject(err)
            }
            connection.query(sql, placeholder, (err, result, fields) => {
                connection.release()
                if (err) {
                    return reject(err)
                } else {
                    resolve(result)
                }
            })
        })
    })
}

export function modelInit() {
    pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });
}