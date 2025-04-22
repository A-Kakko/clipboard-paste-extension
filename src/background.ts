/**
 * バックグラウンドスクリプト
 * 拡張機能の裏側で動作し、クリップボードの監視などを行います
 */

import * as clipboardMonitor from './modules/clipboard';

// 拡張機能の初期化処理
chrome.runtime.onInstalled.addListener(() => {
    console.log('クリップボード貼り付けメニュー拡張機能がインストールされました');

    // クリップボードの監視を開始
    clipboardMonitor.startMonitoring();

    // コンテキストメニューの作成
    chrome.contextMenus.create({
        id: 'pasteMenu',
        title: 'テキストを貼り付け',
        contexts: ['editable'],
        visible: false
    });
});

// クリップボードの変更を検知したら、コンテキストメニューを表示/非表示する
clipboardMonitor.addChangeListener((text) => {
    if (text) {
        // クリップボードにテキストがある場合、メニューを表示
        chrome.contextMenus.update('pasteMenu', { visible: true });
    } else {
        // クリップボードが空の場合、メニューを非表示
        chrome.contextMenus.update('pasteMenu', { visible: false });
    }
});

// コンテキストメニューがクリックされたときの処理
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'pasteMenu' && tab?.id) {
        // 現在のタブにクリップボードのテキストを挿入するスクリプトを実行
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                // ここでテキスト挿入の処理を行う
                // 注意: この実装はまだ不完全です
            }
        });
    }
});