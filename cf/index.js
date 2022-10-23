const functions = require('@google-cloud/functions-framework');
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;


function getDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '/' + mm + '/' + dd;
    return today;
}

function getUrl() {
    var date = getDate();
    var url = "https://www.nytimes.com/" + date + "/crosswords/spelling-bee-forum.html"
    return url;
}

function parseContent(articleBody) {
    console.log(articleBody);
    var content = articleBody.childNodes[3].childNodes[0].childNodes[0].childNodes[7];
    // var content = articleBody.getElementsByClass("content");
    // console.log(content);
    // get letters
    var middle = content.childNodes[3].childNodes[1].innerHTML.trim();
    var rest = content.childNodes[3].childNodes[3].innerHTML.trim();
    var letters = (middle + rest).replace(/\s/g, '');
    console.log("Letters: " + letters);

    // get status
    var stats = content.childNodes[5].innerHTML.trim().split(", ");

    // get words
    var words = 0;
    for (stat of stats) {
        if (stat.startsWith("WORDS: ")) {
            words = parseInt(stat.split(": ")[1])
        }
    }
    console.log("Words: " + words);

    // get points
    var points = 0;
    for (stat of stats) {
        if (stat.startsWith("POINTS: ")) {
            points = parseInt(stat.split(": ")[1])
        }
    }
    console.log("Points: " + points);

    // get pangrams
    var pangrams = 0;
    for (stat of stats) {
        if (stat.startsWith("PANGRAMS: ")) {
            pangrams = parseInt(stat.split(": ")[1])
        }
    }
    console.log("Pangrams: " + pangrams);

    // check for bingo
    var bingo = stats.includes("BINGO") ? true : false
    console.log("Bingo: " + bingo);

    // get the table
    var tableRows = content.childNodes[7].childNodes[1].childNodes;
    var header = false;
    var data = {};
    var lengths = [];
    for (var row of tableRows) {
        if (row.nodeName == "TR") {
            if (!header) {
                for (var h of row.childNodes) {
                    if (h.nodeName == "TD") {
                        let length = h.childNodes[0].data.trim();
                        if (length) {
                            lengths.push(length);
                        }
                    }
                }
                header = true;
            } else {
                let letter = "";
                let letterLengths = [];
                for (var d of row.childNodes) {
                    if (d.nodeName == "TD") {
                        if (!letter) {
                            letter = d.childNodes[0].innerHTML;
                            if (!letter) {
                                letter = d.innerHTML.replace("-", "").trim();
                            }
                        } else {
                            let value = d.innerHTML.replace("-", "").trim();
                            letterLengths.push(value);
                        }
                    }
                }
                // console.log(row);
                console.log(letter + ": " + letterLengths);
                data[letter] = letterLengths;
            }

        }
    }

    // get the two-letter list
    var twoLetters = content.childNodes[11];
    var twoString = "";
    for (var entry of twoLetters.childNodes) {
        if (entry.nodeName == "SPAN") {
            twoString += entry.innerHTML.trim().split("\n")[0] + " ";
        }
    }
    twoList = twoString.trim().split(" ");

    var text = "Letters: " + letters + "<br>\n";
    text += "Words: " + words + "<br>\n";
    text += "Points: " + points + "<br>\n";
    text += "Pangrams: " + pangrams + "<br>\n";
    text += "Bingo: " + bingo + "<br>\n";
    text += "Lengths: " + lengths + "<br>\n";
    text += "Letter Counts:\n<br>\n";
    for (const [k, v] of Object.entries(data)) {
        text += k + ": " + v + "<br>\n";
    }
    text += "Two-Letter List: " + twoList;

    output = {
        "letters": letters,
        "words": words,
        "points": points,
        "pangrams": pangrams,
        "bingo": bingo,
        "lengths": lengths,
        "letter_counts": data,
        "two_letter_list": twoList,
    }
    return JSON.stringify(output);

}

function get_request(url, callback, response){
    var options = {
        "headers": {
            "User-Agent": "curl/7.74.0"
        },
    }
    fetch(url, options)
        .then(res => res.text())
        .then(text => callback(text, response));
}

function parseBody(body, res) {
    var dom = new JSDOM(body);
    // console.log(dom);
    var document = dom.window.document;
    // console.log(dom.window);

    // var contents = document.getElementsByClass("content");
    // console.log(contents);

    var articleBody = document.getElementsByName("articleBody")[0];
    var output = parseContent(articleBody);
    // console.log(output);
    res.send(output);
}

functions.http('spellingBeeHints', (req, res) => {
    // get the url of today's spelling bee
    var url = getUrl();
    // console.log(url);

    // get content via http
    var dom = get_request(url, parseBody, res);
    console.log(dom);

    // get dom
    // var dom = new JSDOM(body);
    // console.log(dom.window.document);

    // const response = await fetch('https://reddit.com/');
	// const body = await response.text();
	// console.log(body); // prints a chock full of HTML richness
	// return body;

    // var output = getContent();
    // res.send(response);
    // res.send("ok");
    // res.send("ok");
});
