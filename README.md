# ECサイト v1.1

React + Tailwind CSS + FastAPI + Nginx + SQLite によるシンプルな EC サイトです。

Amazon EC2 にデプロイしていますので、  
24時間アクセス可能です： 
http://13.230.72.70/

---

🔐 **ログイン機能**  
Customer と Merchant でログインを分離

---

🛍️ **店舗 (Merchant) 側機能**  
・商品を追加  
・商品を削除  
・商品を編集  
・商品を検索  

---

👤 **ユーザー (Customer) 側機能**  
・商品を検索  
・ショッピングカートに追加  
・購入（※決済機能は未実装）

---

📦 **過去バージョン**

- **v1.0**
  - 商品画像（JPG）読み込みの不具合を修正
  - ローカル `http://localhost:8000` に依存していた画像URLを、相対パスに変更（Nginx 対応）


