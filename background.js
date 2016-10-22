"use strict";

chrome.runtime.onInstalled.addListener(() => {
	// 読み込み/更新時に既存のタブで実行する
	chrome.tabs.query({
		url: [
			"file:///*",
			"*://*/*"
		]
	}, tabs => {
		tabs.forEach(tab => {
			chrome.tabs.executeScript(tab.id, {
				file: "content_script.js",
				allFrames: true
			}, result => {
				if (typeof result === "undefined") {
					console.info("ページが読み込まれていません", tab);
				}
			});
		});
	});
});

const onMessageFunctions = {
	"rightButtonMouseDownStateChanged": ({value}, {tab: {windowId}}) => {
		chrome.windows.get(windowId, {
			populate: true
		}, ({tabs}) => {
			tabs.forEach(tab => {
				chrome.tabs.sendMessage(tab.id, {
					key: "rightButtonMouseDownStateChanged",
					value: value
				});
			});
		});
	},
	"changeTab": ({wheelBearing}, {tab:{windowId, id: currentTabId}}) => {
		chrome.windows.get(windowId, {
			populate: true
		}, ({tabs}) => {
			const tabIdList = tabs.filter(tab => {
				return tab.url && !tab.url.startsWith("https://chrome.google.com/webstore/");
			}).map(tab => tab.id);
			const currentTabIndex = tabIdList.indexOf(currentTabId);
			const numberOfTabs = tabIdList.length;
			const targetTabIndex = (currentTabIndex - wheelBearing + numberOfTabs) % numberOfTabs;
			const targetTabId = tabIdList[targetTabIndex];
			chrome.tabs.update(targetTabId, {
				active: true
			}, () => {
				tabIdList.forEach(tabId => {
					chrome.tabs.sendMessage(tabId, {
						key: "tabChanged"
					});
				})
			});
		});
	}
};

chrome.runtime.onMessage.addListener((message, sender) => {
	const func = onMessageFunctions[message.key];
	if (func) func(message, sender);
});
