"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.configure = void 0;

var _mysql_driver = require("./mysql_driver");

var configure = function configure(fluent_configurator) {
  fluent_configurator.register_driver("mysql", new _mysql_driver.MysqlDriver(fluent_configurator));
};

exports.configure = configure;
var _default = configure;
exports["default"] = _default;