# SPARQL Tool
Javascript tool that can be easily embedded into another web projects. The tool is written in Typescript using JQuery and translated for ECMAScript 5.

## Features
   - send a SPARQL query to a specified SPARQL endpoint
   - write the result of the query into a table and visualize it at a specific location on the website
   - load/save query to browser local storage
   - manage saved queries
   - search saved queries
   - queries version control
   
## Usage 
```HTML
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<script src="sparqljs.js"></script>
```
### SPARQL Client 
#### Create a new instance
```javascript
var sparqlTool = new SPARQL();
```
Optionally, you can provide a custom target element to the constructor as a new place to render results:
```javascript
var sparqlTool = new SPARQL("#target-element");
```
#### Send SPARQL query
```javascript
sparqlTool.plaintext_query('URL', 'SELECT ?s ?p ?o ((5) as ?i) WHERE{ ?s ?p ?o } LIMIT 10');
```
Opionally, you can provide callbacks to manage response on success and error. Default callback render data into specified target and error callback print error into console.
```javascript
sparqlTool.plaintext_query(
        'URL', 
        'SELECT ?s ?p ?o ((5) as ?i) WHERE{ ?s ?p ?o } LIMIT 10',
        successCallableFunction,
        errorCallableFunction
);
```
### Query Manager
```javascript
var queryManager = new QueryManager(); // Load queries from local storage or create new one
```
Manage operations with local storage. Also provide methods for query version control.
```javascript
queryManager.storeQuery('example1', 'SELECT ?s ?p ?o ((5) as ?i) WHERE{ ?s ?p ?o } LIMIT 10'); // true (version 0)
queryManager.modifyQuery('example1', 'SELECT ?s ?p ?o ((5) as ?i) WHERE{ ?s ?p ?o }'); // 1 (version 1)
queryManager.loadLatestQuery('example1'); // 'SELECT ?s ?p ?o ((5) as ?i) WHERE{ ?s ?p ?o }'
queryManager.loadQuery('example1', 0); // 'SELECT ?s ?p ?o ((5) as ?i) WHERE{ ?s ?p ?o } LIMIT 10'
queryManager.rollbackQuery('example1'); // 0 (actual version, version 1 no longer exists)
queryManager.removeQuery('example1'); // true
queryManager.save(); // save changes into local storage
```
## License
This software is written by Martin Matas.

This code is released under the [MIT license](http://opensource.org/licenses/MIT).