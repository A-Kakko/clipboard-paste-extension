// content/controller.ts - コンテンツスクリプトのコントローラ
export class PasteController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }
    // 初期化処理
    init() {
        // クリックイベントリスナーを追加
        document.addEventListener("click", this.handleDocumentClick.bind(this));
        // メッセージリスナーを設定
        this.setupMessageListeners();
    }
    // メッセージリスナーのセットアップ
    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((request) => {
            if (request.action === "displayPasteMenu" &&
                request.clipboardText &&
                request.position) {
                // 設定情報を保存
                if (request.settings?.paste.enableClearOnClick !== undefined) {
                    this.model.updateClearOnClickSetting(request.settings.paste.enableClearOnClick);
                }
                // ペーストメニューを表示
                this.displayPasteMenu(request.clipboardText, request.position, request.settings);
            }
            else if (request.action === "autoPaste" && request.clipboardText) {
                // 自動貼り付け機能
                this.pasteText(request.clipboardText);
                // 設定情報を保存
                if (request.settings?.paste.enableClearOnClick !== undefined) {
                    this.model.updateClearOnClickSetting(request.settings.paste.enableClearOnClick);
                }
            }
            else if (request.action === "clearLastPasted") {
                // 最後に貼り付けたテキストを消去
                this.clearLastPastedText();
            }
            // 非同期処理なしの場合はfalseを返す
            return false;
        });
    }
    // ドキュメントクリックのハンドラ
    handleDocumentClick(event) {
        const target = event.target;
        // クリックされた要素がテキスト入力要素かどうかをチェック
        if (this.isTextInput(target)) {
            // テキスト入力要素がクリックされた場合、バックグラウンドスクリプトにメッセージを送信
            this.model.requestPasteMenu({
                x: event.clientX,
                y: event.clientY,
            });
        }
        else {
            // テキスト入力要素以外がクリックされた場合
            // ペーストメニューを非表示にする
            this.view.removePasteMenu();
            // テキスト欄外クリックで消去機能が有効で、直前に貼り付けたテキストがある場合
            if (this.model.isClearOnClickEnabled() &&
                this.model.getLastPastedText() &&
                this.model.getLastTargetElement()) {
                this.model.requestClearLastPasted();
            }
        }
    }
    // ペーストメニューを表示
    displayPasteMenu(clipboardText, position, settings) {
        // 外観設定を取得
        const appearance = settings?.appearance || {
            menuTheme: "light",
            menuPosition: "cursor",
        };
        // ビューでメニューを表示
        this.view.displayPasteMenu(clipboardText, position, appearance);
        // メニュークリックハンドラを設定
        this.view.setMenuClickHandler(() => {
            this.pasteText(clipboardText);
            this.view.removePasteMenu();
        });
        // メニュー外クリックハンドラを設定
        this.view.setClickOutsideHandler(this.handleClickOutside.bind(this));
    }
    // メニュー外クリックのハンドラ
    handleClickOutside(event) {
        const menuElement = document.getElementById("clipboard-paste-menu");
        const target = event.target;
        if (menuElement && !menuElement.contains(target)) {
            this.view.removePasteMenu();
        }
    }
    // テキストを貼り付ける
    pasteText(text) {
        const activeElement = document.activeElement;
        if (!activeElement)
            return;
        if (activeElement.isContentEditable) {
            // contentEditableな要素の場合
            document.execCommand("insertText", false, text);
        }
        else if (activeElement.tagName.toLowerCase() === "input" ||
            activeElement.tagName.toLowerCase() === "textarea") {
            const inputElement = activeElement;
            const start = inputElement.selectionStart || 0;
            const end = inputElement.selectionEnd || 0;
            const beforeText = inputElement.value.substring(0, start);
            const afterText = inputElement.value.substring(end);
            inputElement.value = beforeText + text + afterText;
            // カーソル位置を更新
            const newPosition = start + text.length;
            inputElement.setSelectionRange(newPosition, newPosition);
            // change イベントを発火（Reactなどのフレームワーク対応）
            const event = new Event("input", { bubbles: true });
            inputElement.dispatchEvent(event);
        }
        // 最後に貼り付けた内容を記録
        this.model.setLastPastedText(text, activeElement);
        // 貼り付けたので自動貼り付けカウントをリセット
        this.model.resetAutoPasteCount();
    }
    // 最後に貼り付けたテキストを消去
    clearLastPastedText() {
        const cleared = this.model.clearLastPastedText();
        if (cleared) {
            // 消去したのでリセット
            this.model.setLastPastedText("", document.body);
            // 自動貼り付けカウントもリセット
            this.model.resetAutoPasteCount();
        }
    }
    // テキスト入力要素かどうかをチェックする関数
    isTextInput(element) {
        if (!element)
            return false;
        const tagName = element.tagName.toLowerCase();
        const type = element.type
            ? element.type.toLowerCase()
            : "";
        // input要素（text, search, url, tel, email, password, number, etc）
        if (tagName === "input") {
            const nonTextTypes = [
                "button",
                "checkbox",
                "color",
                "file",
                "hidden",
                "image",
                "radio",
                "range",
                "reset",
                "submit",
            ];
            return !nonTextTypes.includes(type);
        }
        // textarea, または contentEditable属性を持つ要素
        return tagName === "textarea" || element.isContentEditable;
    }
}
//# sourceMappingURL=controller.js.map