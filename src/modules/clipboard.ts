/**
 * クリップボード監視モジュール（関数型アプローチ）
 * クリップボードのテキスト内容を監視するための機能を提供します
 */

// 型定義
export type ClipboardChangeListener = (text: string) => void;

export type ClipboardMonitorState = {
    listeners: ClipboardChangeListener[];
    isMonitoring: boolean;
    lastText: string;
    checkInterval: number;
    intervalId: number | null;
};

// 初期状態
const initialState: ClipboardMonitorState = {
    listeners: [],
    isMonitoring: false,
    lastText: '',
    checkInterval: 1000, // 1秒ごとにチェック
    intervalId: null
};

// モニター状態を格納する変数（プライベート）
let monitorState: ClipboardMonitorState = { ...initialState };

/**
 * クリップボードの監視を開始します
 */
export const startMonitoring = (): void => {
    if (monitorState.isMonitoring) return;

    monitorState = {
        ...monitorState,
        isMonitoring: true,
        intervalId: window.setInterval(() => {
            checkClipboard();
        }, monitorState.checkInterval)
    };
};

/**
 * クリップボードの監視を停止します
 */
export const stopMonitoring = (): void => {
    if (!monitorState.isMonitoring || monitorState.intervalId === null) return;

    window.clearInterval(monitorState.intervalId);
    monitorState = {
        ...monitorState,
        isMonitoring: false,
        intervalId: null
    };
};

/**
 * クリップボードの内容をチェックします
 */
const checkClipboard = async (): Promise<void> => {
    try {
        // クリップボードのテキストを読み取る（Chromeでは非同期API）
        const text = await navigator.clipboard.readText();

        // 前回と同じテキストなら何もしない
        if (text === monitorState.lastText || text === '') return;

        // 新しいテキストを保存して、リスナーに通知
        monitorState = {
            ...monitorState,
            lastText: text
        };

        notifyListeners(text);
    } catch (error) {
        console.error('クリップボードの読み取りに失敗しました:', error);
    }
};

/**
 * すべてのリスナーに通知します
 */
const notifyListeners = (text: string): void => {
    monitorState.listeners.forEach(listener => listener(text));
};

/**
 * クリップボード変更リスナーを追加します
 */
export const addChangeListener = (listener: ClipboardChangeListener): void => {
    monitorState = {
        ...monitorState,
        listeners: [...monitorState.listeners, listener]
    };
};

/**
 * クリップボード変更リスナーを削除します
 */
export const removeChangeListener = (listener: ClipboardChangeListener): void => {
    monitorState = {
        ...monitorState,
        listeners: monitorState.listeners.filter(l => l !== listener)
    };
};

/**
 * チェック間隔を設定します（ミリ秒単位）
 */
export const setCheckInterval = (interval: number): void => {
    monitorState = {
        ...monitorState,
        checkInterval: interval
    };

    // 既に監視中なら一度停止して再開
    if (monitorState.isMonitoring) {
        stopMonitoring();
        startMonitoring();
    }
};

/**
 * 現在の状態を取得します（主にテスト用）
 */
export const getState = (): Readonly<ClipboardMonitorState> => {
    return { ...monitorState };
};

/**
 * 状態をリセットします（主にテスト用）
 */
export const resetState = (): void => {
    if (monitorState.isMonitoring) {
        stopMonitoring();
    }
    monitorState = { ...initialState };
};