/**
 * clipboard.ts モジュールのテスト
 */
import * as clipboardModule from '../clipboard';

// モックの準備
const mockReadText = jest.fn();
Object.defineProperty(navigator, 'clipboard', {
    value: {
        readText: mockReadText
    },
    configurable: true
});

// テストの前にタイマーをモック化
jest.useFakeTimers();

describe('Clipboard Monitor Module', () => {
    beforeEach(() => {
        // 各テストの前に状態をリセットしてモックをクリア
        clipboardModule.resetState();
        jest.clearAllMocks();
        mockReadText.mockClear();
    });

    test('初期状態の確認', () => {
        const state = clipboardModule.getState();
        expect(state.isMonitoring).toBe(false);
        expect(state.lastText).toBe('');
        expect(state.listeners.length).toBe(0);
        expect(state.intervalId).toBeNull();
    });

    test('監視の開始と停止', () => {
        // 監視開始
        clipboardModule.startMonitoring();

        let state = clipboardModule.getState();
        expect(state.isMonitoring).toBe(true);
        expect(state.intervalId).not.toBeNull();

        // 監視停止
        clipboardModule.stopMonitoring();

        state = clipboardModule.getState();
        expect(state.isMonitoring).toBe(false);
        expect(state.intervalId).toBeNull();
    });

    test('リスナーの追加と削除', () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();

        // リスナー追加
        clipboardModule.addChangeListener(listener1);
        clipboardModule.addChangeListener(listener2);

        let state = clipboardModule.getState();
        expect(state.listeners.length).toBe(2);

        // リスナー削除
        clipboardModule.removeChangeListener(listener1);

        state = clipboardModule.getState();
        expect(state.listeners.length).toBe(1);
    });

    test('チェック間隔の設定', () => {
        // 初期間隔の確認
        let state = clipboardModule.getState();
        expect(state.checkInterval).toBe(1000); // デフォルト値

        // 間隔を変更
        clipboardModule.setCheckInterval(2000);

        state = clipboardModule.getState();
        expect(state.checkInterval).toBe(2000);
    });

    test('クリップボード内容の変更検出と通知', async () => {
        const listener = jest.fn();
        clipboardModule.addChangeListener(listener);

        // mockReadTextが「こんにちは」を返すよう設定
        mockReadText.mockResolvedValueOnce('こんにちは');

        // 監視開始
        clipboardModule.startMonitoring();

        // タイマーを進める
        jest.advanceTimersByTime(1000);

        // 非同期処理を待つ
        await Promise.resolve();

        // リスナーが呼び出されたか確認
        expect(listener).toHaveBeenCalledWith('こんにちは');

        // 状態の確認
        const state = clipboardModule.getState();
        expect(state.lastText).toBe('こんにちは');
    });

    test('同じ内容の場合は通知しない', async () => {
        const listener = jest.fn();
        clipboardModule.addChangeListener(listener);

        // 最初に「こんにちは」を設定
        mockReadText.mockResolvedValueOnce('こんにちは');

        // 監視開始
        clipboardModule.startMonitoring();

        // タイマーを進める
        jest.advanceTimersByTime(1000);

        // 非同期処理を待つ
        await Promise.resolve();

        // 次も同じ「こんにちは」を返す
        mockReadText.mockResolvedValueOnce('こんにちは');

        // もう一度タイマーを進める
        jest.advanceTimersByTime(1000);

        // 非同期処理を待つ
        await Promise.resolve();

        // リスナーは1回だけ呼び出されるはず
        expect(listener).toHaveBeenCalledTimes(1);
    });
});