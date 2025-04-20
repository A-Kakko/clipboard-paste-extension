// services.ts - サービス実装
// クリップボードサービス実装
export class ChromeClipboardService {
    async readText() {
        try {
            return await navigator.clipboard.readText();
        }
        catch (error) {
            console.error("クリップボードの読み取りに失敗しました:", error);
            return "";
        }
    }
}
// ストレージサービス実装
export class ChromeStorageService {
    async get(key, defaultValue) {
        return new Promise((resolve) => {
            chrome.storage.sync.get({ [key]: defaultValue }, (result) => {
                resolve(result[key]);
            });
        });
    }
    async set(key, value) {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ [key]: value }, () => {
                resolve();
            });
        });
    }
    async getAll(defaultValues) {
        return new Promise((resolve) => {
            chrome.storage.sync.get(defaultValues, (result) => {
                resolve(result);
            });
        });
    }
}
// バックグラウンドメッセージングサービス実装
export class BackgroundMessagingService {
    async sendMessageToTab(tabId, message) {
        return new Promise((resolve) => {
            chrome.tabs.sendMessage(tabId, message, () => {
                resolve();
            });
        });
    }
    async sendMessageToBackground(message) {
        // バックグラウンドスクリプト内部では使用しない
        throw new Error("Background script cannot send messages to itself");
    }
    addListener(callback) {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            const result = callback(message, sender);
            if (result instanceof Promise) {
                // Promiseの場合は非同期処理
                result.then(sendResponse);
                return true; // 非同期応答を示すためにtrueを返す
            }
            else {
                // 同期処理の場合
                sendResponse(result);
                return false;
            }
        });
    }
}
// コンテンツスクリプトメッセージングサービス実装
export class ContentMessagingService {
    async sendMessageToTab(tabId, message) {
        // コンテンツスクリプト内部では使用しない
        throw new Error("Content script cannot send messages to tabs");
    }
    async sendMessageToBackground(message) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(message, () => {
                resolve();
            });
        });
    }
    addListener(callback) {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            const result = callback(message, sender);
            if (result instanceof Promise) {
                // Promiseの場合は非同期処理
                result.then(sendResponse);
                return true; // 非同期応答を示すためにtrueを返す
            }
            else {
                // 同期処理の場合
                sendResponse(result);
                return false;
            }
        });
    }
}
;
//# sourceMappingURL=services.js.map