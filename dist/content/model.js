// content/model.ts - コンテンツスクリプトのモデル
export class PasteModel {
    constructor(messagingService) {
        this.messagingService = messagingService;
        this.lastPastedText = "";
        this.lastTargetElement = null;
        this.enableClearOnClick = false;
    }
    // テキスト欄外クリックでの消去設定を更新
    updateClearOnClickSetting(enableClearOnClick) {
        this.enableClearOnClick = enableClearOnClick;
    }
    // 最後に貼り付けた内容を保存
    setLastPastedText(text, element) {
        this.lastPastedText = text;
        this.lastTargetElement = element;
    }
    // 最後に貼り付けた内容を取得
    getLastPastedText() {
        return this.lastPastedText;
    }
    // 最後のターゲット要素を取得
    getLastTargetElement() {
        return this.lastTargetElement;
    }
    // テキスト欄外クリックで消去機能が有効かどうか
    isClearOnClickEnabled() {
        return this.enableClearOnClick;
    }
    // バックグラウンドに貼り付けメニュー表示をリクエスト
    async requestPasteMenu(position) {
        await this.messagingService.sendMessageToBackground({
            action: "showPasteMenu",
            position: position,
        });
    }
    // バックグラウンドに最後に貼り付けたテキスト消去をリクエスト
    async requestClearLastPasted() {
        await this.messagingService.sendMessageToBackground({
            action: "clearLastPasted",
        });
    }
    // 自動貼り付けカウントリセットをリクエスト
    async resetAutoPasteCount() {
        await this.messagingService.sendMessageToBackground({
            action: "resetAutoPasteCount",
        });
    }
    // 最後に貼り付けたテキストを消去
    clearLastPastedText() {
        if (!this.lastTargetElement || !this.lastPastedText)
            return false;
        if (this.lastTargetElement.isContentEditable) {
            // contentEditableな要素の場合
            const currentText = this.lastTargetElement.innerText;
            const newText = currentText.replace(this.lastPastedText, "");
            // テキストが変わった場合のみ更新
            if (currentText !== newText) {
                this.lastTargetElement.innerText = newText;
                return true;
            }
        }
        else if (this.lastTargetElement.tagName.toLowerCase() === "input" ||
            this.lastTargetElement.tagName.toLowerCase() === "textarea") {
            const inputElement = this.lastTargetElement;
            const currentValue = inputElement.value;
            const lastIndex = currentValue.lastIndexOf(this.lastPastedText);
            // 最後に貼り付けたテキストが見つかった場合
            if (lastIndex !== -1) {
                const beforeText = currentValue.substring(0, lastIndex);
                const afterText = currentValue.substring(lastIndex + this.lastPastedText.length);
                inputElement.value = beforeText + afterText;
                // カーソル位置を更新
                inputElement.setSelectionRange(lastIndex, lastIndex);
                // change イベントを発火（Reactなどのフレームワーク対応）
                const event = new Event("input", { bubbles: true });
                inputElement.dispatchEvent(event);
                return true;
            }
        }
        return false;
    }
}
//# sourceMappingURL=model.js.map