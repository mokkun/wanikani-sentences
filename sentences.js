// ==UserScript==
// @name       WaniKani Vocab Sentences
// @namespace  http://mozartpetter.com/wanikani
// @version    0.1
// @description  Loads sentences from jisho.org and displays it into the vocab screen of the WaniKani website.
// @match      http://www.wanikani.com/review/session
// @copyright  2013, Mozart Petter
// @license    http://creativecommons.org/licenses/by/3.0/deed.en_US
// ==/UserScript==

function checkIfVocab() {
    var header = document.getElementsByTagName("h1")[0];
    var isVocab = header.className == "vocabulary";
    var isReading = (document.getElementsByClassName("reading").length > 0);
    if (isVocab && isReading) {
        var vocab = header.childNodes[0].innerHTML;
        getSentencesForVocab(vocab);
    }
}

function parseContent(html, vocab) {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    var sentenceNodes = wrapper.getElementsByClassName('japanese');
    var sentences = getSentencesFromDom(sentenceNodes, vocab);
    showSentences(sentences);
}

function getSentencesFromDom(nodes, vocab) {
    var excludedIndexes = [];
    var sentences = [];
    for (var i = 0; i < 3 && i < nodes.length; i++) {
        var randomIndex = getRandomNumber(nodes.length, excludedIndexes);
        excludedIndexes.push(randomIndex);
        var node = nodes[randomIndex];
        var sentence = node.innerText;
        var hightlightedVocab = '<strong>' + vocab + '</strong>';
        sentence = sentence.replace(vocab, hightlightedVocab, "gi");
        sentences.push(sentence);
    }
    return sentences;
}

function getRandomNumber(max, exclude) {
    var result = Math.floor(Math.random() * max);
    for (var i = 0; i < exclude.length; i++) {
        if (exclude[i] == result) {
            return getRandomNumber(max, exclude);
        }
    }
    return result;
}

function showSentences(sentences) {
    var container = document.getElementById('item-info-main');
    var readingElem = document.getElementById('reading-explanation');
    var htmlCode = '<h3>Usage Examples</h3>';
    htmlCode += '<ul style="padding: 0px;list-style: none;line-height: 1.6em;">';
    for (var i = 0; i < sentences.length; i++) {
        htmlCode += '<li>' + sentences[i] + '</li>';
    }
    htmlCode += '<ul>';
    htmlCode += '</ul>';
    var node = document.createElement('div');
    node.style.display = 'block';
    node.style.marginBottom = '40px';
    node.innerHTML = htmlCode;
    container.insertBefore(node, readingElem);
}

function getSentencesForVocab(vocab) {
    GM_xmlhttpRequest ({
        method: "GET",
        url: "http://www.jisho.org/sentences?jap=" + vocab,
        onload: function (response) {
            parseContent(response.responseText, vocab);
        }
    });
}

function setupForm() {
    var form = document.getElementById('question-form');
    form.addEventListener("submit", function() {
        checkIfVocab();
    });
}

document.onreadystatechange = function () {
    var state = document.readyState;
    if (state == 'complete') {
        setupForm();
    }
}
