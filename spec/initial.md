# CyberFocus 設計書

作成日: 2025-07-26  
作成モデル: claude-opus-4  

## 1. 目的と概要

本プロジェクトは、ポモドーロテクニックを活用したタスク管理Webアプリ「CyberFocus」の設計を目的とする。ユーザーはプロジェクトとタスクを管理し、25分の作業セッションと5分の休憩を通じて生産性を向上させることができる。

アーキテクチャ原則に基づき、以下の方針で設計する：
- core/は副作用ゼロの純粋関数のみで実装
- 副作用（DB操作、外部API呼び出し）はhandler.tsで処理
- features間の直接依存は禁止し、flowsでオーケストレーション
- DIコンテナを通じてPortと実装の紐付けを管理

本テンプレートは実装計画書の基盤を提供し、詳細設計は各実装計画書に委ねる。

## 2. ドメインリスト

プロジェクトのドメインを整理し、依存関係を明確化する。複数ドメインの連携が必要な場合はFlowsで実装する。

| ドメイン名 | 概要 | 依存ドメイン |
|------------|------|--------------|
| User | ユーザー管理（プロフィール情報、設定管理） | なし |
| Auth | 認証管理（ユーザー登録、ログイン、セッション管理、パスワードリセット） | User |
| Project | プロジェクト管理（作成、更新、削除、色とターゲットポモドーロ数の設定） | User |
| Task | タスク管理（作成、更新、削除、ステータス管理、予想ポモドーロ数の設定） | Project, User |
| PomodoroSession | ポモドーロセッション管理（作業/休憩の開始、一時停止、再開、完了） | Task, Project, User |
| Analytics | 生産性分析（カレンダー表示、プロジェクト進捗、タイムライン履歴） | Project, Task, PomodoroSession, User |

## 3. 全体アーキテクチャ図

ディレクトリ構成は、ドメインごとにビジネスロジックを分離し、技術的関心事はadapterに集約する。

```
src/
├── lib/
│   └── server/
│       ├── features/              # ドメインごとのビジネスロジック
│       │   ├── user/
│       │   │   ├── core/          # 純粋関数・ドメイン知識
│       │   │   │   └── user.ts
│       │   │   ├── command/       # 副作用を含むコマンド処理
│       │   │   │   └── update-profile/
│       │   │   │       ├── core.ts
│       │   │   │       └── handler.ts
│       │   │   └── query/         # データ取得クエリ
│       │   │       └── get-user/
│       │   │           ├── core.ts
│       │   │           └── handler.ts
│       │   ├── auth/
│       │   │   ├── core/
│       │   │   │   └── auth.ts
│       │   │   ├── policy/        # 認証ポリシー（パスワード強度など）
│       │   │   │   └── authPolicy.ts
│       │   │   ├── command/
│       │   │   │   ├── register/
│       │   │   │   │   ├── core.ts
│       │   │   │   │   └── handler.ts
│       │   │   │   ├── login/
│       │   │   │   │   ├── core.ts
│       │   │   │   │   └── handler.ts
│       │   │   │   ├── logout/
│       │   │   │   │   └── handler.ts
│       │   │   │   └── reset-password/
│       │   │   │       ├── core.ts
│       │   │   │       └── handler.ts
│       │   │   └── query/
│       │   │       └── validate-session/
│       │   │           ├── core.ts
│       │   │           └── handler.ts
│       │   ├── project/
│       │   │   ├── core/          # 純粋関数・ドメイン知識
│       │   │   │   └── project.ts
│       │   │   ├── command/       # 副作用を含むコマンド処理
│       │   │   │   ├── create-project/
│       │   │   │   │   ├── core.ts
│       │   │   │   │   └── handler.ts
│       │   │   │   └── update-project/
│       │   │   │       ├── core.ts
│       │   │   │       └── handler.ts
│       │   │   └── query/         # データ取得クエリ
│       │   │       └── get-projects/
│       │   │           ├── core.ts
│       │   │           └── handler.ts
│       │   ├── task/
│       │   │   ├── core/
│       │   │   │   └── task.ts
│       │   │   ├── policy/        # タスクの複雑なビジネスルール
│       │   │   │   └── taskPolicy.ts
│       │   │   ├── command/
│       │   │   │   ├── create-task/
│       │   │   │   ├── update-task/
│       │   │   │   └── toggle-task-status/
│       │   │   └── query/
│       │   │       └── get-tasks/
│       │   ├── pomodoro-session/
│       │   │   ├── core/
│       │   │   │   └── pomodoroSession.ts
│       │   │   ├── command/
│       │   │   │   ├── start-session/
│       │   │   │   ├── pause-session/
│       │   │   │   └── complete-session/
│       │   │   └── query/
│       │   │       └── get-sessions/
│       │   └── analytics/
│       │       ├── core/
│       │       │   └── analytics.ts
│       │       └── query/
│       │           ├── get-calendar-data/
│       │           ├── get-project-progress/
│       │           └── get-timeline/
│       ├── flows/                 # 複数ドメインを束ねるオーケストレーター
│       │   ├── create-task-with-project/
│       │   │   └── handler.ts
│       │   ├── start-pomodoro-for-task/
│       │   │   └── handler.ts
│       │   └── register-and-login/
│       │       └── handler.ts
│       ├── adapter/               # 技術依存（DB/外部API）
│       │   ├── repository/        # DB永続化実装
│       │   │   ├── userRepository.prisma.ts
│       │   │   ├── projectRepository.prisma.ts
│       │   │   ├── taskRepository.prisma.ts
│       │   │   └── pomodoroSessionRepository.prisma.ts
│       │   └── service/           # 外部API連携
│       │       ├── authService.lucia.ts    # Lucia Auth統合
│       │       └── emailService.ts         # メール送信（パスワードリセット用）
│       ├── shared/                # ドメイン横断ユーティリティ
│       │   ├── port/              # 抽象インターフェース
│       │   │   ├── repository/
│       │   │   │   ├── userRepository.ts
│       │   │   │   ├── projectRepository.ts
│       │   │   │   ├── taskRepository.ts
│       │   │   │   └── pomodoroSessionRepository.ts
│       │   │   └── service/
│       │   │       ├── authService.ts
│       │   │       └── emailService.ts
│       │   └── container.ts       # DIコンテナ
│       └── auth.ts                # 認証ヘルパー（requireAuth, requireAdmin）
└── routes/                        # SvelteKitルーティング
    ├── (auth)/                    # 認証関連ページ
    │   ├── login/
    │   │   ├── +page.svelte       # ログイン画面
    │   │   └── +page.server.ts    # ログイン処理
    │   ├── register/
    │   │   ├── +page.svelte       # 登録画面
    │   │   └── +page.server.ts    # 登録処理
    │   └── reset-password/
    │       ├── +page.svelte       # パスワードリセット画面
    │       └── +page.server.ts    # リセット処理
    ├── (app)/                     # 認証必須エリア
    │   ├── +layout.server.ts      # 認証チェック
    │   ├── +page.svelte           # メイン画面
    │   └── +page.server.ts        # サーバーサイド処理
    └── api/                       # 外部システム用API（必要時）
```

**レイヤ責務の再確認**:
- **core/**: ビジネスロジックを純粋関数で実装。副作用ゼロ
- **policy/**: 複数エンティティにまたがるドメイン規則
- **command/query**: UseCase実装。DIコンテナ経由で実装を取得
- **flows/**: 2つ以上のcommand/queryを結合し順序を制御
- **adapter/**: 外部サービス実装（DB、将来的には外部API）をカプセル化

## 4. UseCaseカタログ

システムの主要なコマンドとクエリ、およびそれらを組み合わせたFlowの概要。詳細な入力/出力型とエッジケースは実装計画書で定義する。

| UseCase名 | タイプ | 概要 | 公開範囲 |
|-----------|--------|------|----------|
| register | command | ユーザー登録（メールアドレス、パスワードでアカウント作成） | public |
| login | command | ログイン（メールアドレス、パスワードで認証しセッション作成） | public |
| logout | command | ログアウト（セッションを無効化） | public |
| reset-password | command | パスワードリセット（メールでリセットリンク送信、新パスワード設定） | public |
| update-profile | command | プロフィール更新（ユーザー名、設定情報を変更） | public |
| get-user | query | ユーザー情報取得（IDまたはセッションから現在のユーザー情報を取得） | public |
| validate-session | query | セッション検証（セッショントークンの有効性を確認） | public |
| create-project | command | プロジェクト作成（名前、色、目標ポモドーロ数を設定してDB保存） | public |
| update-project | command | プロジェクト更新（名前、色、目標ポモドーロ数を変更） | public |
| delete-project | command | プロジェクト削除（関連タスクも含めて削除） | public |
| get-projects | query | プロジェクト一覧取得（ユーザーのアクティブなプロジェクト一覧） | public |
| create-task | command | タスク作成（タイトル、説明、プロジェクトID、予想ポモドーロ数を設定） | public |
| update-task | command | タスク更新（タイトル、説明、ステータス等を変更） | public |
| delete-task | command | タスク削除（関連セッションは保持） | public |
| toggle-task-status | command | タスク完了状態切り替え（完了/未完了をトグル） | public |
| get-tasks | query | タスク一覧取得（ユーザー、プロジェクト、ステータスでフィルタ可能） | public |
| start-session | command | ポモドーロセッション開始（タスクIDを指定して25分タイマー開始） | public |
| pause-session | command | セッション一時停止（実行中のセッションを一時停止） | public |
| complete-session | command | セッション完了（セッションを完了として記録） | public |
| get-sessions | query | セッション履歴取得（ユーザー、日付範囲でフィルタ可能） | public |
| get-calendar-data | query | カレンダーデータ取得（ユーザーの月間ポモドーロ実施状況） | public |
| get-project-progress | query | プロジェクト進捗取得（ユーザーの週間達成率） | public |
| get-timeline | query | タイムライン取得（ユーザーの本日のセッション履歴） | public |
| register-and-login | flow | 登録＆自動ログイン（ユーザー作成後、自動的にセッション作成） | public |
| create-task-with-project | flow | プロジェクト関連付きタスク作成（プロジェクト存在確認後、タスク作成） | public |
| start-pomodoro-for-task | flow | タスクのポモドーロ開始（タスク状態を進行中に変更後、セッション開始） | public |

**シーケンス概要**: 
- ページルート: routes/+page.server.ts → flows/handler → command/handler → adapter/repository
- 内部処理: command/handler → core → adapter/repository → DBアクセス

## 5. Portカタログ

外部依存を抽象化するインターフェースの概要。Repository（DB操作）とService（外部API）に分類される。

| Port名 | タイプ | 目的 |
|--------|--------|------|
| UserRepository | Repository | ユーザーDB操作（作成、更新、削除、メールアドレスでの検索） |
| ProjectRepository | Repository | プロジェクトDB操作（作成、更新、削除、ユーザー別取得の抽象インターフェース） |
| TaskRepository | Repository | タスクDB操作（作成、更新、削除、ステータス変更、ユーザー/プロジェクト別取得） |
| PomodoroSessionRepository | Repository | セッションDB操作（作成、更新、完了処理、ユーザー別履歴取得） |
| AuthService | Service | 認証サービス（セッション管理、パスワードハッシュ化、トークン生成） |
| EmailService | Service | メール送信サービス（パスワードリセット、通知メール送信） |
| NotificationService | Service | 通知サービス（将来実装：セッション完了時のプッシュ通知） |

**ガイドライン**:
- interfaceとして定義し、実装詳細をadapter/に隠蔽
- Repositoryは純粋なDB操作に限定し、ビジネスロジックを含まない
- Serviceは外部APIの詳細をカプセル化し、ドメイン語彙での操作を提供

## 6. テスト戦略概要

各レイヤーに適したテスト手法を採用し、品質を確保する。

| レイヤ | テスト種類 | 特徴概要 |
|--------|------------|----------|
| core/ | ユニット | モック不要（例: タスク作成時の入力検証、ポモドーロ時間計算） |
| command/query/ | ユニット | Portダミー注入（例: DB保存の模擬実行、期待値の検証） |
| flows/ | 統合 | 実際のcommand/query結合（例: タスク作成からセッション開始までの一連の流れ） |
| adapter/ | 契約テスト | TestcontainerでDB実行（例: Prismaクエリの動作確認） |
| routes/ | E2E | PlaywrightでUI操作（例: タスク作成フォームの送信と画面更新） |

## 7. レビューとイテレーション計画

実装計画書作成前のチェックポイント：

**レビュー項目**:
- 依存方向違反の確認（例: core/内でadapterやhandlerをimportしていないか）
- ドメイン境界の妥当性（例: AnalyticsがPomodoroSessionに直接依存していないか）
- Port定義の完全性（例: 必要なDB操作がすべてインターフェースに含まれているか）

**イテレーション計画**:
- 初回レビューで1-2回の修正を想定
- 不備が見つかった場合はドメインリスト（セクション2）から見直し
- チーム合意後に実装計画書の作成に移行

## 8. FAQ/追加考慮

**Q. 詳細な型定義やエラーハンドリングはどこで定義？**  
A. 実装計画書の詳細要件セクション（3.2）で、各UseCaseの入力/出力型、エラーケースを定義。

**Q. 認証機能の実装方針は？**  
A. 自力でメールアドレス、パスワードログイン実装を行いなさい。

**Q. パスワードの管理方法は？**  
A. AuthServiceでbcryptやargon2などの安全なハッシュアルゴリズムを使用。平文パスワードは一切保存せず、ハッシュ化されたパスワードのみDBに保存。

**Q. メール送信はどう実装する？**  
A. メール送信は実装しない

**Q. Flowを作成する基準は？**  
A. 2つ以上のcommand/queryを結合する場合、または複数ドメインのオーケストレーションが必要な場合（アーキテクチャ原則3.3参照）。

**Q. なぜAnalyticsドメインが必要？**  
A. 生産性分析は複数ドメインのデータを横断的に集約するため、独立したドメインとして定義。これによりレポート生成ロジックを一元管理。

**Q. Prismaスキーマはいつ定義する？**  
A. 実装フェーズのステップ1（9-2.1）でDBスキーマを定義し、型生成を行う。Userテーブルにはemail（unique）、hashedPassword、createdAt等を含める。

**Q. マルチユーザー対応の考慮点は？**  
A. 全てのデータ（Project、Task、PomodoroSession）はuserIdで所有者を識別。クエリ実行時は必ずユーザーIDでフィルタリングし、他ユーザーのデータにアクセスできないよう制御。