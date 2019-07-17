"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _axios = require("axios");

var _axios2 = _interopRequireDefault(_axios);

var _reactAdmin = require("react-admin");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// var authUrl = "http://localhost:3002/rpc/login";
exports.default = function (authUrl) {
	return function (type, params) {
		// logout
		if (type === _reactAdmin.AUTH_LOGOUT) {
			localStorage.removeItem("token");
			return Promise.resolve();
		}
		// auth error
		if (type === _reactAdmin.AUTH_ERROR) {
			var status = params.status;
			if (status !== 200) {
				localStorage.removeItem("token");
				return Promise.reject();
			}
			return Promise.resolve();
		}
		// login
		if (type === _reactAdmin.AUTH_LOGIN) {
			var username = params.username,
			    password = params.password;
			//	let url = "http://localhost:3002/rpc/login";

			_axios2.default.defaults.headers.post["Content-Type"] = "application/json";
			var axiosOptions = {
				method: "POST",
				headers: {
					"Content-Type": "application/json;charset=utf-8",
					Accept: "application/json"
				},
				data: "{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}",
				url: authUrl
			};
			//
			(0, _axios2.default)(axiosOptions).then(function (response) {
				if (response.status === 200) {
					var token = response.data[0].token;
					response.data = { token: token };
					// save token
					localStorage.setItem("token", token);
					return response;
				}
				return response;
			});
			/**
              .catch((error) => {
                     return Promise.reject(error);
                 });
              */
			return Promise.resolve();
		}
		// called when the user navigates to a new location
		if (type === _reactAdmin.AUTH_CHECK) {
			return localStorage.getItem("token") ? Promise.resolve() : Promise.reject();
		}
		// get permissions
		if (type === _reactAdmin.AUTH_GET_PERMISSIONS) {
			//     const role = localStorage.getItem('role');
			//     return role ? Promise.resolve(role) : Promise.reject();
			return Promise.resolve();
		}

		return Promise.reject("Unknown method");
	};
};

module.exports = exports["default"];