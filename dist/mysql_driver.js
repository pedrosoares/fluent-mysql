"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MysqlDriver = void 0;

var _mysql = _interopRequireDefault(require("mysql"));

var _helper = require("./helper");

var _select = require("./builders/select.builder");

var _insert = require("./builders/insert.builder");

var _delete = require("./builders/delete.builder");

var _update = require("./builders/update.builder");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var transactions = {};

var MysqlDriver = /*#__PURE__*/function () {
  function MysqlDriver(configurator) {
    _classCallCheck(this, MysqlDriver);

    this.configurator = configurator;
    this.pool = null;
  }

  _createClass(MysqlDriver, [{
    key: "query",
    value: function query(options, sql, params) {
      var connection = this.getConnection(options);
      return new Promise(function (resolve, reject) {
        return connection.query(sql, params, function (error, data, _) {
          if (error) return reject(error);
          resolve(data);
        });
      });
    }
  }, {
    key: "getConnection",
    value: function getConnection() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (options.hasOwnProperty("transaction")) return transactions[options.transaction];

      if (!this.pool) {
        var conn_options = this.configurator.get_connection_configuration(this.configurator.default_connection);

        if (conn_options.driver !== "mysql") {
          throw new Error("Invalid driver (".concat(conn_options.driver, ") used on mysql"));
        }

        delete conn_options.driver;
        this.pool = new _mysql["default"].createPool(conn_options);
      }

      return this.pool;
    }
  }, {
    key: "commit",
    value: function commit(transaction) {
      var connection = transactions[transaction];
      connection.commit(function (err) {
        if (err) {
          return connection.rollback(function () {
            connection.release();
            throw err;
          });
        }

        connection.release();
      });
      delete transactions[transaction];
    }
  }, {
    key: "rollback",
    value: function rollback(transaction) {
      var connection = transactions[transaction];
      connection.rollback(function () {
        connection.release();
      });
      delete transactions[transaction];
    }
  }, {
    key: "transaction",
    value: function transaction() {
      var _this = this;

      var id = (0, _helper.uuidv4)();
      return new Promise(function (resolve, reject) {
        _this.pool.getConnection(function (err, connection) {
          if (err) reject(err);else connection.beginTransaction(function (err) {
            if (err) {
              connection.rollback(function () {
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
  }, {
    key: "parseSelect",
    value: function parseSelect(table, columns, filters, limit, order, groups) {
      return new _select.SelectBuilder(table, columns, filters, limit, order, groups).parse();
    }
  }, {
    key: "parseInsert",
    value: function parseInsert(table, columns, values) {
      return new _insert.InsertBuilder(table, columns, values).parse();
    }
  }, {
    key: "parseDelete",
    value: function parseDelete(table, filters) {
      return new _delete.DeleteBuilder(table, filters).parse();
    }
  }, {
    key: "parseUpdate",
    value: function parseUpdate(table, columns, filters, limit, order) {
      return new _update.UpdateBuilder(table, columns, filters, limit, order).parse();
    }
  }]);

  return MysqlDriver;
}();

exports.MysqlDriver = MysqlDriver;