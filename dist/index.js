"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configure = void 0;

var _mysql_driver = _interopRequireDefault(require("./mysql_driver"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var configure = function configure(fluent_configurator) {
  fluent_configurator.register_driver(new _mysql_driver["default"](fluent_configurator.connections));
};

exports.configure = configure;