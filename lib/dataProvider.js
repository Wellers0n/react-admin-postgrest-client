"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _fetch = require("ra-core/lib/util/fetch");

var _dataFetchActions = require("ra-core/lib/dataFetchActions");

/**
 * Maps react-admin queries to a postgrest API
 *
 * The REST dialect is similar to the one of FakeRest
 * @see https://github.com/marmelab/FakeRest
 * @example
 * GET_MANY_REFERENCE
 *              => GET http://my.api.url/posts/2
 * GET_LIST     => GET http://my.api.url/posts?order=title.asc
 * GET_ONE      => GET http://my.api.url/posts?id=eq.123
 * GET_MANY     => GET http://my.api.url/posts?id=in.123,456,789
 * UPDATE       => PATCH http://my.api.url/posts?id=eq.123
 * CREATE       => POST http://my.api.url/posts
 * DELETE       => DELETE http://my.api.url/posts?id=eq.123
 */
exports.default = function (apiUrl) {
	var httpClient = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _fetch.fetchJson;

	var convertFilters = function convertFilters(filters) {
		var rest = {};
		Object.keys(filters).map(function (key) {
			switch (_typeof(filters[key])) {
				case "string":
					rest[key] = "eq." + filters[key];
					break;

				case "boolean":
					rest[key] = "is." + filters[key];
					break;

				case "undefined":
					rest[key] = "is.null";
					break;

				case "number":
					rest[key] = "eq." + filters[key];
					break;

				default:
					rest[key] = "eq." + filters[key];
					break;
			}
			return true;
		});
		return rest;
	};

	var singleResourceUrl = function singleResourceUrl(resource, params) {
		var query = { id: "eq." + params.id };

		return apiUrl + "/" + resource + "?" + stringify(query);
	};

	var setSingleResponseHeaders = function setSingleResponseHeaders(options) {
		options.headers.set("Prefer", "return=representation");
		options.headers.set("Accept", "application/vnd.pgrst.object+json");
	};

	/**
  * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
  * @param {String} resource Name of the resource to fetch, e.g. 'posts'
  * @param {Object} params The REST request params, depending on the type
  * @returns {Object} { url, options } The HTTP request parameters
  */
	var convertRESTRequestToHTTP = function convertRESTRequestToHTTP(type, resource, params) {
		var url = "";
		var options = {};
		if (!options.headers) {
			options.headers = new Headers({ Accept: "application/json" });
		}
		var token = localStorage.getItem("token");
		if (token.length > 0) {
			options.headers.set("Authorization", "Bearer " + token);
		} else {
			return;
		}
		switch (type) {
			case _dataFetchActions.GET_LIST:
				{
					var _params$pagination = params.pagination,
					    page = _params$pagination.page,
					    perPage = _params$pagination.perPage;
					var _params$sort = params.sort,
					    field = _params$sort.field,
					    order = _params$sort.order;

					options.headers.set("Range-Unit", "items");
					options.headers.set("Range", (page - 1) * perPage + "-" + (page * perPage - 1));
					options.headers.set("Prefer", "count=exact");
					var query = {
						order: field + "." + order.toLowerCase()
					};
					Object.assign(query, convertFilters(params.filter));
					url = apiUrl + "/" + resource + "?" + stringify(query);
					break;
				}
			case _dataFetchActions.GET_ONE:
				url = singleResourceUrl(resource, params);
				setSingleResponseHeaders(options);
				break;
			case _dataFetchActions.GET_MANY:
				//	let query_id = `${resource}_id`;
				url = apiUrl + "/" + resource + "?id=in.(" + params.ids.join(",") + ")";
				break;
			case _dataFetchActions.GET_MANY_REFERENCE:
				{
					var filters = {};
					var _params$sort2 = params.sort,
					    _field = _params$sort2.field,
					    _order = _params$sort2.order;

					filters[params.target] = params.id;
					var _query = {
						order: _field + "." + _order.toLowerCase()
					};
					Object.assign(_query, convertFilters(filters));
					console.log(_query);
					url = apiUrl + "/" + resource + "?" + stringify(_query);
					break;
				}
			case _dataFetchActions.UPDATE:
				url = singleResourceUrl(resource, params);
				setSingleResponseHeaders(options);
				options.method = "PATCH";
				options.body = JSON.stringify(params.data);
				break;
			case _dataFetchActions.CREATE:
				url = apiUrl + "/" + resource;
				setSingleResponseHeaders(options);
				options.method = "POST";
				options.body = JSON.stringify(params.data);
				break;
			case _dataFetchActions.DELETE:
				url = params.ids ? apiUrl + "/" + resource + "?id=in.(" + params.ids.join(",") + ")" : singleResourceUrl(resource, params);
				//url = params.ids ? `${apiUrl}/${resource}?id=in.(${params.ids.join(",")})` : singleResourceUrl(resource, params);
				options.method = "DELETE";
				break;
			default:
				throw new Error("Unsupported fetch action type " + type);
		}
		return { url: url, options: options };
	};

	/**
  * @param {Object} response HTTP response from fetch()
  * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
  * @param {String} resource Name of the resource to fetch, e.g. 'posts'
  * @param {Object} params The REST request params, depending on the type
  * @returns {Object} REST response
  */
	var convertHTTPResponseToREST = function convertHTTPResponseToREST(response, type, resource, params) {
		var headers = response.headers,
		    json = response.json;

		//	let query_id = `${resource}_id`;

		switch (type) {
			case _dataFetchActions.GET_LIST:
			case _dataFetchActions.GET_MANY_REFERENCE:
				{
					if (!headers.has("content-range")) {
						throw new Error("The Content-Range header is missing in the HTTP Response. " + "The PostgREST client expects responses for lists of resources to contain " + "this header with the total number of results to build the pagination. " + "If you are using CORS, did you declare Content-Range in the " + "Access-Control-Expose-Headers header?");
					}
					var rangeParts = headers.get("content-range").split("/");
					var total = parseInt(rangeParts.pop(), 10) || parseInt(rangeParts[0].split("-").pop(), 10) + 1;
					return {
						data: json.slice(),
						total: total
					};
				}
			case _dataFetchActions.CREATE:
				return { data: _extends({}, params.data, { id: json.id }) };
			case _dataFetchActions.DELETE:
				return { data: {} };
			default:
				return { data: json };
		}
	};

	/**
  * @param {string} type Request type, e.g GET_LIST
  * @param {string} resource Resource name, e.g. "posts"
  * @param {Object} payload Request parameters. Depends on the request type
  * @returns {Promise} the Promise for a REST response
  */
	return function (type, resource, params) {
		var _convertRESTRequestTo = convertRESTRequestToHTTP(type, resource, params),
		    url = _convertRESTRequestTo.url,
		    options = _convertRESTRequestTo.options;

		return httpClient(url, options).then(function (response) {
			return convertHTTPResponseToREST(response, type, resource, params);
		});
	};
};

module.exports = exports["default"];