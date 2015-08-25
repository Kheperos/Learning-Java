
    var controller;
    var gamesWon = 0;
    var gamesLost = 0;
    var myViewManager = new ViewManager();
    var gamesStarted = new Array();


//the Create Button Factory, accepts an array of letters the ID of the game it creates the buttons for
    function CreateButtonFactory(letterValues, gamePlayedID) {
        var letter;
        var container = document.createElement('DIV');
        container.id = gamePlayedID;
        for (letter in letterValues) {
            var x = document.createElement("INPUT");
            x.setAttribute("type", "button");
            x.setAttribute("value", letterValues[letter]);
            x.setAttribute('style', "margin-top: 25px;");
            container.appendChild(x);
        }
        document.body.appendChild(container);
    }

// a helper function used in order to find all instances of a letter in a string
    function indexes(source, find) {
        var result = [];
        var result = [];
        for (i = 0; i < source.length; ++i) {
            if (source.substring(i, i + find.length) == find) {
                result.push(i);
            }
        }
        return result;
    }

//ViewManager constructor
    function ViewManager() {
        this.views = new Array();
        //refresh views (array modified views
    };
//add a newViewer
    ViewManager.prototype.addView = function (newView) {
        this.views[this.views.length] = newView;
    }
//the function is called when a change is happening in a game
    ViewManager.prototype.updateViews = function (updatedModels) {
        var i;
        var j;
        // search all views
        for (i = 0; i < this.views.length; i++) {
            //and search all games in each view
            if (typeof (this.views[i]) != 'undefined') {
                for (j = 0; j < this.views[i].models.length; j++) {
                    //if the game has been modified refresh the views
                    if (this.views[i].models[j] === updatedModels) {
                        this.views[i].render();
                    }
                }
            }
        }
    }
//when a game is finished ypu unlink it
    ViewManager.prototype.unlinkModels = function (deletedModels) {
        var node = document.getElementById(deletedModels.ID);
        if (node.parentNode) node.parentNode.removeChild(node);
        for (var i = 0; i < this.views.length; i++) {
            //alert((typeof  this.views[i])+i);
            for (var j = 0; j < this.views[i].models.length; j++) {
                if (this.views[i].models[j].ID == deletedModels.ID) {
                    if (this.views[i].models.length == 1) {
                        this.views.splice(i, 1);
                        break;
                    }
                    else {
                        this.views[i].models.splice(j, 1)
                    }
                }
            }
        }
    }

    /**
     * Models
     */
    function HangmanGameModel(keysPressed, lifeRemaining, wordGuessed, wordToGuess, languageUsed, languageUsedLetters, ID) {
        this.keysPressed = keysPressed;
        this.lifeRemaining = lifeRemaining;
        this.wordGuessed = wordGuessed;
        this.wordToGuess = wordToGuess;
        this.languageUsed = languageUsed;
        this.languageUsedLetters = languageUsedLetters;
        this.ID = ID;
        this.modified = false;
    }

    HangmanGameModel.prototype.playTurn = function (letterPlayed) {
        for (var i = 0; i < this.languageUsedLetters.length; i++) {
            if (letterPlayed == this.languageUsedLetters[i]) {
                this.keysPressed[i] = 1;
            }
        }
        var rand1;
        var tempWord = '';
        var My_Array = indexes(this.wordToGuess, letterPlayed);
        if (My_Array.length == 0) {
            //alert('ai pierdut o viata');
            this.lifeRemaining--;
            if (this.lifeRemaining == 0) {
                alert('Sorry that you lost. Try again!');
                gamesLost++;
                return ('The game has finished');
            }
        }
        else {
            rand1 = this.wordGuessed;
            for (var i = 0; i < My_Array.length; i++) {
                rand1 = rand1.substring(0, 2 * My_Array[i]) + letterPlayed + rand1.substring(2 * My_Array[i] + 1);
                //alert (rand1);
                this.wordGuessed = rand1;
            }
            for (i = 0; i < this.wordToGuess.length; i++) {
                tempWord += this.wordToGuess[i] + " ";
            }
            if (this.wordGuessed == tempWord) {
                alert('Congratulations. Now try again!');
                gamesWon++;
                return ('The game has finished');
            }
        }
    }
    /**
     * Views
     */
    function BaseView() {
        this.initialized = false;
        this.models = [];
    }

//BaseView.prototype.getModels = function() {
//    return this.models;
//}

    ClassicGameView.prototype = Object.create(BaseView.prototype);
    ClassicGameView.prototype.constructor = ClassicGameView;
    function ClassicGameView(gameObject) {
        BaseView.call(this);
        this.models = [gameObject];
    }

    var test = new ClassicGameView();

    ClassicGameView.prototype.initialize = function () {
        CreateButtonFactory(this.models[0].languageUsedLetters, this.models[0].ID);
        i = 0;
        var container = document.getElementById(this.models[0].ID);
        var buttons = container.getElementsByTagName('input');
        var currentButton;
        var tempModel = this.models[0];
        for (currentButton in buttons) {
            buttons[currentButton].onclick = function () {
                controller.turnAction(this.value, tempModel);
            }
        }
        var x = document.createElement("INPUT");
        x.setAttribute("type", "hidden");
        x.setAttribute("value", this.models[0].wordToGuess);
        x.setAttribute('class', "wordToGuess");
        container.appendChild(x);
        x = document.createElement("INPUT");
        x.setAttribute("type", "text");
        x.setAttribute('class', "wordGuessed");
        x.setAttribute("value", this.models[0].wordGuessed);
        container.appendChild(x);
        x = document.createElement("INPUT");
        x.setAttribute("type", "text");
        x.setAttribute('class', "lifeRemaining");
        x.setAttribute("value", this.models[0].lifeRemaining);
        container.appendChild(x);
        x = document.createElement("INPUT");
        x.setAttribute("type", "button");
        x.setAttribute('class', "EndGame");
        x.setAttribute("value", 'End Game');
        var temporary = this.models[0];
        var pressed = 0;
        x.onclick = function () {
            for (i in temporary.keysPressed) {
                pressed += parseInt(temporary.keysPressed[i], 10);
            }
            ;
            if (pressed > 0) gamesLost++;
            myViewManager.unlinkModels(temporary);
            //update the results
            document.getElementById('gamesPlayed').value = gamesWon + gamesLost + ' jocuri';
            document.getElementById('gamesResults').value = gamesWon + ' - ' + gamesLost;
        }
        container.appendChild(x);
        //x.onmouseover = function() { Game_Viewer_2(this.game)};
        this.initialized = true;
    }
    ClassicGameView.prototype.refresh = function () {
        var container = document.getElementById(this.models[0].ID);
        container.getElementsByClassName('wordToGuess')[0].value = this.models[0].wordToGuess;
        container.getElementsByClassName("wordGuessed")[0].value = this.models[0].wordGuessed;
        container.getElementsByClassName("lifeRemaining")[0].value = this.models[0].lifeRemaining;
        var buttons = document.getElementById(this.models[0].ID).getElementsByTagName('input');
        var currentButtonIndex;
        for (currentButtonIndex in buttons) {
            if (this.models[0].keysPressed[currentButtonIndex] == 1) {
                buttons[currentButtonIndex].disabled = true;
            }
        }
    }
    ClassicGameView.prototype.render = function () {
        if (this.initialized) {
            this.refresh();
        }
        else {
            this.initialize();
        }
    }

    function SummaryGameView(gameObject) {
        this.game = gameObject;
    }

    SummaryGameView.prototype = new BaseView;
    SummaryGameView.prototype.render = function () {
    }

    /**
     * Controllers
     */
    function HangmanController() {
        this.initialize();
    }

    HangmanController.prototype.initialize = function () {
        document.getElementById('gamesPlayed').value = gamesWon + gamesLost + ' jocuri';
        document.getElementById('gamesResults').value = gamesWon + ' - ' + gamesLost;
        //start a new game
    }

    HangmanController.prototype.startAction = function (Button) {
        //document.body.innerHTML = "";
        var gameObject;
        var gameView;
        var j = 0;
        var i = 0;
        var rand; //the chosen word
        var languageUsed = ['Romanian', 'English', 'Russian', 'Symbol'];
        var Language_Library = [['ITINERARIU', 'CUTIE', 'TELEVIZOR', 'AEROPLAN', 'FRIGIDER', 'FARFURIE', 'BIROU', 'CALCULATOR'],
            ['TRAVELLER', 'CROWN', 'REFRIGERATOR', 'HAPHAZARD', 'JAWBREAKER', 'MICROWAVE', 'SCHIZOPHRENIA', 'PNEUMONIA', 'UNKNOWN'],
            ['ПУТНИК', 'КОРОНА', 'ХОЛОДИЛЬНИК', 'НЕИЗВЕСТНЫЙ', 'ГОСУДАРСТВО', 'СООТНОШЕНИЯ', 'АНГЛИЙСКИЙ', 'МИКРОВОЛНЫ'],
            []];
        var Language_Letters = [["A", "\u0102", '\u00C2', "B", "C", "D", "E", "F", "G", "H", "I", "\u00CE", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "\u015E", "T", "\u021A", "U", "V", "W", "X", "Y", "Z"],
            ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
            ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'],
            []];

        var Language_Letters_Pressed = [["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
            ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
            ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
            []];

        var Unknown_Word = '';
        //start a new game with
        for (i in languageUsed) if (languageUsed[i] == Button.id) {
            //choose a random word from the library
            rand = Language_Library[i][Math.floor(Math.random() * Language_Library[i].length)];
            //create the unknown word
            for (j = 0; j < rand.length; j++) {
                Unknown_Word = Unknown_Word + "* ";
            }
            gameObject = new HangmanGameModel(Language_Letters_Pressed[i], 5, Unknown_Word, rand, languageUsed[i], Language_Letters[i], gamesStarted.length);
            gamesStarted.push(gameObject);
        }
        gameView = new ClassicGameView(gameObject);
        // adds views to view manager myViewManager.views[0] = gameView , myViewManager.views.[1] = gameView2
        myViewManager.addView(gameView);
        // announces that the gameObject has been modified and renders the modifications.
        gameObject.modified = true;
        myViewManager.updateViews(gameObject);
        // the modifications have been viewed, game is no longer modified.
        //gameObject.modified = false;

    }

    HangmanController.prototype.turnAction = function (letterPlayed, gameObject) {
        if (gameObject.playTurn(letterPlayed) == 'The game has finished') {
            myViewManager.unlinkModels(gameObject);
            //update the results
            document.getElementById('gamesPlayed').value = gamesWon + gamesLost + ' jocuri';
            document.getElementById('gamesResults').value = gamesWon + ' - ' + gamesLost;
        }
        else myViewManager.updateViews(gameObject);
    }

//the only start line u need to make the magic H
    controller = new HangmanController();