import mysql from 'mysql2'

/**
 * @type { mysql.Pool | null }
 */
let pool = null


export function query(sql, placeholder, transactionConnection) {
    return new Promise((resolve, reject) => {
        if (transactionConnection) {
            transactionConnection.query(sql, placeholder, (err, result, fields) => {
                if (err) {
                    return reject(err)
                } else {
                    resolve(result)
                }
            })
            return
        }
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

export function startTransaction(asyncCallback) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                return reject(err)
            }
            connection.beginTransaction(err => {
                if (err) {
                    return reject(err)
                }
                asyncCallback(connection)
                    .then(() => {
                        connection.commit()
                        resolve()
                    })
                    .catch(error => {
                        connection.rollback()
                        reject(error)
                    })
                    .finally(() => {
                        connection.release()
                    })
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