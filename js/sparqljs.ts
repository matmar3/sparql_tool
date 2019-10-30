//import {SparqlJsonParser} from "sparqljson-parse";

//#region SPARQL

class SPARQL {

    private static query(url: string, query: any, contentType: string, handleSuccess: CallableFunction, handleError: CallableFunction) {
        let data = {
            query: query
        };
    
        RESTClient.post(url, data, contentType, handleSuccess, handleError);
    }

    public static plaintext_query(url: string, query: string, handleSuccess: CallableFunction, handleError: CallableFunction) {
        let defaultContentType = 'application/x-www-form-urlencoded; charset=UTF-8';
        SPARQL.query(url, query, defaultContentType, handleSuccess, handleError);
    }

}

//#endregion

//#region REST Client

class RESTClient {

    public static readonly DATA_TYPE = 'json';
    
    /**
     * Asynchronous GET request sent given data to the endpoint URL.
     * @param url - endpoint URL
     * @param data - add additional data to the request
     * @param contentType - type of retrieved content
     * @param successCallback - handle response on success
     * @param errorCallback - handle error when AJAX call fail
     */
    public static get(url: string, data: Object, contentType: string, successCallback: CallableFunction, errorCallback:CallableFunction) {
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
    public static post(url: string, data: Object, contentType: string, successCallback: CallableFunction, errorCallback:CallableFunction) {
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
    public static async_request(method: string, url: string, data: Object, contentType: string, successCallback: CallableFunction, errorCallback: CallableFunction) {
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

//#endregion

//#region Versionable query

class Query {

    private readonly name: string;
    private queryString: Array<string>;
    private currentVersion: number;

    public constructor(name: string, queryString: string) {
        this.name = name;
        this.queryString = [];
        this.currentVersion = 0;
        this.queryString[this.currentVersion] = queryString;
    }

    public getName() : string {
        return this.name;
    }

    public getQuery(version: number) : string {
        if (version < 0 || version > this.currentVersion) {
            return null;
        }

        return this.queryString[version];
    }

    public getLatestQuery() : string {
        return this.queryString[this.currentVersion];
    }

    public modify(modifiedQueryString: string) {
        this.currentVersion++;
        this.queryString[this.currentVersion] = modifiedQueryString;
    }

    public rollbackLastChange() {
        delete this.queryString[this.currentVersion];
        this.currentVersion--;
    }

    public getVersion() : number {
        return this.currentVersion;
    }

}

//#endregion

//#region Query list

class QueryList {

    private queries: Array<Query>;

    public constructor() {
        this.queries = [];
    }

    public add(query: Query) {
        this.queries.push(query);
    }

    public get(index: number) : Query | null {
        return this.queries[index];
    }

    public find(queryName: string) : Query | null {
        for (let i = 0; i < this.queries.length; i++) {
            let q = this.queries[i];

            if (q.getName() === queryName) {
                return q;
            }            
        }
            
        return null;
    }

    public remove(queryName: string) : boolean {
        for (let i = 0; i < this.queries.length; i++) {
            let q = this.queries[i];

            if (q.getName() === queryName) {
                delete this.queries[i];
                return true;
            }            
        }

        return false;
    }

}

//#endregion

//#region Query Manager

class QueryManager {

    private readonly prefix = 'queries';

    private queries: QueryList;

    public constructor() {
        let obj = localStorage.getItem(this.prefix);

        if (obj != null) {
            this.queries = JSON.parse(obj);
        }
        else {
            this.queries = new QueryList();
        }
    }

    public storeQuery(queryName: string, queryString: string) : boolean {
        if (this.queries.find(queryName) != null) {
            console.warn("Query with given name already exists, try call 'modifyQuery'.")
            return false;
        }

        this.queries.add(new Query(queryName, queryString));
        return true;
    }

    public loadLatestQuery(queryName: string) : string | null {
        let query = this.queries.find(queryName);
        
        if (query != null) {
            return query.getLatestQuery();
        }

        return null;
    }

    public loadQuery(queryName: string, version: number) : string | null {
        let query = this.queries.find(queryName);
        
        if (query != null) {
            return query.getQuery(version);
        }

        return null;
    }

    public modifyQuery(queryName: string, queryString: string) : boolean {
        let query = this.queries.find(queryName);

        if (query != null) {
            query.modify(queryString);
            return true;
        }

        return false;
    }

    public removeQuery(queryName: string) : boolean {
        return this.queries.remove(queryName);
    }

    public rollbackQuery(queryName: string) : number | null {
        let query = this.queries.find(queryName);

        if (query != null) {
            query.rollbackLastChange();
            return query.getVersion();
        }

        return null;
    }

    public save() {
        let json = JSON.stringify(this.queries);
        localStorage.setItem(this.prefix, json);
    }

}

//#endregion

//#region Handlers
    
function handleSuccess(json: { head: { vars: [ any ], link: any }, "results": { "bindings": [ any ] } }) {
    /*let parser = new SparqlJsonParser();
    let obj = parser.parseJsonResults(json);
    console.log(obj); */
    console.log(json);
}

function handleError(error: any) {
    console.log("Error occured: ", error);
}

//#endregion

$(document).ready(function () {
    var virtuoso_url = "http://dbpedia.org/sparql";
    var fuseki_url = "http://localhost:3030/DBM2/query";
    var query = "SELECT ?s ?p ?o ((5) as ?i) WHERE{ ?s ?p ?o } LIMIT 10";

    SPARQL.plaintext_query(virtuoso_url, query, handleSuccess, handleError);
    SPARQL.plaintext_query(fuseki_url, query, handleSuccess, handleError);

    let qm = new QueryManager();
    console.log(qm.storeQuery("x", "Ahoj"));
    console.log(qm.storeQuery("x", "Ahojky"));
    console.log(qm.modifyQuery("x", "Ahojky"));
    console.log(qm.loadLatestQuery("x"));
    console.log(qm.loadQuery("x", 0));
    console.log(qm.rollbackQuery("x"));
    console.log(qm.loadLatestQuery("x"));
    console.log(qm.removeQuery('x'));
    console.log(qm.loadLatestQuery("x"));
    qm.save();
});