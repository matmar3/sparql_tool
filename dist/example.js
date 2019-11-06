$(document).ready(function () {
    // Copy value into textarea
    $('.query-example').click(function() {
        var query = $(this).data("query");
    
        $("#query-input").val(query);
    });
    
    // send query to Viruoso or Fuseki endpoint
    $('.submit-query').click(function(event) {
        event.preventDefault();
    
        var query = $('#query-input').val();
        var sparql = new SPARQL("#example-sparql-results");
        var url = $(this).data("url");
        
        sparql.plaintext_query(url, query);
    });
});
