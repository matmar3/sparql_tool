//#region SPARQL

/**
 * Manage communication with specified endpoint and handle response.
 */
class SPARQL {

    /* Default target element to render results. */
    private readonly DEFAULT_TARGET = "body";

    /* Target element to render results. */
    private targetElement: string;

    /* Create instance with default target. */
    constructor();

    /* Create instance with given target. */
    constructor(targetElement: string);

    constructor(targetElement?: string) {
        if (targetElement == null) {
            this.targetElement = this.DEFAULT_TARGET;
        }

        this.targetElement = targetElement;
    }

    /**
     * Send query to given URL and manage response.
     * @param url - URL endpoint
     * @param query - some type of query
     * @param contentType - datatype of given query
     * @param handleSuccess - handler for response
     * @param handleError - handler of error situations
     */
    private query(url: string, query: any, contentType: string, handleSuccess?: CallableFunction, handleError?: CallableFunction) {
        if (handleSuccess == null) {
            handleSuccess = this.handleResults.bind(this);
        }

        if (handleError == null) {
            handleError = this.handleError.bind(this);
        }

        let data = {
            query: query
        };
    
        RESTClient.post(url, data, contentType, handleSuccess, handleError);
    }

    /**
     * Send plaintext query to given URL and manage response.
     * @param url - URL endpoint
     * @param query - plaintext query
     * @param handleSuccess - handler for response
     * @param handleError - handler of error situations
     */
    public plaintext_query(url: string, query: string, handleSuccess?: CallableFunction, handleError?: CallableFunction) {
        if (handleSuccess == null) {
            handleSuccess = this.handleResults.bind(this);
        }

        if (handleError == null) {
            handleError = this.handleError.bind(this);
        }

        let defaultContentType = 'application/x-www-form-urlencoded; charset=UTF-8';
        this.query(url, query, defaultContentType, handleSuccess, handleError);
    }
    
    /**
     * Parse given SPARQL JSON and represent results as a table inside given target.
     * @param json - SPARQL JSON response
     */
    private handleResults(json: { head: { vars: [ any ], link: any }, results: { "bindings": [ any ] } }) {
        const variables = json.head.vars;
        const bindings = json.results.bindings;
    
        let table = document.createElement("table");
        let header = document.createElement("thead");
        let body = document.createElement("tbody");

        {   // fill table header
            let row = document.createElement("tr");

            for (let i = 0; i < variables.length; i++) {
                let cell = document.createElement("th");
                cell.innerHTML = variables[i];
                cell.style.cssText = "border: 1px solid black; padding: 5px;";
                row.appendChild(cell);            
            }

            row.style.cssText = "border: 1px solid black;";
            header.appendChild(row);
        }

        {   // fill table body
            for (let i = 0; i < bindings.length; i++) {
                let row = document.createElement("tr");

                for (var prop in bindings[i]) {
                    if (Object.prototype.hasOwnProperty.call(bindings[i], prop)) {
                        let cell = document.createElement("td");
                        let value: string = bindings[i][prop].value;
                        if (isURL(value)) {
                            let ref = document.createElement('a');
                            ref.href = value;
                            ref.innerHTML = value;
                            cell.appendChild(ref);
                        }
                        else {
                            cell.innerHTML = bindings[i][prop].value;
                        }
                        cell.style.cssText = "border: 1px solid black; padding:5px;";
                        row.appendChild(cell);   
                    }
                }

                row.style.cssText = "border: 1px solid black;";
                body.appendChild(row);                
            }
        }

        // compose table
        table.appendChild(header);
        table.appendChild(body);
        table.style.cssText = "border-collapse: collapse; border: 1px solid black; margin-bottom: 3em;"; 

        // render table
        document.querySelector(this.targetElement).appendChild(table);
    }
    
    /**
     * Handle error response.
     * @param error - error message
     */
    private handleError(error: any) {
        console.log("Error occured: ", error);
    }

}

/**
 * Verify given URL.
 * @param url - URL 
 */
function isURL(url: string) {
    let pattern = new RegExp('^(http:\/\/)(.+)$','im');
    return !!pattern.test(url);
}

//#endregion

//#region REST Client

/**
 * Provide methods for asynchronous communication with server.
 */
class RESTClient {

    /* Response data type. */
    public static readonly DATA_TYPE = 'json';
    
    /**
     * Asynchronous GET request send given data to the endpoint URL.
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
     * Asynchronous POST request send given data to the endpoint URL.
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

/**
 * Represent query in local storage. Provide support for simple version control.
 */
class Query {

    /* Label for query. */
    private readonly name: string;

    /* Different versions of query. */
    private queryString: Array<string>;

    /* Actual query version. */
    private currentVersion: number;

    /**
     * Create first version of query.
     */
    public constructor(name: string, queryString: string) {
        this.name = name;
        this.queryString = [];
        this.currentVersion = 0;
        this.queryString[this.currentVersion] = queryString;
    }

    /**
     * Return version name.
     */
    public getName() : string {
        return this.name;
    }

    /**
     * Return query according to given version number. 
     * If query version not exists, method return null.
     * @param version - query version
     */
    public getQuery(version: number) : string {
        if (version < 0 || version > this.currentVersion) {
            return null;
        }

        return this.queryString[version];
    }

    /**
     * Return actual version of query.
     */
    public getLatestQuery() : string {
        return this.queryString[this.currentVersion];
    }

    /**
     * Create new version of query. Return actual query version or version of query that already exists.
     * @param modifiedQueryString - modified query
     */
    public modify(modifiedQueryString: string) : number {
        for (let i = 0; i < this.queryString.length; i++) {
            if (this.queryString[i] === modifiedQueryString) {
                console.warn("Query in given format already exists under returned version.");
                return i;
            }            
        }

        this.currentVersion++;
        this.queryString[this.currentVersion] = modifiedQueryString;
        return this.currentVersion;
    }

    /**
     * Irreversibly reverted change of the query.
     */
    public rollbackLastChange() {
        if (this.currentVersion == 0) {
            return;
        }

        this.queryString.splice(this.currentVersion, 1);
        this.currentVersion--;
    }

    /**
     * Return actual query version.
     */
    public getVersion() : number {
        return this.currentVersion;
    }

}

//#endregion

//#region Query list

/**
 * Manage array of queries.
 */
class QueryList {

    /* Array of queries. */
    private queries: Array<Query>;

    /* Create empty list. */
    public constructor();

    /* Create new list filled with data from given json. */
    public constructor(json: {queries: [{name: string, queryString: Array<string>, currentVersion: number}]});

    public constructor(json?: {queries: [{name: string, queryString: Array<string>, currentVersion: number}]}) {
        this.queries = [];

        if (json != null) {
            for (let i = 0; i < json.queries.length; i++) {
                let query = json.queries[i];

                this.queries.push(new Query(query.name, query.queryString[0]));
                let storedQuery = this.queries[i];
                for (let j = 1; j < query.queryString.length; j++) {
                    storedQuery.modify(query.queryString[j]);
                };
            }
        }
    }

    /* Add new query to the list. */
    public add(query: Query) {
        this.queries.push(query);
    }

    /**
     * Return query according to given index.
     * @param index - index into the list of queries 
     */
    public get(index: number) : Query | null {
        return this.queries[index];
    }

    /**
     * Return query according to given queryName. If query with given name not exists, 
     * method return null.
     * @param queryName name of query
     */
    public find(queryName: string) : Query | null {
        for (let i = 0; i < this.queries.length; i++) {
            let q = this.queries[i];

            if (q.getName() === queryName) {
                return q;
            }            
        }
            
        return null;
    }

    /**
     * Remove query from list according to given queryName. If operation succed, 
     * method return true, otherwise return false.
     * @param queryName - name of query
     */
    public remove(queryName: string) : boolean {
        for (let i = 0; i < this.queries.length; i++) {
            let q = this.queries[i];

            if (q.getName() === queryName) {
                this.queries.splice(i, 1);
                return true;
            }            
        }

        return false;
    }

}

//#endregion

//#region Query Manager

/**
 * Manage operations with local storage. Provide methods for loading and storing queries in local storage.
 * Also provide methods for query version control.
 */
class QueryManager {

    /* Storage prefix */
    private readonly prefix = 'queries';

    /* In-memory list of queries. */
    private queries: QueryList;

    /* Load stored queries or create new storage. */
    public constructor() {
        let jsonString = localStorage.getItem(this.prefix);

        if (jsonString != null) {
            const json = JSON.parse(jsonString);
            this.queries = new QueryList(json);
        }
        else {
            this.queries = new QueryList();
        }
    }

    /**
     * Store given query in memory storage. Return if operation succeeded or not.
     * @param queryName - name of query
     * @param queryString - plaintext query
     */
    public storeQuery(queryName: string, queryString: string) : boolean {
        if (this.queries.find(queryName) != null) {
            console.warn("Query with given name already exists, try call 'modifyQuery'.");
            return false;
        }

        this.queries.add(new Query(queryName, queryString));
        return true;
    }

    /**
     * Load latest query version from storage. Query is resolved based on given name.
     * If query not exists, method return null.
     */
    public loadLatestQuery(queryName: string) : string | null {
        let query = this.queries.find(queryName);
        
        if (query != null) {
            return query.getLatestQuery();
        }

        return null;
    }

    /**
     * Load query with specific version from storage. Query is resolved based on given name and version.
     * If query or tis version not exists, method return null.
     * @param queryName - name of query
     * @param version - version of query
     */
    public loadQuery(queryName: string, version: number) : string | null {
        let query = this.queries.find(queryName);
        
        if (query != null) {
            return query.getQuery(version);
        }

        return null;
    }

    /**
     * Create new version of some query and return actual version of query.
     * If query not exists, method return -1 as version.
     * @param queryName - name of modified query
     * @param queryString - new query
     */
    public modifyQuery(queryName: string, queryString: string) : number {
        let query = this.queries.find(queryName);

        if (query != null) {
            return query.modify(queryString);
        }

        return -1;
    }

    /**
     * Remove query from list.
     * @param queryName - query name
     */
    public removeQuery(queryName: string) : boolean {
        return this.queries.remove(queryName);
    }

    /**
     * Irreversibly reverted change of the given query.
     * @param queryName - name of query
     */
    public rollbackQuery(queryName: string) : number | null {
        let query = this.queries.find(queryName);

        if (query != null) {
            query.rollbackLastChange();
            return query.getVersion();
        }

        return null;
    }

    /**
     * Store changes into local storage. Generally all queries are loaded and managed in-memory
     * and every change must be at the end stored using this method to persist data.
     */
    public save() {
        let json = JSON.stringify(this.queries);
        localStorage.setItem(this.prefix, json);
    }

}

//#endregion