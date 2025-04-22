/**
 * バックグラウンド処理スクリプト
 * 拡張機能のバックグラウンドで動作する処理を管理します
 */

// クリップボードモジュールをインポート
import * as clipboardModule from './modules/clipboard';

// 拡張機能が読み込まれたときに実行
chrome.runtime.onInstalled.addListener(() => {
    console.log('クリップボード貼り付けメニュー拡張機能がインストールされました');

    // クリップボード監視を開始
    clipboardModule.startMonitoring();
});

// バックグラウンドスクリプトが起動したときにも監視を開始
clipboardModule.startMonitoring();