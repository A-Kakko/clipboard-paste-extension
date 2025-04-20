// content/model.ts - コンテンツスクリプトのモデル

import {
  MessagingService,
  BackgroundMessage,
  ExtensionSettings,
  Position,
} from "../types";

export class PasteModel {
  private lastPastedText: string = "";
  private lastTargetElement: HTMLElement | null = null;
  private enableClearOnClick: boolean = false;

  constructor(private messagingService: MessagingService) {}

  // テキスト欄外クリックでの消去設定を更新
  updateClearOnClickSetting(enableClearOnClick: boolean): void {
    this.enableClearOnClick = enableClearOnClick;
  }

  // 最後に貼り付けた内容を保存
  setLastPastedText(text: string, element: HTMLElement): void {
    this.lastPastedText = text;
    this.lastTargetElement = element;
  }

  // 最後に貼り付けた内容を取得
  getLastPastedText(): string {
    return this.lastPastedText;
  }

  // 最後のターゲット要素を取得
  getLastTargetElement(): HTMLElement | null {
    return this.lastTargetElement;
  }

  // テキスト欄外クリックで消去機能が有効かどうか
  isClearOnClickEnabled(): boolean {
    return this.enableClearOnClick;
  }

  // バックグラウンドに貼り付けメニュー表示をリクエスト
  async requestPasteMenu(position: Position): Promise<void> {
    await this.messagingService.sendMessageToBackground({
      action: "showPasteMenu",
      position: position,
    } as BackgroundMessage);
  }

  // バックグラウンドに最後に貼り付けたテキスト消去をリクエスト
  async requestClearLastPasted(): Promise<void> {
    await this.messagingService.sendMessageToBackground({
      action: "clearLastPasted",
    } as BackgroundMessage);
  }

  // 自動貼り付けカウントリセットをリクエスト
  async resetAutoPasteCount(): Promise<void> {
    await this.messagingService.sendMessageToBackground({
      action: "resetAutoPasteCount",
    } as BackgroundMessage);
  }

  // 最後に貼り付けたテキストを消去
  clearLastPastedText(): boolean {
    if (!this.lastTargetElement || !this.lastPastedText) return false;

    if (this.lastTargetElement.isContentEditable) {
      // contentEditableな要素の場合
      const currentText = this.lastTargetElement.innerText;
      const newText = currentText.replace(this.lastPastedText, "");

      // テキストが変わった場合のみ更新
      if (currentText !== newText) {
        this.lastTargetElement.innerText = newText;
        return true;
      }
    } else if (
      this.lastTargetElement.tagName.toLowerCase() === "input" ||
      this.lastTargetElement.tagName.toLowerCase() === "textarea"
    ) {
      const inputElement = this.lastTargetElement as
        | HTMLInputElement
        | HTMLTextAreaElement;
      const currentValue = inputElement.value;
      const lastIndex = currentValue.lastIndexOf(this.lastPastedText);

      // 最後に貼り付けたテキストが見つかった場合
      if (lastIndex !== -1) {
        const beforeText = currentValue.substring(0, lastIndex);
        const afterText = currentValue.substring(
          lastIndex + this.lastPastedText.length
        );

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
