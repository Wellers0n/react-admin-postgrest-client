'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.postgrestClient = exports.postgrestJwtAuth = undefined;

var _authProvider = require('./authProvider');

var _authProvider2 = _interopRequireDefault(_authProvider);

var _dataProvider = require('./dataProvider');

var _dataProvider2 = _interopRequireDefault(_dataProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.postgrestJwtAuth = _authProvider2.default;
exports.postgrestClient = _dataProvider2.default;