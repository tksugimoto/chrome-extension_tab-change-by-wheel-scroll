"use strict";

const Buttons = {
	Right: 2
};
let rightButtonPressing = false;
let tabMoving = false;
const useCapture = true;

const onmousedown = evt => {
	rightButtonPressing = evt.button === Buttons.Right;
	chrome.runtime.sendMessage({
		"key": "rightButtonMouseDownStateChanged",
		"value": rightButtonPressing
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
		tabMoving = false;
		evt.preventDefault();
	}
	rightButtonPressing = false;
	chrome.runtime.sendMessage({
		"key": "rightButtonMouseDownStateChanged",
		"value": rightButtonPressing
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
