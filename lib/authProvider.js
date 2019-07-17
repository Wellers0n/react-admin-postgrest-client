"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jwtDecode = require("jwt-decode");

var _jwtDecode2 = _interopRequireDefault(_jwtDecode);

var _reactAdmin = require("react-admin");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('es6-promise').polyfill();
require('isomorphic-fetch');

// authUrl = "http://localhost:3002/rpc/login";

exports.default = function (authUrl) {
  return function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(type, params) {
      var status, username, password, request, response, responseJson, token, decodedToken;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(type === _reactAdmin.AUTH_LOGOUT)) {
                _context.next = 3;
                break;
              }

              localStorage.removeItem("token");
              return _context.abrupt("return", Promise.resolve());

            case 3:
              if (!(type === _reactAdmin.AUTH_ERROR)) {
                _context.next = 9;
                break;
              }

              status = params.status;

              if (!(status !== 200)) {
                _context.next = 8;
                break;
              }

              localStorage.removeItem("token");
              return _context.abrupt("return", Promise.reject());

            case 8:
              return _context.abrupt("return", Promise.resolve());

            case 9:
              if (!(type === _reactAdmin.AUTH_LOGIN)) {
                _context.next = 25;
                break;
              }

              username = params.username, password = params.password;
              request = new Request(authUrl, {
                method: "POST",
                body: JSON.stringify({ username: username, password: password }),
                headers: new Headers({ "Content-Type": "application/json" })
              });
              _context.next = 14;
              return fetch(request);

            case 14:
              response = _context.sent;

              if (!(response.status < 200 || response.status >= 300)) {
                _context.next = 17;
                break;
              }

              throw new Error(response.statusText);

            case 17:
              _context.next = 19;
              return response.json();

            case 19:
              responseJson = _context.sent;

              // token
              token = responseJson[0].token;
              // decode JWT

              decodedToken = (0, _jwtDecode2.default)(token);
              // set local storage

              localStorage.setItem("token", token);
              localStorage.setItem("role", decodedToken.role);

              // reponse json()
              return _context.abrupt("return", responseJson);

            case 25:
              if (!(type === _reactAdmin.AUTH_CHECK)) {
                _context.next = 27;
                break;
              }

              return _context.abrupt("return", localStorage.getItem("token") ? Promise.resolve() : Promise.reject());

            case 27:
              if (!(type === _reactAdmin.AUTH_GET_PERMISSIONS)) {
                _context.next = 29;
                break;
              }

              return _context.abrupt("return", Promise.resolve());

            case 29:
              return _context.abrupt("return", Promise.reject("Unknown method"));

            case 30:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, undefined);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
};

module.exports = exports["default"];