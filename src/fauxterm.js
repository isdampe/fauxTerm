/**
 * fauxTerm
 * A lightweight, faux, terminal-like emulator
 * Give the impression of a terminal interface without running any real shell.
 * @package fauxterm
 * @version 0.0.1
 * @author https://github.com/isdampe
 * @license MIT
 */
function fauxTerm(config) {

	var term = config.el || document.getElementById('term');
	var termBuffer = config.initialMessage || '';
	var lineBuffer = config.initialLine || '';
	var cwd = config.cwd || "~/";
	var tags = config.tags || ['red', 'blue', 'white', 'bold'];
	var processCommand = config.cmd || false;
	var maxBufferLength = config.maxBufferLength || 8192;
	var commandHistory = [];
	var currentCommandIndex = -1;
	var maxCommandHistory = config.maxCommandHistory || 100;
	var autoFocus = config.autoFocus || false;
	var fauxInput;
	var coreCmds = {
		"clear": clear
	};

	function init() {

		term.classList.add('fauxterm');
		fauxInput = document.createElement('textarea');
		fauxInput.className = "fauxterm-input";
		document.body.appendChild(fauxInput);

		term.addEventListener('click', function(e){
			fauxInput.focus();
			term.classList.add('fauxterm-focus');
		});
		fauxInput.addEventListener('keydown', acceptInput);
		fauxInput.addEventListener('blur', function(e){
			term.classList.remove('fauxterm-focus');
		});

		if ( autoFocus ) {
			fauxInput.focus();
			term.classList.add('fauxterm-focus');
		}

		renderTerm();

	}

	function getLeader() {
		return cwd + "$ ";
	}

	function renderTerm() {
		var bell = '<span class="fauxterm-bell"></span>';
		var ob = termBuffer + getLeader() + lineBuffer;
		term.innerHTML = ob;
		term.innerHTML += bell;
		term.scrollTop = term.scrollHeight;
	}

	function writeToBuffer(str) {
		termBuffer += str;

		//Stop the buffer getting massive.
		if ( termBuffer.length > maxBufferLength ) {
			var diff = termBuffer.length - maxBufferLength;
			termBuffer = termBuffer.substr(diff);
		}

	}

	function renderStdOut(str) {
		var i = 0, max = tags.length;
		for ( i; i<max; i++ ) {
			var start = new RegExp('{' + tags[i] + '}', 'g');
			var end = new RegExp('{/' + tags[i] + '}', 'g');
			str = str.replace(start, '<span class="' + tags[i] + '">');
			str = str.replace(end, '</span>');
		}
		return str;
	}

	function clear(argv, argc) {
		termBuffer = "";
		return "";
	}

	function isCoreCommand(line) {
		if ( coreCmds.hasOwnProperty(line) ) {
			return true;
		}
		return false;
	}

	function coreCommand(argv, argc) {

		var cmd = argv[0];
		return coreCmds[cmd](argv, argc);

	}

	function processLine() {

		//Dispatch command
		var stdout, line = lineBuffer, argv = line.split(" "), argc = argv.length;

		var cmd = argv[0];

		lineBuffer += "\n";
		writeToBuffer( getLeader() + lineBuffer );
		lineBuffer = "";

		//If it's not a blank line.
		if ( cmd !== "" ) {

			//If the command is not registered by the core.
			if ( !isCoreCommand(cmd) ) {

				//User registered command
				if ( processCommand ) {
					stdout = processCommand(argv,argc);
				} else {
					stdout = "{white}{bold}" + cmd + "{/bold}{/white}: command not found\n";
				}
			} else {
				//Execute a core command
				stdout = coreCommand(argv,argc);
			}

			//If an actual command happened.
			if ( stdout === false ) {
				stdout = "{white}{bold}" + cmd + "{/bold}{/white}: command not found\n";
			}

			stdout = renderStdOut(stdout);
			writeToBuffer(stdout);

			addLineToHistory(line);

		}

		renderTerm();
	}

	function addLineToHistory(line) {
		commandHistory.unshift( line );
		currentCommandIndex = -1;
		if ( commandHistory.length > maxCommandHistory ) {
			console.log('reducing command history size');
			console.log(commandHistory.length);
			var diff = commandHistory.length - maxCommandHistory;
			commandHistory.splice(commandHistory.length -1, diff);
			console.log(commandHistory.length);
		}
	}

	function isInputKey(keyCode) {
		var inputKeyMap = [32,190,192,189,187,220,221,219,222,186,188,191];
		if ( inputKeyMap.indexOf(keyCode) > -1 ) {
			return true;
		}
		return false;
	}

	function toggleCommandHistory(direction) {

		var max = commandHistory.length -1;
		var newIndex = currentCommandIndex + direction;

		if ( newIndex < -1 ) newIndex = -1;
		if ( newIndex >= commandHistory.length) newIndex = commandHistory.length -1;

		if ( newIndex !== currentCommandIndex ) {
			currentCommandIndex = newIndex;
		}

		if ( newIndex > -1 ) {
			//Change line to something from history.
			lineBuffer = commandHistory[newIndex];
		} else {
			//Blank line...
			lineBuffer = "";
		}


	}

	function acceptInput(e) {
		e.preventDefault();
		fauxInput.value = "";

		if ( e.keyCode >= 48 && e.keyCode <= 90 || isInputKey(e.keyCode) ) {
			if (! e.ctrlKey ) {
				//Character input
				lineBuffer += e.key;
			} else {
				//Hot key input? I.e Ctrl+C
			}
		} else if ( e.keyCode === 13 ) {
			processLine();
		} else if ( e.keyCode === 9 ) {
			lineBuffer += "\t";
		} else if ( e.keyCode === 38 ) {
			toggleCommandHistory(1);
		} else if ( e.keyCode === 40 ) {
			toggleCommandHistory(-1);
		}
		else if ( e.key === "Backspace" ) {
			lineBuffer = lineBuffer.substr(0, lineBuffer.length -1);
		}

		renderTerm();
	}

	init();

}
