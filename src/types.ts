// types.ts - 共通で使用する型定義

// 拡張機能の階層化された設定
export interface ExtensionSettings {
  paste: PasteSettings;
  appearance: AppearanceSettings;
}

export interface PasteSettings {
  enableAutoPaste: boolean; // 自動貼り付け機能の有効/無効
  autoPasteLimit: number; // 自動貼り付けの回数制限
  enableClearOnClick: boolean; // テキスト欄外クリックで消去機能の有効/無効
  autoPasteCount: number; // 現在の自動貼り付け回数
}

export interface AppearanceSettings {
  menuTheme: "light" | "dark" | "system";
  menuPosition: "cursor" | "element";
}

// クリックポジション
export interface Position {
  x: number;
  y: number;
}

// バックグラウンドスクリプトへのメッセージ
export interface BackgroundMessage {
  action: "showPasteMenu" | "resetAutoPasteCount" | "clearLastPasted";
  position?: Position;
}

// コンテンツスクリプトへのメッセージ
export interface ContentMessage {
  action: "displayPasteMenu" | "autoPaste" | "clearLastPasted";
  clipboardText?: string;
  position?: Position;
  settings?: ExtensionSettings;
}

// サービスインターフェース
export interface ClipboardService {
  readText(): Promise<string>;
}

export interface StorageService {
  get<T>(key: string, defaultValue: T): Promise<T>;
  set<T>(key: string, value: T): Promise<void>;
  getAll<T>(defaultValues: T): Promise<T>;
}

export interface MessagingService {
  sendMessageToTab(tabId: number, message: ContentMessage): Promise<void>;
  sendMessageToBackground(message: BackgroundMessage): Promise<void>;
  addListener<T, R>(
    callback: (message: T, sender: any) => R | Promise<R>
  ): void;
}
