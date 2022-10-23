var data;

function getDate() {
    const date = new Date()
    const pst = date.toLocaleString('en-US', {timeZone: 'America/Los_Angeles'});
    const parts = pst.split(",")[0].split("/");
    return parts[2] + "-" + parts[0] + "-" + parts[1];
}

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function checkCounts(words) {
    var lengths = data["counts"]["lengths"].slice();
    var letters = {};
    for (var [k, v] of Object.entries(data["counts"]["letters"])) {
        letters[k] = v.slice();
    }
    var totals = data["counts"]["totals"].slice();

    for (var [k, v] of Object.entries(letters)){
        for (var word of words) {
            l = word.length;
            if (word.startsWith(k)) {
                n = lengths.indexOf(l);
                v[n] -= 1
                v[v.length-1] -= 1
                totals[n] -= 1;
                totals[totals.length-1] -= 1;
            }
        }
    }

    var output = {
        "lengths": lengths,
        "letters": letters,
        "totals": totals,
    }

    return output;
}

function checkPairs(input, words) {
    // create output
    var output = {}
    for (let [k, v] of Object.entries(input)) {
        output[k] = v;
    }
    // update stats
    for (let word of words) {
        for (let [k, v] of Object.entries(input)) {
            if (word.startsWith(k)) {
                output[k] -= 1;
            }
        }
    }
    return output;
}

function checkPangrams(letters, words) {
    // check how many pangrams the user has
}

function checkStats(words=null) {
    // words left
    if (!words) {
        var words = getWords();
    }

    // update the input box
    let input = document.getElementById("words");
    console.log(input);
    input.value = words.join("\n");

    // check number of words
    var words_left = checkWords(words);
    var output = words_left + " words left of " + data["words"] + " words.\n";

    // counts
    var counts = checkCounts(words);
    const lengths = counts["lengths"];
    const letters = counts["letters"];
    const totals = counts["totals"];

    // lengths
    output += "\nLengths\n";
    for (let i=0; i<totals.length; i++) {
        let tot = totals[i];
        let len = lengths[i];
        if (tot) {
            var t = "word";
            if (tot > 1) {
                t = "words";
            }
            if (len) {
                output += "  " + tot + " " + len + "-letter " + t + "\n";
            }
        }
    }

    // letters
    output += "\nLetters:\n";
    for (let [k, v] of Object.entries(letters)) {
        if (!v[v.length-1]) {
            continue;
        }
        output += "  " + k + ":";
        for (let i=0; i<v.length; i++) {
            let count = v[i];
            let value = lengths[i];
            if (value && count > 0) {
                output += " " + value + "x" + count;
            } else if (!value) {
                output += " (" + count + ")";
            }
        }
        output += "\n";
    }

    // two-letter stats
    var pairs = checkPairs(data["pairs"], words);
    output += "\nPairs:\n";
    for (let [k, v] of Object.entries(pairs)) {
        if (v > 0) {
            output += "  " + k + ": " + v + "\n";
        }
    }

    var div = document.getElementById("output");
    div.innerHTML = output;
}

function checkWords(words) {
    return data["words"] - words.length;
}

function getWords() {
    var textarea = document.getElementById("words");
    var text = textarea.value.trim();
    var words = [];
    if (text) {
        for (let word of text.toLowerCase().replaceAll("\n", " ").split(" ")) {
            if (word) {
                words.push(word);
            }
        }
    }
    words.sort();
    console.log(words);
    return words;
}

function loadPage() {
    var date = getDate();
    var url = "https://storage.googleapis.com/lukwam-bee-hints/" + date + ".json";
    console.log("Getting " + url + "...")
    var jsonString = httpGet(url);
    data = JSON.parse(jsonString);
    console.log(data);
    let words = new URLSearchParams(window.location.search).get("words").split(",");
    if (words) {
        console.log("Words: " + words);
        checkStats(words);
        let div = document.getElementById("words");
        div.innerHTML = words.join("\n");
    }
}

function isPangram(letters, word) {
    var puz = Array.from(new Set(letters.split(""))).sort().toString("")
    var test = Array.from(new Set(word.split(""))).sort().toString("")
    if (puz === test) {
        return true;
    }
    return false;
}

function isPerfect(letters, word) {
    if (isPangram(letters, word) && letters.length == word.length) {
        return true;
    }
    return false;
}

function hints() {
    var ws=[],a=document.getElementsByClassName("sb-wordlist-items-pag")[0].getElementsByClassName("sb-anagram"),u="https://lukwam.github.io/bee/";for(var i=0;i<a.length;i++){ws.push(w=a[i].innerHTML);};var u="https://lukwam.github.io/bee/?"+new URLSearchParams({"words": ws}).toString();open(u);
}
