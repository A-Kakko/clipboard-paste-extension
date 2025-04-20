// background.ts - バックグラウンドスクリプト
import {
  ExtensionSettings,
  PasteSettings,
  AppearanceSettings,
  BackgroundMessage,
  ContentMessage,
} from "./types";

import {
  ChromeClipboardService,
  ChromeStorageService,
  BackgroundMessagingService,
} from "./services";

// デフォルト設定
const DEFAULT_SETTINGS: ExtensionSettings = {
  paste: {
    enableAutoPaste: false,
    autoPasteLimit: 3,
    enableClearOnClick: false,
    autoPasteCount: 0,
  },
  appearance: {
    menuTheme: "light",
    menuPosition: "cursor",
  },
};

// サービスの初期化
const clipboardService = new ChromeClipboardService();
const storageService = new ChromeStorageService();
const messagingService = new BackgroundMessagingService();

// バックグラウンドサービスクラス
class BackgroundService {
  constructor(
    private clipboardService: ChromeClipboardService,
    private storageService: ChromeStorageService,
    private messagingService: BackgroundMessagingService
  ) {}

  // 初期化処理
  init(): void {
    // 拡張機能がインストールされた時に実行
    chrome.runtime.onInstalled.addListener(this.handleInstalled.bind(this));

    // メッセージリスナーを設定
    this.setupMessageListeners();
  }

  // インストール/アップデート時の処理
  private async handleInstalled(): Promise<void> {
    console.log(
      "クリップボード貼り付けメニュー拡張機能がインストールされました"
    );

    // 現在の設定を取得
    const currentSettings = await this.storageService.getAll(DEFAULT_SETTINGS);

    // 不足している設定項目があれば更新
    const updatedSettings: Partial<ExtensionSettings> = {};
    let needsUpdate = false;

    // paste設定のチェック
    if (!currentSettings.paste) {
      updatedSettings.paste = DEFAULT_SETTINGS.paste;
      needsUpdate = true;
    } else {
      // 個別のpasteプロパティをチェック
      const updatedPaste: Partial<PasteSettings> = {};
      let pastesNeedsUpdate = false;

      for (const key in DEFAULT_SETTINGS.paste) {
        if (currentSettings.paste[key as keyof PasteSettings] === undefined) {
          const updatedPaste: Partial<PasteSettings> =
            {} as Partial<PasteSettings>;
          DEFAULT_SETTINGS.paste[key as keyof PasteSettings];
          pastesNeedsUpdate = true;
        }
      }

      if (pastesNeedsUpdate) {
        updatedSettings.paste = { ...currentSettings.paste, ...updatedPaste };
        needsUpdate = true;
      }
    }

    // appearance設定のチェック
    if (!currentSettings.appearance) {
      updatedSettings.appearance = DEFAULT_SETTINGS.appearance;
      needsUpdate = true;
    } else {
      // 個別のappearanceプロパティをチェック
      const updatedAppearance: Partial<AppearanceSettings> = {};
      let appearanceNeedsUpdate = false;

      for (const key in DEFAULT_SETTINGS.appearance) {
        if (
          currentSettings.appearance[key as keyof AppearanceSettings] ===
          undefined
        ) {
          const updatedAppearance: Partial<AppearanceSettings> =
            {} as Partial<AppearanceSettings>;
          DEFAULT_SETTINGS.appearance[key as keyof AppearanceSettings];
          appearanceNeedsUpdate = true;
        }
      }

      if (appearanceNeedsUpdate) {
        updatedSettings.appearance = {
          ...currentSettings.appearance,
          ...updatedAppearance,
        };
        needsUpdate = true;
      }
    }

    // 更新が必要な設定項目があれば保存
    if (needsUpdate) {
      await this.storageService.set("settings", {
        ...currentSettings,
        ...updatedSettings,
      });
    }
  }

  // メッセージリスナーのセットアップ
  private setupMessageListeners(): void {
    this.messagingService.addListener<BackgroundMessage, void>(
      async (message, sender) => {
        if (!sender.tab?.id) return;

        if (message.action === "showPasteMenu") {
          await this.handleShowPasteMenu(sender.tab.id, message);
        } else if (message.action === "resetAutoPasteCount") {
          await this.resetAutoPasteCount();
        } else if (message.action === "clearLastPasted") {
          await this.clearLastPasted(sender.tab.id);
        }
      }
    );
  }

  // ペーストメニュー表示リクエストの処理
  private async handleShowPasteMenu(
    tabId: number,
    message: BackgroundMessage
  ): Promise<void> {
    try {
      // 現在の設定を取得
      const settings = await this.storageService.get(
        "settings",
        DEFAULT_SETTINGS
      );

      // クリップボードからテキストを読み取る
      const clipboardText = await this.clipboardService.readText();

      // クリップボードにテキストがある場合のみ処理
      if (clipboardText && clipboardText.trim() !== "") {
        // 自動貼り付け機能がオンで、回数制限内の場合
        const isAutoPasteEnabled =
          settings.paste.enableAutoPaste &&
          settings.paste.autoPasteCount < settings.paste.autoPasteLimit;

        // コンテンツスクリプトにメッセージを送信
        await this.messagingService.sendMessageToTab(tabId, {
          action: isAutoPasteEnabled ? "autoPaste" : "displayPasteMenu",
          clipboardText: clipboardText,
          position: message.position,
          settings: settings,
        });

        // 自動貼り付けが行われた場合、カウントを増やす
        if (isAutoPasteEnabled) {
          settings.paste.autoPasteCount++;
          await this.storageService.set("settings", settings);
        }
      }
    } catch (error) {
      console.error("ペーストメニュー表示処理中にエラーが発生しました:", error);
    }
  }

  // 自動貼り付けカウントをリセット
  private async resetAutoPasteCount(): Promise<void> {
    try {
      const settings = await this.storageService.get(
        "settings",
        DEFAULT_SETTINGS
      );
      settings.paste.autoPasteCount = 0;
      await this.storageService.set("settings", settings);
    } catch (error) {
      console.error(
        "自動貼り付けカウントリセット中にエラーが発生しました:",
        error
      );
    }
  }

  // 最後に貼り付けたテキストを消去するメッセージを送信
  private async clearLastPasted(tabId: number): Promise<void> {
    try {
      await this.messagingService.sendMessageToTab(tabId, {
        action: "clearLastPasted",
      });
    } catch (error) {
      console.error(
        "テキスト消去メッセージ送信中にエラーが発生しました:",
        error
      );
    }
  }
}

// バックグラウンドサービスのインスタンス作成と初期化
const backgroundService = new BackgroundService(
  clipboardService,
  storageService,
  messagingService
);

backgroundService.init();
