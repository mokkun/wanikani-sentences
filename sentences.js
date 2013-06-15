// ==UserScript==
// @name       WaniKani Vocab Sentences
// @namespace  http://mozartpetter.com/wanikani
// @version    0.2
// @description  Loads sentences from jisho.org and displays it into the vocab screen of the WaniKani website.
// @match      http://www.wanikani.com/review/session
// @copyright  2013, Mozart Petter
// @license    http://creativecommons.org/licenses/by/3.0/deed.en_US
// ==/UserScript==

// --- YOU CAN CHANGE THOSE VALUES IF YOU WANT --- //

// The number of sentences you want to view at once.
var TOTAL_SENTENCES = 3;
// This will filter sentences that contains more than X chars on it.
var MAX_CHARS_INTO_SENTENCE = 30;
// If you don't want to see the translations, set it to false.
var SHOW_TRANSLATIONS = true;


// --- YOU SHOULDN'T CHANGE THOSE VALUES --- //
// Sets debug mode on. You can play with it if you want't, but it will break the webpage. ;)e
var DEBUG = false;


// --- DON'T TOUCH HERE UNLESS YOU KNOW WHAT YOU'RE DOING --- //
/**
 * Checks if the current screen is a vocab screen.
 */
function checkIfVocab() {
    var header = document.getElementsByTagName("h1")[0];
    var isVocab = header.className == "vocabulary";
    if (isVocab) {
        var vocab = header.childNodes[0].innerHTML;
        getSentencesForVocab(vocab);
    }
}

/**
 * Parses the given html code.
 * 
 * @param html The HTML code to be parsed.
 * @parma vocab The current vocab word.
 */
function parseContent(html, vocab) {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    var sentenceNode = wrapper.getElementsByClassName('japanese');
    var translationNode = wrapper.getElementsByClassName('english');
    var content = getContentFromDom(sentenceNode, translationNode, vocab);
    showContent(content);
}

/**
 * Extracts the sentences and translations from the given DOM object.
 * 
 * @param sentenceNodes A collection of the HTML elements containing the sentences.
 * @param translationNodes A collection of the HTML elements containing the translations.
 * @param vocab The current vocab word.
 */
function getContentFromDom(sentenceNodes, translationNodes, vocab) {
    var excludedIndexes = [];
    var content = [];
    for (var i = 0, c = 0; c < TOTAL_SENTENCES && i < sentenceNodes.length; i++) {
        var randomIndex = getRandomNumber(sentenceNodes.length, excludedIndexes);
        excludedIndexes.push(randomIndex);
        var sentenceNode = sentenceNodes[randomIndex];
        var translationNode = translationNodes[randomIndex];
        var sentence = sentenceNode.innerText;
        if (sentence.length > MAX_CHARS_INTO_SENTENCE) continue;
        var translation = translationNode.innerText;
        var hightlightedVocab = '<strong class="kanji-highlight" style="padding-left: 2px; padding-right: 2px;color:#666;background-color:#EEE">' + vocab + '</strong>';
        sentence = sentence.replace(vocab, hightlightedVocab, "gi");
        content[c] = [];
        content[c].push(sentence);
        content[c].push(translation);
        c++;
    }
    return content;
}

/**
 * Generates a random number using max as a limit and excluding 
 * any numbers from exclude collection.
 * 
 * @param max The limit for the random number.
 * @param exclude A list with numbers to be excluded from the randomization.
 */
function getRandomNumber(max, exclude) {
    var result = Math.floor(Math.random() * max);
    for (var i = 0; i < exclude.length; i++) {
        if (exclude[i] == result) {
            return getRandomNumber(max, exclude);
        }
    }
    return result;
}

/**
 * Show the sentences from the given collection.
 * 
 * @param sentences A collection of sentences to be displayed.
 */
function showContent(sentences) {
    var container = document.getElementById('item-info-main');
    var htmlCode = '<h3>Usage Examples</h3>';
    htmlCode += '<ul style="padding: 0px;line-height: 1.8em;list-style: decimal inside;">';
    for (var i = 0; i < sentences.length; i++) {
        htmlCode += '<li style="font-weight: bold;color: #888;">';
        htmlCode += '<span style="font-weight: normal; color: #333;padding-left: 5px;display:block;">' + sentences[i][0] + '</span>';
        if (SHOW_TRANSLATIONS) {
	        htmlCode += '<span style="display: block;margin-bottom: 10px;font-weight: normal;color: #888;padding-left: 20px;">' + sentences[i][1] + '</span>';
        }
        htmlCode += '</li>';
    }
    htmlCode += '<ul>';
    htmlCode += '</ul>';
    var node = document.createElement('div');
    node.style.display = 'block';
    node.style.marginBottom = '40px';
    node.innerHTML = htmlCode;
    container.insertBefore(node, container.firstChild);
}

/**
 * Loads the sentences for the given vocab.
 * 
 * @param vocab The current vocab word.
 */
function getSentencesForVocab(vocab) {
    GM_xmlhttpRequest ({
        method: "GET",
        url: "http://www.jisho.org/sentences?jap=" + vocab,
        onload: function (response) {
            parseContent(response.responseText, vocab);
        }
    });
}

/**
 * Do a setup to handle events from the question form.
 */
function setupForm() {
    var form = document.getElementById('question-form');
    form.addEventListener("submit", function() {
        checkIfVocab();
    });
}

/**
 * Called when the document is ready.
 */
document.onreadystatechange = function () {
    var state = document.readyState;
    if (state == 'complete') {
        setupForm();
    }
    if (DEBUG) {
        var infoElem = document.getElementById('information');
        var itemInfoElem = document.getElementById('item-info');
        infoElem.style.display = itemInfoElem.style.display = 'block';
        checkIfVocab();
    }
}

// --- I TOLD YOU SO! NOW THE CODE IS BROKEN... :( --- //
