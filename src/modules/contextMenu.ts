/**
 * コンテキストメニュー管理モジュール（関数型アプローチ）
 * テキスト欄クリック時に表示されるメニューを管理します
 */

// 型定義
export type ContextMenuItem = {
    id: string;
    label: string;
    action: () => void;
};

export type ContextMenuState = {
    isVisible: boolean;
    position: { x: number; y: number };
    targetElement: HTMLElement | null;
    items: ContextMenuItem[];
};

// 初期状態
const initialState: ContextMenuState = {
    isVisible: false,
    position: { x: 0, y: 0 },
    targetElement: null,
    items: []
};

// メニュー状態を格納する変数（プライベート）
let menuState: ContextMenuState = { ...initialState };

/**
 * メニューを表示します
 */
export const showMenu = (element: HTMLElement, x: number, y: number): void => {
    menuState = {
        ...menuState,
        isVisible: true,
        position: { x, y },
        targetElement: element
    };
};

/**
 * メニューを非表示にします
 */
export const hideMenu = (): void => {
    menuState = {
        ...menuState,
        isVisible: false
    };
};

/**
 * メニュー項目を設定します
 */
export const setMenuItems = (items: ContextMenuItem[]): void => {
    menuState = {
        ...menuState,
        items
    };
};

/**
 * テキスト欄のクリックイベントをセットアップします
 */
export const setupTextFieldListeners = (): void => {
    // テキスト入力欄とテキストエリアを取得
    const textInputs = document.querySelectorAll('input[type="text"], textarea');

    // 各テキスト欄にクリックイベントリスナーを追加
    textInputs.forEach(element => {
        element.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            const rect = target.getBoundingClientRect();

            // クリックされた位置の近くにメニューを表示
            showMenu(target, rect.left, rect.bottom);

            // イベントの伝播を停止（これがないとすぐにドキュメントクリックが発生する）
            event.stopPropagation();
        });
    });

    // ドキュメント全体のクリックでメニューを閉じる
    document.addEventListener('click', () => {
        if (menuState.isVisible) {
            hideMenu();
        }
    });
};

/**
 * 現在の状態を取得します（主にテスト用）
 */
export const getState = (): Readonly<ContextMenuState> => {
    return { ...menuState };
};

/**
 * 状態をリセットします（主にテスト用）
 */
export const resetState = (): void => {
    menuState = { ...initialState };
};