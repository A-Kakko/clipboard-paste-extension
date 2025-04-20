// content/view.ts - コンテンツスクリプトのビュー
export class PasteView {
    constructor(defaultAppearanceSettings = {
        menuTheme: "light",
        menuPosition: "cursor",
    }) {
        this.defaultAppearanceSettings = defaultAppearanceSettings;
        this.menuElement = null;
        this.clickOutsideHandler = null;
    }
    // ペーストメニューを表示
    displayPasteMenu(clipboardText, position, appearance = this.defaultAppearanceSettings) {
        // 既存のメニューを削除
        this.removePasteMenu();
        // ペーストメニュー要素を作成
        const menu = document.createElement("div");
        menu.id = "clipboard-paste-menu";
        // テーマに基づくスタイル設定
        const themeStyle = this.getThemeStyle(appearance.menuTheme);
        menu.style.cssText = `
      position: fixed;
      left: ${position.x}px;
      top: ${position.y}px;
      background: ${themeStyle.background};
      color: ${themeStyle.color};
      border: ${themeStyle.border};
      border-radius: 4px;
      box-shadow: ${themeStyle.boxShadow};
      padding: 8px;
      z-index: 9999;
      font-family: sans-serif;
      font-size: 14px;
      cursor: pointer;
    `;
        // クリップボードの内容（長い場合は省略）
        const previewText = clipboardText.length > 30
            ? clipboardText.substring(0, 30) + "..."
            : clipboardText;
        menu.innerHTML = `貼り付け: "${previewText}"`;
        // ドキュメントにメニューを追加
        document.body.appendChild(menu);
        this.menuElement = menu;
    }
    // ペーストメニューを削除
    removePasteMenu() {
        if (this.menuElement) {
            this.menuElement.remove();
            this.menuElement = null;
        }
        // クリックイベントリスナーを削除
        if (this.clickOutsideHandler) {
            document.removeEventListener("click", this.clickOutsideHandler, true);
            this.clickOutsideHandler = null;
        }
    }
    // メニュー外クリックハンドラを設定
    setClickOutsideHandler(handler) {
        // 既存のハンドラを削除
        if (this.clickOutsideHandler) {
            document.removeEventListener("click", this.clickOutsideHandler, true);
        }
        this.clickOutsideHandler = handler;
        document.addEventListener("click", handler, true);
    }
    // メニューにクリックハンドラを設定
    setMenuClickHandler(handler) {
        if (this.menuElement) {
            this.menuElement.addEventListener("click", handler);
        }
    }
    // テーマスタイルを取得
    getThemeStyle(theme) {
        // システムテーマの場合はシステム設定に基づいてダークモードか判定
        if (theme === "system") {
            const isDarkMode = window.matchMedia &&
                window.matchMedia("(prefers-color-scheme: dark)").matches;
            theme = isDarkMode ? "dark" : "light";
        }
        if (theme === "dark") {
            return {
                background: "#333",
                color: "#fff",
                border: "1px solid #555",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            };
        }
        else {
            return {
                background: "#fff",
                color: "#333",
                border: "1px solid #ccc",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            };
        }
    }
}
//# sourceMappingURL=view.js.map