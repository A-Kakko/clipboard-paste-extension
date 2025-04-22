import * as contextMenuModule from './modules/contextMenu';
import * as menuRenderer from './modules/menuRenderer';

// DOMが読み込まれたら初期化
document.addEventListener('DOMContentLoaded', () => {
  // メニュー要素を初期化
  menuRenderer.initializeMenuElement();
  
  // テキスト欄のイベントリスナーをセットアップ
  contextMenuModule.setupTextFieldListeners();
});