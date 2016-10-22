"use strict";

const Buttons = {
	Right: 2
};
let rightButtonPressing = false;
let tabMoving = false;
const useCapture = true;

const onmousedown = evt => {
	chrome.runtime.sendMessage({
		"key": "rightButtonMouseDownStateChanged",
		"value": evt.button === Buttons.Right
	});
};
document.addEventListener("mousedown", onmousedown, useCapture);

const onwheel = evt => {
	const wheelBearing = Math.sign(evt.wheelDelta);
	if (rightButtonPressing) {
		chrome.runtime.sendMessage({
			"key": "changeTab",
			"wheelBearing": wheelBearing
		});
		evt.preventDefault();
	}
};
document.addEventListener("wheel", onwheel, useCapture);

const oncontextmenu = evt => {
	if (tabMoving) {
		evt.preventDefault();
	}
	chrome.runtime.sendMessage({
		"key": "rightButtonMouseDownStateChanged",
		"value": false
	});
};
document.addEventListener("contextmenu", oncontextmenu, useCapture);


const onMessageFunctions = {
	"tabChanged": () => {
		tabMoving = true;
	},
	"rightButtonMouseDownStateChanged": ({value}) => {
		rightButtonPressing = value;
		if (!value) {
			tabMoving = false;
		}
	}
};

chrome.runtime.onMessage.addListener((message, sender) => {
	const func = onMessageFunctions[message.key];
	if (func) func(message, sender);
});
