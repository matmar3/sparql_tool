function example() {
    
    if (localStorage.clickcount) {
        localStorage.clickcount = Number(localStorage.clickcount) + 1;
    } else {
        localStorage.clickcount = 1;
    }
    console.log(localStorage.clickcount);
    
    // curl http://10.0.0.8:3030/notes/query 
    // -X POST 
    // --data 'query=SELECT+*%0AWHERE%7B%0A%09%3Fs+%3Fp+%3Fo%0A%7D%0ALIMIT+10' 
    // -H 'Accept: application/sparql-results+json,*/*;q=0.9'

    $.ajax({
        type: "POST",
        url: "http://dbpedia.org/sparql",
        data: { query: "SELECT ?s ?p ?o ((5) as ?i) WHERE{ ?s ?p ?o } LIMIT 10"} ,
        //   contentType: 'application/sparql-results-json',
        //   xhrFields: {
        //      withCredentials: true
        //   },
        success: function(result){
        console.log(result);
        }
    });

    $.ajax({
        type: "POST",
        url: "http://localhost:3030/ibds-debug/sparql",
        data: { query: "SELECT ?s ?p ?o ((5) as ?i) WHERE{ ?s ?p ?o } LIMIT 10"} ,
        //   contentType: 'application/sparql-results json,*/*;q=0.9',
        //   xhrFields: {
        //      withCredentials: true
        //   },
        success: function(result){
            console.log(result);
        }
    });
}

$(document).ready(function () {
    example();
});