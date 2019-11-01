$(document).ready(function () {
    let virtuoso_url = "http://dbpedia.org/sparql";
    let fuseki_url = "http://localhost:3030/DBM2/query";
    let query = "SELECT ?s ?p ?o ((5) as ?i) WHERE{ ?s ?p ?o } LIMIT 10";

    let sparql = new SPARQL("#example-sparql-results");
    sparql.plaintext_query(virtuoso_url, query);
    sparql.plaintext_query(fuseki_url, query);
});