var data;

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function checkStats() {
    var textarea = document.getElementById("words");
    var words = textarea.value.split(" ");
    console.log(words);

}

function loadPage() {
    var url = "https://spelling-bee-hints-ogqo6aktjq-uc.a.run.app/";
    var jsonString = httpGet(url);
    data = JSON.parse(jsonString);
    console.log(data);

    // var words = ['civic', 'connive', 'connived', 'convene', 'convened', 'convenience', 'convince', 'convinced', 'cove', 'coven', 'dive', 'dived', 'divide', 'divided', 'dividend', 'divine', 'divined', 'divvied', 'dove', 'envied', 'even', 'evened', 'evidence', 'evidenced', 'inconvenience', 'inconvenienced', 'invoice', 'invoiced', 'ivied', 'novice', 'oven', 'ovine', 'ovoid', 'vend', 'vended', 'video', 'videoed', 'vied', 'voice', 'voiced', 'voodoo']
    // var string = "";
    // words.forEach((word) => string += word + " ");
    // console.log(string.trim());
    // var bwords = data["words"];
    // var left = bwords - words.length;
    // console.log("Left: " + left);

    // var output = "";
    // output += left + " words left to find out of " + bwords + "<br>\n";
    // var div = document.getElementById("output");
    // div.innerHTML = output;
}
