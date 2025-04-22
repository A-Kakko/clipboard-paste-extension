/**
 * contextMenu.ts モジュールのテスト
 */
import * as contextMenuModule from '../contextMenu';

// DOMテスト用の要素
let testInput: HTMLInputElement;
let testTextarea: HTMLTextAreaElement;

describe('Context Menu Module', () => {
    beforeEach(() => {
        // テスト前に状態をリセット
        contextMenuModule.resetState();

        // テスト用のDOM要素を作成
        document.body.innerHTML = '';
        testInput = document.createElement('input');
        testInput.type = 'text';
        testTextarea = document.createElement('textarea');

        document.body.appendChild(testInput);
        document.body.appendChild(testTextarea);
    });

    test('初期状態ではメニューは非表示', () => {
        const state = contextMenuModule.getState();
        expect(state.isVisible).toBe(false);
    });

    test('テキスト欄クリック時にメニューが表示される', () => {
        // テキスト欄のクリックイベントを設定
        contextMenuModule.setupTextFieldListeners();

        // クリックイベントをシミュレート
        testInput.click();

        // メニューが表示されたか確認
        const state = contextMenuModule.getState();
        expect(state.isVisible).toBe(true);
        expect(state.targetElement).toBe(testInput);
    });

    test('テキスト欄外クリックでメニューが非表示になる', () => {
        // まずメニューを表示状態にする
        contextMenuModule.showMenu(testInput, 100, 100);

        // ドキュメント全体のクリックをシミュレート
        document.body.click();

        // メニューが非表示になったか確認
        const state = contextMenuModule.getState();
        expect(state.isVisible).toBe(false);
    });

    test('複数のテキスト欄でメニューが表示される', () => {
        contextMenuModule.setupTextFieldListeners();

        // input要素でクリック
        testInput.click();
        expect(contextMenuModule.getState().isVisible).toBe(true);
        expect(contextMenuModule.getState().targetElement).toBe(testInput);

        // メニューを一度閉じる
        document.body.click();

        // textarea要素でクリック
        testTextarea.click();
        expect(contextMenuModule.getState().isVisible).toBe(true);
        expect(contextMenuModule.getState().targetElement).toBe(testTextarea);
    });
});