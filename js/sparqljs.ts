//import {SparqlJsonParser} from "sparqljson-parse";

class SPARQL {

    private static query(url: string, query: any, contentType: string, handleSuccess: CallableFunction, handleError: CallableFunction) {
        let data = {
            query: query
        };
    
        RESTClient.post(url, data, contentType, handleSuccess, handleError);
    }

    static plaintext_query(url: string, query: string, handleSuccess: CallableFunction, handleError: CallableFunction) {
        let defaultContentType = 'application/x-www-form-urlencoded; charset=UTF-8';
        SPARQL.query(url, query, defaultContentType, handleSuccess, handleError);
    }

}

class RESTClient {

    static readonly DATA_TYPE = 'json';
    
    /**
     * Asynchronous GET request sent given data to the endpoint URL.
     * @param url - endpoint URL
     * @param data - add additional data to the request
     * @param contentType - type of retrieved content
     * @param successCallback - handle response on success
     * @param errorCallback - handle error when AJAX call fail
     */
    static get(url: string, data: Object, contentType: string, successCallback: CallableFunction, errorCallback:CallableFunction) {
        RESTClient.async_request('GET', url, data, contentType, successCallback, errorCallback);
    }
    
    /**
     * Asynchronous POST request sent given data to the endpoint URL.
     * @param url - endpoint URL
     * @param data - add additional data to the request
     * @param contentType - type of retrieved content
     * @param successCallback - handle response on success
     * @param errorCallback - handle error when AJAX call fail
     */
    static post(url: string, data: Object, contentType: string, successCallback: CallableFunction, errorCallback:CallableFunction) {
        RESTClient.async_request('POST', url, data, contentType, successCallback, errorCallback);
    }
    
    /**
     * Perform AJAX call and handle response.
     * @param method - http method
     * @param url - endpoint URL
     * @param data - add additional data to the request
     * @param contentType - type of retrieved content
     * @param successCallback - handle response on success
     * @param errorCallback - handle error when AJAX call fail
     */
    static async_request(method: string, url: string, data: Object, contentType: string, successCallback: CallableFunction, errorCallback: CallableFunction) {
        $.ajax({
            type: method,
            url: url,
            data: data,
            contentType: contentType,
            dataType: RESTClient.DATA_TYPE,
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

}

class Query {

    private name: string;
    private queryString: string;

    constructor(name: string, queryString: string) {
        this.name = name;
        this.queryString = queryString;
    }

    getName() : string {
        return this.name;
    }

    getQuery() : string {
        return this.queryString;
    }

}

class QueryList {

    private queries: Array<Query>;

    constructor() {
        this.queries = [];
    }

    addQuery(query: Query) {
        this.queries.push(query);
    }

    get(index: number) : Query | undefined {
        return this.queries[index];
    }

    find(queryName: string) : Query | undefined {
        for (let i = 0; i < this.queries.length; i++) {
            let q = this.queries[i];

            if (q.getName() === queryName) {
                return q;
            }            
        }
            
        return undefined;
    }

}

class QueryManager {

    private readonly prefix = 'queries';

    private queries: QueryList;

    constructor() {
        let obj = localStorage.getItem(this.prefix);

        if (obj != undefined) {
            this.queries = JSON.parse(obj);
        }
        else {
            this.queries = new QueryList();
        }

        console.log(this.queries);
    }

    storeQuery(queryName: string, query: string) : boolean {
        if (this.queries.find(queryName) != undefined) {
            return false;
        }

        this.queries.addQuery(new Query(queryName, query));
        return true;
    }

    loadQuery(queryName: string) : string | undefined {
        let query = this.queries.find(queryName);
        
        if (query != undefined) {
            return query.getQuery();
        }

        return undefined;
    }

    save() {
        let json = JSON.stringify(this.queries);
        localStorage.setItem(this.prefix, json);
    }

}
    
function handleSuccess(json: { head: { vars: [ any ], link: any }, "results": { "bindings": [ any ] } }) {
    /*let parser = new SparqlJsonParser();
    let obj = parser.parseJsonResults(json);
    console.log(obj); */
    console.log(json);
}

function handleError(error: any) {
    console.log("Error occured: ", error);
}


$(document).ready(function () {
    var virtuoso_url = "http://dbpedia.org/sparql";
    var fuseki_url = "http://localhost:3030/DBM2/query";
    var query = "SELECT ?s ?p ?o ((5) as ?i) WHERE{ ?s ?p ?o } LIMIT 10";

    SPARQL.plaintext_query(virtuoso_url, query, handleSuccess, handleError);
    SPARQL.plaintext_query(fuseki_url, query, handleSuccess, handleError);

    let qm = new QueryManager();
    qm.storeQuery("x", "Ahoj");
    qm.save();
});