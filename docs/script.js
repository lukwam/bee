var data;

class Hints {
    #bee;
    #hints;
    #letters;
    #words;

    constructor(bee) {
        this.#bee = bee;
        this.#hints = bee.hints();
        this.#letters = bee.letters();
        this.#words = bee.words();
    }

    // check the counts of how many words are left of each length for each starting letter
    checkLetterLengths() {
        var lengths = this.#hints["counts"]["lengths"].slice();
        var words = this.#words.slice();

        // create a new dict of the letter counts
        var letters = {};
        for (var [k, v] of Object.entries(this.#hints["counts"]["letters"])) {
            letters[k] = v.slice();
        }

        // create a new slice of the totals
        var totals = this.#hints["counts"]["totals"].slice();

        // update the stats for letter counts
        for (var [k, v] of Object.entries(letters)){
            for (var word of words) {
                var l = word.length;
                if (word.startsWith(k)) {
                    var n = lengths.indexOf(l);
                    v[n] -= 1
                    v[v.length-1] -= 1
                    totals[n] -= 1;
                    totals[totals.length-1] -= 1;
                }
            }
        }

        // create output
        var output = {
            "lengths": lengths,
            "letters": letters,
            "totals": totals,
        }

        return output;

    }

    checkPairs() {
        var pairs = this.#hints["pairs"];
        var words = this.#words;

        // create output
        var output = {}
        for (let [k, v] of Object.entries(pairs)) {
            output[k] = v;
        }

        // update stats
        for (let word of words) {
            for (let [k, v] of Object.entries(pairs)) {
                if (word.startsWith(k)) {
                    output[k] -= 1;
                }
            }
        }
        return output;
    }

    // return the number of pangrams left to find
    checkPangramsLeft() {
        var total = this.#hints["pangrams"];
        if (!total) {
            total = 0;
        }
        var pangrams = 0;
        for (let word of this.#words) {
            if (this.isPangram(word)) {
                pangrams += 1;
            }
        }
        return total - pangrams;
    }

    // return the number of perfect pangrams lef to find
    checkPerfectPangramsLeft() {
        var perfect = 0;
        for (let word of this.#words) {
            if (this.isPerfect(word)) {
                perfect += 1;
            }
        }
        return this.#hints["perfect"] - perfect;
    }

    checkPointsLeft() {

    }

    // return the number of words left to find
    checkWordsLeft() {
        return this.#hints["words"] - this.#words.length;
    }

    // return true if the given word ia a pangram
    isPangram(word) {
        var letters = Array.from(new Set(this.#letters)).sort().toString("")
        var input = Array.from(new Set(word.split(""))).sort().toString("")
        if (input == letters) {
            return true;
        }
        return false;
    }

    // return try if the given word is a pangram and uses all letters
    isPerfect(word) {
        if (this.isPangram(word) && this.#hints["letters"].length == word.length) {
            return true;
        }
        return false;
    }

    updateLetterLengths() {
        var counts = this.checkLetterLengths();
        const lengths = counts["lengths"];
        const letters = counts["letters"];

        // letters
        var output = "<b>Letters:</b>\n";
        for (let [k, v] of Object.entries(letters)) {
            if (!v[v.length-1]) {
                continue;
            }
            output += "<li>" + k + ": ";
            for (let i=0; i<v.length; i++) {
                // output += "<li>";
                let count = v[i];
                let value = lengths[i];
                if (value && count > 0) {
                    output += " " + value + "x" + count;
                } else if (!value) {
                    output += " (" + count + ")";
                }
            }
            output += "</li>\n";
        }
        var div = document.getElementById("letter-lengths");
        div.innerHTML = output;
    }

    updatePairs() {
        // two-letter stats
        var pairs = this.checkPairs();
        var output = "<b>Pairs</b>\n";
        for (let [k, v] of Object.entries(pairs)) {
            if (v > 0) {
                output += "<li>" + k + ": " + v + "</li>\n";
            }
        }
        var div = document.getElementById("letter-pairs");
        div.innerHTML = output;
    }

    updatePangrams() {
        var total = this.#bee.pangrams();
        var left = this.checkPangramsLeft();
        var found = total - left;
        if (!total) {
            var output = "No pangrams today.";
        } else if (!left) {
            var output = "You found all " + total + " pangrams!";
        } else {
            var output = "You found " + found + "/" + total + " pangrams, with " + left + " remaining."
        }
        var div = document.getElementById("pangrams");
        div.innerHTML = output;
    }

    updateStats() {
        this.updateWordsLeft();
        this.updatePangrams();
        this.updateWordLengths();
        this.updateLetterLengths();
        this.updatePairs()
        this.updateWordsByLength();
    }

    updateWordLengths() {
        var counts = this.checkLetterLengths();
        const lengths = counts["lengths"];
        const totals = counts["totals"];
        var output = "<b>Word Lengths</b>\n";
        for (let i=0; i<totals.length; i++) {
            let tot = totals[i];
            let len = lengths[i];
            if (tot) {
                var t = "word";
                if (tot > 1) {
                    t = "words";
                }
                if (len) {
                    output += "<li>" + tot + " x " + len + "-letter " + t + "</li>\n";
                }
            }
        }
        var div = document.getElementById("word-lengths");
        div.innerHTML = output;
    }

    updateWordsByLength() {
        var output = "";
        var wordLengths = {};
        for (let word of this.#words) {
            if (!wordLengths[word.length]) {
                wordLengths[word.length] = [];
            }
            wordLengths[word.length].push(word);
        }
        for (let [k, v] of Object.entries(wordLengths)) {
            output += "<b>" + k + "-letters</b><br>\n";
            output += "<p>" + v.join(" ") + "</p>\n";
        }
        var div = document.getElementById("words-by-length");
        div.innerHTML = output;
    }

    // updateWordsByLetter() {
    //     var output = "";
    //     var wordLengths = {};
    //     for (let word of this.#words) {
    //         if (!wordLengths[word.length]) {
    //             wordLengths[word.length] = [];
    //         }
    //         wordLengths[word.length].push(word);
    //     }
    //     for (let [k, v] of Object.entries(wordLengths)) {
    //         output += "<b>" + k + "-letters</b><br>\n";
    //         output += "<p>" + v.join(" ") + "</p>\n";
    //     }
    //     var div = document.getElementById("words-by-length");
    //     div.innerHTML = output;
    // }

    updateWordsLeft() {
        var total = this.#hints["words"];
        var left = this.checkWordsLeft();
        var found = total - left;
        var div = document.getElementById("words-left");
        var output = "You found " + found + "/" + total + " words with " + left + " remaining.";
        div.innerHTML = output
    }

}

class Bee {
    #bucketBaseUrl = "https://storage.googleapis.com/lukwam-bee-hints/";
    #hints = {};
    #letters = [];
    #words = [];

    // readers
    hints() {
        return this.#hints;
    }

    letters() {
        return this.#letters.slice();
    }

    pangrams() {
        let pangrams = this.#hints["pangrams"];
        if (!pangrams) {
            pangrams = 0;
        }
        return pangrams;
    }

    words() {
        return this.#words.slice();
    }

    // get the hints JSON data from the google bucket
    getHints() {
        var url = this.getBucketUrl();
        var jsonString = this.httpGet(url);
        console.log("Retrieving hints data from: " + url);
        var hints = JSON.parse(jsonString);
        console.log("Hints data retrieved successfully!")
        console.log(hints);
        this.#hints = hints;
        this.#letters = hints["letters"];
    }

    // get the user's list of words from the url search params
    getWordsFromArgs() {
        let params = new URLSearchParams(window.location.search);
        var words = params.get("words").toLowerCase().split(",");
        if (words) {
            console.log("Words: " + words.join(" "));
            words.sort();
            this.#words = words.slice();
        }
        return words;
    }

    // get the user's list of words from the textarea input
    getWordsFromInput() {
        var textarea = document.getElementById("words");
        var text = textarea.value.trim();
        var words = [];
        if (text) {
            let inputs = text.toLowerCase().replaceAll("\n", " ").split(" ");
            for (let word of inputs) {
                if (word) {
                    words.push(word);
                }
            }
        }
        words = [...new Set(words)].sort();
        console.log(words);
        console.log("Words: " + words.join(" "))
        this.#words = words;
        return words;
    }

    // get the yyy-mm-dd date string for PST time
    getPstDateString() {
        const date = new Date()
        const pst = date.toLocaleString('en-US', {timeZone: 'America/Los_Angeles'});
        const parts = pst.split(",")[0].split("/"),
            m = parts[0], d = parts[1], y = parts[2];
        return y + "-" + m + "-" + d;
    }

    // get the url of the bucket based on the pst date string
    getBucketUrl() {
        let dateString = this.getPstDateString();
        return this.#bucketBaseUrl + dateString + ".json";
    }

    // retrieve data from a url and return the response
    httpGet(url) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", url, false );
        xmlHttp.send( null );
        return xmlHttp.responseText;
    }

    // update date on the page
    updateDate() {
        var date = this.getPstDateString();
        var div = document.getElementById("date");
        div.innerHTML = date;
        var span = document.getElementById("date-header");
        span.innerHTML = date;
    }

    // update the user's list of words in the input box
    updateWords() {
        let words = this.words();
        let div = document.getElementById("words");
        div.value = words.join("\n");
    }

}

var bee = new Bee();

function loadPage() {
    bee.getHints();
    bee.getWordsFromArgs();
    bee.updateDate();
    if (bee.words()) {
        updateStats(true);
    }
}

function updateStats(onLoad=false) {
    if (!onLoad) {
        bee.getWordsFromInput();
    }
    bee.updateWords();
    var hints = new Hints(bee);
    hints.updateStats();
}


// function hints() {
//     var ws=[],a=document.getElementsByClassName("sb-wordlist-items-pag")[0].getElementsByClassName("sb-anagram"),u="https://lukwam.github.io/bee/";for(var i=0;i<a.length;i++){ws.push(w=a[i].innerHTML);};var u="https://lukwam.github.io/bee/?"+new URLSearchParams({"words": ws}).toString();open(u);
// }
