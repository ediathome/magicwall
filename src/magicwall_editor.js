/*global document, window, console, jQuery, alert, $, MAGICWALL, FileReader, Dropbox */

MAGICWALL.namespace('MAGICWALL.Editor');
MAGICWALL.Editor = MAGICWALL.BaseObject.extend({
	_construct : function () {
		"use strict";
		this.init();
	},

	init : function () {
		"use strict";
		this.initUI();
		(this.getShowMenuFunction())();
	},

	initUI : function () {
		"use strict";
		var $tmpdiv;

		// create overlay window
		this.$overlay = $('<div id="overlay"></div>');

		// create the questions field
		this.$questionsField = $('<div id="questionsField"></div>');


		// Prepare the push display
		this.$pushDisplay = $('<div id="pushDisplay">Push Display</div>');

		// Prepare menubar top right container for buttons
		this.$menuBar = $('<div id="menuBar"></div>');
		// Prepare menu
		this.$menu = $('<div id="menu"></div>');
		this.$menuButton = $('<a href="#" id="menuButton"><img src="img/menu.png" /></a>');
		this.$menuButton.click(this.getShowMenuFunction());

		// add the fullscreen button
		this.$fullscreenButton = $('<a href="#" id="fullscreenButton"><img src="img/fullscreenbutton.png" /></a>');
		this.$fullscreenButton.click(this.toggleFullScreen);

		this.$punishButton = $('<a href="#" id="punishButton"><img src="img/punishbutton.png" /></a>');
		this.$punishButton.click(this.getPunishFunction());

		// add stuff to menu bar
		this.$menuBar.append(this.$punishButton);
		this.$menuBar.append(this.$menuButton);
		this.$menuBar.append(this.$fullscreenButton);

		// Init the file input
		this.$fileInput = $('<input type="file" id="files" name="files[]" />');
		this.$fileInput.change(this.getHandleFileSelect());

		// add the Load from Dropbox button
		this.$dbchooserButton = $('<div id="dbchooserButton">Fragen von Dropbox laden</div>');
		// add an event listener to a Chooser button
	    this.$dbchooserButton.click(this.getDBChooseHandler());

		// add stuff to menu
		$tmpdiv = $('<div><label for="files">Fragen aus Textdatei laden</label></div>');
		$tmpdiv.append(this.$fileInput);
		this.$menu.append($tmpdiv);
		this.$menu.append(this.$dbchooserButton);

		// Init the score counters
		this.$scoreDiv = $('<div id="scoreCounters"></div>');

		// add stuff to body element
		$('body').append(this.$menuBar);
		$('body').append(this.$questionsField);
		$('body').append(this.$scoreDiv);
		$('body').append(this.$overlay);
	},
	initGame : function () {
		"use strict";
		var rows = 5, i = 1, j = 0, $tmpButton, $tmpdiv;
		this.score_counter = [0, 0, 0, 0, 0];
		this.turn_group = 0;
		this.question_push = 0;
		this.group_number = 5;
		this.question_push = {
			startGroup : 0,
			stepsPushed : 0,
			currentGroup : 0
		};
		for (rows = 5; i <= rows; i = i + 1) {
			$tmpdiv = $('<div></div>');
			for (j = 0; j < 5; j = j + 1) {
				$tmpButton = this.getQuestionField(i * 100, j);
				$tmpdiv.append($tmpButton);
			}
			this.$questionsField.append($tmpdiv);
		}
		this.updateScoreDisplay();
	},
	nextTurn : function () {
		"use strict";
		this.closeModalWindow();
		this.turn_group = this.nextGroup(this.turn_group);
		this.question_push = {
			startGroup : this.turn_group,
			stepsPushed : 0,
			currentGroup : this.turn_group
		};
		this.showGroupTurn();
	},
	showGroupTurn : function () {
		"use strict";
		this.$scoreDiv.find('div span').css('color', 'white');
		this.$scoreDiv.find('div span:nth-child(' + (this.turn_group + 1) + ')').css('color', 'red');
	},
	nextGroup : function (groupcounter) {
		"use strict";
		if (groupcounter < this.group_number - 1) {
			groupcounter = groupcounter + 1;
		} else {
			groupcounter = 0;
		}
		return groupcounter;
	},
	pushQuestion : function () {
		"use strict";
		var status = false;
		if (this.question_push.stepsPushed < (this.group_number - 1)) {
			this.question_push.stepsPushed = this.question_push.stepsPushed + 1;
			this.question_push.currentGroup = this.nextGroup(this.question_push.currentGroup);
			this.$pushDisplay.html('Group ' + (this.question_push.currentGroup + 1));
			status = true;
		}
		return status;
	},
	addScore : function (amount, group) {
		"use strict";
		this.score_counter[group] = Number(this.score_counter[group]) + Number(amount);
		this.updateScoreDisplay();
	},
	getPunishFunction : function () {
		"use strict";
		var editor = this;
		return function () {
			var $tmpContainer, $submitButton, $punishSelect, $punishAmountInput, i, $questionField;

			$questionField = $('<div class="questionTextField"></div>');
			$questionField.append($('<h2 class="punish">Strafe</h2>'));
			$punishAmountInput = $('<input type="number" id="punishAmountInput" name="punishAmountInput" value="100"/>');
			$punishSelect = $('<select id="punishSelect"></select>');
			for (i = 0; i < editor.group_number; i = i + 1) {
				$punishSelect.append($('<option value="' + i + '">Gruppe ' + (i + 1) + '</option>'));
			}
			$submitButton = $('<input type="submit" value="Ok" />');
			$submitButton.click(function () {
				var groupid = $('#punishSelect').val();
				console.log('punish amount: ' + ($('#punishAmountInput').val() * -1));
				editor.addScore($('#punishAmountInput').val() * -1, groupid);
			});

			$tmpContainer = $('<div></div>');
			$tmpContainer.append($punishAmountInput);
			$tmpContainer.append($punishSelect);
			$tmpContainer.append($submitButton);
			$questionField.append($tmpContainer);
			editor.openModalWindow($questionField);
		};
	},
	updateScoreDisplay : function () {
		"use strict";
		var $tmpdiv, $tmpspan, i = 0;
		$tmpdiv = $('<div></div>');
		for (i = 0; i < this.group_number; i = i + 1) {
			$tmpspan = $('<span id="scoreCounter' + i + '">' + this.padScore(this.score_counter[i]) + '</span>');
			$tmpdiv.append($tmpspan);
		}
		this.$scoreDiv.empty();
		this.$scoreDiv.append($tmpdiv);
		this.showGroupTurn();
	},
	padScore : function (num) {
		"use strict";
		var s = "000" + num;
		return s.substr(s.length - 4);
	},
	getQuestionField: function (amount, qindex) {
		"use strict";
		var button;
		button = $('<a class="questionButton">' + amount + '</a>');
		button.click(this.getShowQuestionFunction(amount, qindex));
		return button;
	},

	getShowQuestionFunction: function (amount, qindex) {
		"use strict";
		var editor = this;
		return function () {
			var $questionField, $questionText, $questionAmount, $rightButton, $wrongButton, $solutionText, questionObject;
			questionObject = editor.questionsContainer[amount][qindex];
			$(this).addClass(' clicked');

			$questionField = $('<div class="questionTextField"></div>');
			$questionAmount = $('<h2>' + questionObject.amount + '</h2>');
			$questionText = $('<div>' + questionObject.questionText + '</div>');
			$solutionText = $('<div class="solution" id="solutionText">???</div>');
			$solutionText.click(function () {
			    $(this).fadeOut(400, function () {
					$(this).text(questionObject.solution).fadeIn(400);
				});
			});
			$rightButton = $('<a href="#" class="right"><span>Richtig</span></a>');
			$rightButton.click(editor.getCorrectAnswerHandlerFunction(questionObject));
			$wrongButton = $('<a href="#" class="false"><span>Falsch</span></a>');
			$wrongButton.click(editor.getWrongAnswerHandlerFunction($solutionText));
			// add the ui stuff
			$questionField.append($questionAmount);
			editor.$pushDisplay.html('Group ' + (editor.question_push.currentGroup + 1));
			$questionAmount.append(editor.$pushDisplay);
			$questionField.append($questionText);
			$questionField.append($solutionText);
			$questionField.append($rightButton);
			$questionField.append($wrongButton);
			editor.openModalWindow($questionField);
		};
	},

	getShowMenuFunction: function () {
		"use strict";
		var editor = this;
		return function () {
			editor.openModalWindow(editor.$menu);
		};
	},

	openModalWindow : function (content) {
		"use strict";
		var modalWindow, closeButton;
		closeButton = $('<img src="img/closebutton.png" class="modalCloseButton">').click(this.closeModalWindow);
		modalWindow = $('<div class="modalWindow"></div>');
		modalWindow.append(closeButton);
		modalWindow.append(content);
		// Show the ovleray layer and append the modal window
		$('#overlay').append(modalWindow);
		$('#overlay').append($('<div style="clear: both;"></div>'));
		$('#overlay').fadeIn();
	},
	closeModalWindow : function () {
		"use strict";
		if ($('#overlay').is(":visible")) {
			$('#overlay').hide().empty();
		}
	},

	toggleFullScreen : function () {
		"use strict";
		if (MAGICWALL.editor.fullscreenEnabled) {
			MAGICWALL.editor.exitFullscreen();
		} else {
			MAGICWALL.editor.startFullScreen();
		}
		MAGICWALL.editor.closeModalWindow();
	},

	getCorrectAnswerHandlerFunction : function (questionObject) {
		"use strict";
		var editor = this;
		return function () {
			editor.addScore(questionObject.amount, editor.question_push.currentGroup);
			editor.nextTurn();
		};
	},
	getWrongAnswerHandlerFunction : function ($solutionText) {
		"use strict";
		var editor = this;
		return function () {
			var status = false;
			if (editor.pushQuestion()) {
				status = true;
			} else {
				$solutionText.trigger();
			}
		};
	},
	startFullScreen : function () {
		"use strict";
		var element = document.getElementsByTagName("body")[0];

		if (element.requestFullScreen) {
			element.requestFullScreen();
		} else if (element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if (element.webkitRequestFullScreen) {
			element.webkitRequestFullScreen();
		}
		MAGICWALL.editor.fullscreenEnabled = true;
	},

	exitFullscreen : function () {
		"use strict";
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.mozExitFullScreen) {
			document.mozExitFullScreen();
		} else if (document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		}
		MAGICWALL.editor.fullscreenEnabled = false;
	},
    getHandleFileSelect : function () {
		"use strict";
		var editor = this;
		return function () {
			var files = this.files, reader;

			// files is a FileList of File objects. List some properties.
			reader = new FileReader();
			reader.onload = function () {
				var text = reader.result;
				try {
					editor.parseQuestions(text);
				} catch (variable) {
					console.log('error reading the file ' + variable);
				} finally {
					console.log('success reading the file');
					editor.closeModalWindow();
					editor.initGame();
				}
			};
			reader.readAsText(files[0], "UTF-8");
		};
	},
	getDBChooseHandler : function () {
		"use strict";
		var editor = this;
		return function () {
			var options;
			options = {
			    success : function (files) {
					alert('success!');
			        $.get(files[0].link, function (data) {
						editor.parseQuestions(data);
					});
					editor.closeModalWindow();
					editor.initGame();
			    },
			    multiselect : false,
			    extensions : ['.txt']
			};
			Dropbox.choose(options);
		};
	},
	parseQuestions : function (questionsString) {
		"use strict";
		var lineArray = [],
			tmpQuestionArray = [],
			questionsContainer = {
				100 : [],
				200 : [],
				300 : [],
				400 : [],
				500 : []
			},
			i = 0,
			tmpQuestionObject;
		lineArray = questionsString.split(/\n/);
		for (i = 0; i < lineArray.length; i = i + 1) {
			if (lineArray[i].replace(/\s/g, '').length) {
				tmpQuestionArray = lineArray[i].split(/;/);
				this.assert(tmpQuestionArray.length === 3, "tmpArray does not have three values.");
				this.assert(this.isNumber(tmpQuestionArray[0]), "First value found is not a numeric string.");
				tmpQuestionObject = {
					questionText : tmpQuestionArray[1],
					amount : tmpQuestionArray[0],
					solution : tmpQuestionArray[2]
				};
				questionsContainer[tmpQuestionArray[0]].push(tmpQuestionObject);
			}
		}
		this.questionsContainer = questionsContainer;
	},
	assert : function (condition, message) {
		"use strict";
	    if (!condition) {
	        throw message || "Assertion failed";
	    }
	},
	isNumber : function (n) {
		"use strict";
		return !isNaN(parseFloat(n)) && isFinite(n);
	}
});
