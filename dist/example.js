$(document).ready(function () {
    $('.query-example').click(function() {
        var query = $(this).data("query");
    
        $("#query-input").val(query);
    });
    
    $('#submit-query').click(function(event) {
        event.preventDefault();
    
        var query = $('#query-input').val();
        var sparql = new SPARQL("#example-sparql-results");
        var virtuoso_url = "http://dbpedia.org/sparql";
        var fuseki_url = "http://localhost:3030/DBM2/query";
        
        sparql.plaintext_query(virtuoso_url, query);
        sparql.plaintext_query(fuseki_url, query);
    });
});
