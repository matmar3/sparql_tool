var SPARQL = (function () {
    function SPARQL() {
    }
    SPARQL.query = function (url, query, contentType, handleSuccess, handleError) {
        var data = {
            query: query
        };
        RESTClient.post(url, data, contentType, handleSuccess, handleError);
    };
    SPARQL.plaintext_query = function (url, query, handleSuccess, handleError) {
        var defaultContentType = 'application/x-www-form-urlencoded; charset=UTF-8';
        SPARQL.query(url, query, defaultContentType, handleSuccess, handleError);
    };
    return SPARQL;
}());
var RESTClient = (function () {
    function RESTClient() {
    }
    RESTClient.get = function (url, data, contentType, successCallback, errorCallback) {
        RESTClient.async_request('GET', url, data, contentType, successCallback, errorCallback);
    };
    RESTClient.post = function (url, data, contentType, successCallback, errorCallback) {
        RESTClient.async_request('POST', url, data, contentType, successCallback, errorCallback);
    };
    RESTClient.async_request = function (method, url, data, contentType, successCallback, errorCallback) {
        $.ajax({
            type: method,
            url: url,
            data: data,
            contentType: contentType,
            dataType: RESTClient.DATA_TYPE,
            xhrFields: {
                withCredentials: false
            },
            success: function (response) {
                successCallback(response);
            },
            error: function (error) {
                errorCallback(error);
            }
        });
    };
    RESTClient.DATA_TYPE = 'json';
    return RESTClient;
}());
var Query = (function () {
    function Query(name, queryString) {
        this.name = name;
        this.queryString = queryString;
    }
    Query.prototype.getName = function () {
        return this.name;
    };
    Query.prototype.getQuery = function () {
        return this.queryString;
    };
    return Query;
}());
var QueryList = (function () {
    function QueryList() {
        this.queries = [];
    }
    QueryList.prototype.addQuery = function (query) {
        this.queries.push(query);
    };
    QueryList.prototype.get = function (index) {
        return this.queries[index];
    };
    QueryList.prototype.find = function (queryName) {
        for (var i = 0; i < this.queries.length; i++) {
            var q = this.queries[i];
            if (q.getName() === queryName) {
                return q;
            }
        }
        return undefined;
    };
    return QueryList;
}());
var QueryManager = (function () {
    function QueryManager() {
        this.prefix = 'queries';
        var obj = localStorage.getItem(this.prefix);
        if (obj != undefined) {
            this.queries = JSON.parse(obj);
        }
        else {
            this.queries = new QueryList();
        }
        console.log(this.queries);
    }
    QueryManager.prototype.storeQuery = function (queryName, query) {
        if (this.queries.find(queryName) != undefined) {
            return false;
        }
        this.queries.addQuery(new Query(queryName, query));
        return true;
    };
    QueryManager.prototype.loadQuery = function (queryName) {
        var query = this.queries.find(queryName);
        if (query != undefined) {
            return query.getQuery();
        }
        return undefined;
    };
    QueryManager.prototype.save = function () {
        var json = JSON.stringify(this.queries);
        localStorage.setItem(this.prefix, json);
    };
    return QueryManager;
}());
function handleSuccess(json) {
    console.log(json);
}
function handleError(error) {
    console.log("Error occured: ", error);
}
$(document).ready(function () {
    var virtuoso_url = "http://dbpedia.org/sparql";
    var fuseki_url = "http://localhost:3030/DBM2/query";
    var query = "SELECT ?s ?p ?o ((5) as ?i) WHERE{ ?s ?p ?o } LIMIT 10";
    SPARQL.plaintext_query(virtuoso_url, query, handleSuccess, handleError);
    SPARQL.plaintext_query(fuseki_url, query, handleSuccess, handleError);
    var qm = new QueryManager();
    qm.storeQuery("x", "Ahoj");
    qm.save();
});
//# sourceMappingURL=sparqljs.js.map