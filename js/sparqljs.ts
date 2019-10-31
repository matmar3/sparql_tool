//#region SPARQL

class SPARQL {

    private readonly DEFAULT_TARGET = "body";

    private targetElement: string;

    constructor();
    constructor(targetElement: string);
    constructor(targetElement?: string) {
        if (targetElement == null) {
            this.targetElement = this.DEFAULT_TARGET;
        }

        this.targetElement = targetElement;
    }

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
    
    private handleResults(json: { head: { vars: [ any ], link: any }, results: { "bindings": [ any ] } }) {
        const variables = json.head.vars;
        const bindings = json.results.bindings;
    
        let table = document.createElement("table");
        let header = document.createElement("thead");
        let body = document.createElement("tbody");

        {
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

        {
            for (let i = 0; i < bindings.length; i++) {
                let row = document.createElement("tr");

                for (var prop in bindings[i]) {
                    if (Object.prototype.hasOwnProperty.call(bindings[i], prop)) {
                        let cell = document.createElement("td");
                        cell.innerHTML = bindings[i][prop].value;
                        cell.style.cssText = "border: 1px solid black; padding:5px;";
                        row.appendChild(cell);   
                    }
                }

                row.style.cssText = "border: 1px solid black;";
                body.appendChild(row);                
            }
        }

        table.appendChild(header);
        table.appendChild(body);
        table.style.cssText = "border-collapse: collapse; border: 1px solid black; margin-bottom: 3em;"; 

        $(this.targetElement).append(table);
    }
    
    private handleError(error: any) {
        console.log("Error occured: ", error);
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

    public constructor();
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
                this.queries.splice(i, 1);
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
        let jsonString = localStorage.getItem(this.prefix);

        if (jsonString != null) {
            const json = JSON.parse(jsonString);
            this.queries = new QueryList(json);
        }
        else {
            this.queries = new QueryList();
        }
    }

    public storeQuery(queryName: string, queryString: string) : boolean {
        if (this.queries.find(queryName) != null) {
            console.warn("Query with given name already exists, try call 'modifyQuery'.");
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

    public modifyQuery(queryName: string, queryString: string) : number {
        let query = this.queries.find(queryName);

        if (query != null) {
            return query.modify(queryString);
        }

        return -1;
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