/**
 * SPARQL Tool 
 */

function sent_query(url, query) {
    var data = {
        query: query
    };

    post(url, data, handleSuccess, handleError);
}

function handleSuccess(response) {
    console.log(response);    
}

function handleError(error) {
    console.log("Error occured: ", error);
}

/**
 * Asynchronous GET request sent given data to the endpoint URL.
 * @param {String} url - endpoint URL
 * @param {Object} data - add additional data to the request
 * @param {CallableFunction} successCallback - handle response on success
 * @param {CallableFunction} errorCallback - handle error when AJAX call fail
 */
function get(url, data, successCallback, errorCallback) {
    async_request('GET', url, data, successCallback, errorCallback);
}

/**
 * Asynchronous POST request sent given data to the endpoint URL.
 * @param {String} url - endpoint URL
 * @param {Object} data - add additional data to the request
 * @param {CallableFunction} successCallback - handle response on success
 * @param {CallableFunction} errorCallback - handle error when AJAX call fail
 */
function post(url, data, successCallback, errorCallback) {
    async_request('POST', url, data, successCallback, errorCallback);
}

/**
 * Perform AJAX call and handle response.
 * @param {String} method - http method
 * @param {String} url - endpoint URL
 * @param {Object} data - add additional data to the request
 * @param {CallableFunction} successCallback - handle response on success
 * @param {CallableFunction} errorCallback - handle error when AJAX call fail
 */
function async_request(method, url, data, successCallback, errorCallback) {
    $.ajax({
        type: method,
        url: url,
        data: data,
        // contentType: 'application/sparql-results+json,*/*;q=0.9',
        xhrFields: {
            withCredentials: false
        },
        success: function(response){
            successCallback(response);
        },
        error: function(error) {
            errorCallback(error);
        }    
    });
}

$(document).ready(function () {
    var url = "http://localhost:3030/DBM2/query";
    var query = "SELECT ?s ?p ?o ((5) as ?i) WHERE{ ?s ?p ?o } LIMIT 10";

    sent_query(url, query);
});