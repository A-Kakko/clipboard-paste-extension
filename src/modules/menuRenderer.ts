/**
 * メニューレンダリングモジュール
 * コンテキストメニューの実際のDOM表示を管理します
 */
import * as contextMenuModule from './contextMenu';
import { ContextMenuItem } from './contextMenu';

// メニュー要素
let menuElement: HTMLElement | null = null;

/**
 * メニュー要素を初期化します
 */
export const initializeMenuElement = (): void => {
    // すでに存在する場合は削除
    if (menuElement) {
        document.body.removeChild(menuElement);
    }

    // メニュー要素を作成
    menuElement = document.createElement('div');
    menuElement.className = 'context-menu';
    document.body.appendChild(menuElement);

    // 状態変化監視
    setInterval(() => {
        const state = contextMenuModule.getState();

        if (state.isVisible && menuElement) {
            // メニューを表示
            menuElement.style.left = `${state.position.x}px`;
            menuElement.style.top = `${state.position.y}px`;
            menuElement.classList.add('visible');

            // メニュー項目を更新
            updateMenuItems(state.items);
        } else if (menuElement) {
            // メニューを非表示
            menuElement.classList.remove('visible');
        }
    }, 100);
};

/**
 * メニュー項目を更新します
 */
const updateMenuItems = (items: ContextMenuItem[]): void => {
    if (!menuElement) return;

    // メニューをクリア
    menuElement.innerHTML = '';

    // 項目がなければデフォルト項目を表示
    const displayItems = items.length > 0 ? items : [
        {
            id: 'paste',
            label: '貼り付け',
            action: () => {
                // クリップボードからテキストを取得して貼り付け
                navigator.clipboard.readText().then(text => {
                    const target = contextMenuModule.getState().targetElement;
                    if (target && (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
                        // 入力欄に貼り付け
                        target.value = target.value + text;
                    }
                });

                // メニューを閉じる
                contextMenuModule.hideMenu();
            }
        }
    ];

    // 項目を追加
    displayItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'context-menu-item';
        itemElement.textContent = item.label;
        itemElement.addEventListener('click', (e) => {
            e.stopPropagation();
            item.action();
        });

        menuElement?.appendChild(itemElement);
    });
};