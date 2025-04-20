// services.ts - サービス実装

import {
  ClipboardService,
  StorageService,
  MessagingService,
  ContentMessage,
  BackgroundMessage,
  ExtensionSettings,
} from "./types";

// クリップボードサービス実装
export class ChromeClipboardService implements ClipboardService {
  async readText(): Promise<string> {
    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      console.error("クリップボードの読み取りに失敗しました:", error);
      return "";
    }
  }
}

// ストレージサービス実装
export class ChromeStorageService implements StorageService {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    return new Promise((resolve) => {
      chrome.storage.sync.get({ [key]: defaultValue }, (result) => {
        resolve(result[key] as T);
      });
    });
  }

  async set<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [key]: value }, () => {
        resolve();
      });
    });
  }

  async getAll<T>(defaultValues: T): Promise<T> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(defaultValues as any, (result) => {
      resolve(result as T);
    });
  });
}
}

// バックグラウンドメッセージングサービス実装
export class BackgroundMessagingService implements MessagingService {
  async sendMessageToTab(
    tabId: number,
    message: ContentMessage
  ): Promise<void> {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, message, () => {
        resolve();
      });
    });
  }

  async sendMessageToBackground(message: BackgroundMessage): Promise<void> {
    // バックグラウンドスクリプト内部では使用しない
    throw new Error("Background script cannot send messages to itself");
  }

  addListener<T, R>(
    callback: (message: T, sender: any) => R | Promise<R>
  ): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const result = callback(message, sender);
      if (result instanceof Promise) {
        // Promiseの場合は非同期処理
        result.then(sendResponse);
        return true; // 非同期応答を示すためにtrueを返す
      } else {
        // 同期処理の場合
        sendResponse(result);
        return false;
      }
    });
  }
}

// コンテンツスクリプトメッセージングサービス実装
export class ContentMessagingService implements MessagingService {
  async sendMessageToTab(
    tabId: number,
    message: ContentMessage
  ): Promise<void> {
    // コンテンツスクリプト内部では使用しない
    throw new Error("Content script cannot send messages to tabs");
  }

  async sendMessageToBackground(message: BackgroundMessage): Promise<void> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, () => {
        resolve();
      });
    });
  }

  addListener<T, R>(
    callback: (message: T, sender: any) => R | Promise<R>
  ): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const result = callback(message, sender);
      if (result instanceof Promise) {
        // Promiseの場合は非同期処理
        result.then(sendResponse);
        return true; // 非同期応答を示すためにtrueを返す
      } else {
        // 同期処理の場合
        sendResponse(result);
        return false;
      }
    });
  }
}
;
