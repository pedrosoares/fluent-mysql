import mysql from "mysql";
import { uuidv4 } from "./helper";
import { SelectBuilder } from "./builders/select.builder";
import { InsertBuilder } from "./builders/insert.builder";
import { DeleteBuilder } from "./builders/delete.builder";
import { UpdateBuilder } from "./builders/update.builder";

const transactions = {};

class MysqlDriver {

    constructor(configurator) {
        this.configurator = configurator;
        this.pool = null;
    }

    query(options, sql, params) {
        const connection = this.getConnection(options);
        return new Promise((resolve, reject) => connection.query(sql, params, (error, data, _) => {
            if (error) return reject(error);
            resolve(data);
        }));
    }

    getConnection(options={}){
        if(options.hasOwnProperty("transaction")) return transactions[options.transaction];
        if(!this.pool) {
            const conn_options = this.configurator.get_connection_configuration(this.configurator.default_connection);
            if (conn_options.driver !== "mysql") {
                throw new Error(`Invalid driver (${conn_options.driver}) used on mysql`);
            }
            delete conn_options.driver;
            this.pool = new mysql.createPool(conn_options);
        }
        return this.pool;
    }

    commit(transaction) {
        const connection = transactions[transaction];
        connection.commit((err) => {
            if (err) {
                return connection.rollback(() => {
                    connection.release();
                    throw err;
                });
            }
            connection.release();
        });
        delete transactions[transaction];
    }

    rollback(transaction){
        const connection = transactions[transaction];
        connection.rollback(() => {
            connection.release();
        });
        delete transactions[transaction];
    }

    transaction(){
        const id = uuidv4();
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) reject(err);
                else
                    connection.beginTransaction((err) => {
                        if (err) {
                            connection.rollback(function() {
                                connection.release();
                            });
                            reject('Could`t get a connection!');
                        } else {
                            transactions[id] = connection;
                            resolve(id);
                        }
                    });
            });
        });
    }

    parseSelect(table, columns, filters, limit, order, groups){
        return (new SelectBuilder(table, columns, filters, limit, order, groups)).parse();
    }

    parseInsert(table, columns, values){
        return (new InsertBuilder(table, columns, values)).parse();
    }

    parseDelete(table, filters){
        return (new DeleteBuilder(table, filters)).parse();
    }

    parseUpdate(table, columns, filters, limit, order){
        return (new UpdateBuilder(table, columns, filters, limit, order)).parse();
    }

}

export { MysqlDriver };
