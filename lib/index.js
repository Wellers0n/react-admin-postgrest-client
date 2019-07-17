"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.postgrestClient = undefined;

var _dataProvider = require("./dataProvider");

Object.defineProperty(exports, "postgrestClient", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_dataProvider).default;
  }
});

var _authProvider = require("./authProvider");

var _authProvider2 = _interopRequireDefault(_authProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }