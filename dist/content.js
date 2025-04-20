// content.ts - コンテンツスクリプトのエントリーポイント
import { PasteModel } from './content/model';
import { PasteView } from './content/view';
import { PasteController } from './content/controller';
import { ContentMessagingService } from './services';
// サービスの初期化
const messagingService = new ContentMessagingService();
// MVCコンポーネントの初期化
const model = new PasteModel(messagingService);
const view = new PasteView();
const controller = new PasteController(model, view);
// コントローラーの初期化（イベントリスナー設定など）
controller.init();
console.log('クリップボード貼り付けメニュー拡張機能 - コンテンツスクリプトが読み込まれました');
//# sourceMappingURL=content.js.map