import { ChromeStorageService } from "./services";
// デフォルト設定
const DEFAULT_SETTINGS = {
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
// ストレージサービスの初期化
const storageService = new ChromeStorageService();
// 設定マネージャークラス
class OptionsManager {
    constructor(storageService) {
        this.storageService = storageService;
        this.enableAutoPasteCheckbox = null;
        this.autoPasteLimitInput = null;
        this.enableClearOnClickCheckbox = null;
        this.menuThemeSelect = null;
        this.menuPositionSelect = null;
        this.saveButton = null;
        this.statusElement = null;
    }
    // 初期化処理
    async init() {
        // DOM要素の取得
        this.enableAutoPasteCheckbox = document.getElementById("enableAutoPaste");
        this.autoPasteLimitInput = document.getElementById("autoPasteLimit");
        this.enableClearOnClickCheckbox = document.getElementById("enableClearOnClick");
        this.menuThemeSelect = document.getElementById("menuTheme");
        this.menuPositionSelect = document.getElementById("menuPosition");
        this.saveButton = document.getElementById("save");
        this.statusElement = document.getElementById("status");
        // 設定を読み込む
        await this.loadOptions();
        // イベントリスナーを設定
        this.setupEventListeners();
    }
    // イベントリスナーのセットアップ
    setupEventListeners() {
        if (this.saveButton) {
            this.saveButton.addEventListener("click", this.saveOptions.bind(this));
        }
        if (this.enableAutoPasteCheckbox && this.autoPasteLimitInput) {
            this.enableAutoPasteCheckbox.addEventListener("change", (e) => {
                // チェックボックスの状態に応じて回数入力欄の有効/無効を切り替え
                this.autoPasteLimitInput.disabled =
                    !this.enableAutoPasteCheckbox.checked;
            });
        }
    }
    // 設定を読み込む関数
    async loadOptions() {
        try {
            const settings = await this.storageService.get("settings", DEFAULT_SETTINGS);
            // UI要素に値を設定
            if (this.enableAutoPasteCheckbox) {
                this.enableAutoPasteCheckbox.checked = settings.paste.enableAutoPaste;
            }
            if (this.autoPasteLimitInput) {
                this.autoPasteLimitInput.value = String(settings.paste.autoPasteLimit);
                this.autoPasteLimitInput.disabled = !settings.paste.enableAutoPaste;
            }
            if (this.enableClearOnClickCheckbox) {
                this.enableClearOnClickCheckbox.checked =
                    settings.paste.enableClearOnClick;
            }
            if (this.menuThemeSelect) {
                this.menuThemeSelect.value = settings.appearance.menuTheme;
            }
            if (this.menuPositionSelect) {
                this.menuPositionSelect.value = settings.appearance.menuPosition;
            }
        }
        catch (error) {
            console.error("設定の読み込み中にエラーが発生しました:", error);
        }
    }
    // 設定を保存する関数
    async saveOptions() {
        try {
            // 現在の設定を取得
            const currentSettings = await this.storageService.get("settings", DEFAULT_SETTINGS);
            // UI要素から値を取得
            const enableAutoPaste = this.enableAutoPasteCheckbox
                ? this.enableAutoPasteCheckbox.checked
                : currentSettings.paste.enableAutoPaste;
            const autoPasteLimitRaw = this.autoPasteLimitInput
                ? parseInt(this.autoPasteLimitInput.value, 10)
                : currentSettings.paste.autoPasteLimit;
            const enableClearOnClick = this.enableClearOnClickCheckbox
                ? this.enableClearOnClickCheckbox.checked
                : currentSettings.paste.enableClearOnClick;
            const menuTheme = this.menuThemeSelect
                ? this.menuThemeSelect.value
                : currentSettings.appearance.menuTheme;
            const menuPosition = this.menuPositionSelect
                ? this.menuPositionSelect.value
                : currentSettings.appearance.menuPosition;
            // 入力値のバリデーション
            const autoPasteLimit = isNaN(autoPasteLimitRaw)
                ? currentSettings.paste.autoPasteLimit
                : Math.max(1, Math.min(10, autoPasteLimitRaw));
            // 設定を更新
            const updatedSettings = {
                paste: {
                    ...currentSettings.paste,
                    enableAutoPaste,
                    autoPasteLimit,
                    enableClearOnClick,
                },
                appearance: {
                    ...currentSettings.appearance,
                    menuTheme,
                    menuPosition,
                },
            };
            // 設定を保存
            await this.storageService.set("settings", updatedSettings);
            // 保存完了メッセージを表示
            this.showSaveStatus();
        }
        catch (error) {
            console.error("設定の保存中にエラーが発生しました:", error);
        }
    }
    // 保存完了メッセージを表示
    showSaveStatus() {
        if (this.statusElement) {
            this.statusElement.classList.add("visible");
            setTimeout(() => {
                this.statusElement?.classList.remove("visible");
            }, 1500);
        }
    }
}
// DOMContentLoadedイベントで初期化
document.addEventListener("DOMContentLoaded", () => {
    const optionsManager = new OptionsManager(storageService);
    optionsManager.init();
});
//# sourceMappingURL=options.js.map