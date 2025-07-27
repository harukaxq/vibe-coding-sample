# CyberFocus 実装計画書

**実行AIモデル名**: claude-opus-4-20250514  
**作成日**: 2025-07-26  

## 1. 目的と背景

本タスクは、ポモドーロテクニックを活用したタスク管理Webアプリケーション「CyberFocus」を新規実装することを目的とする。ユーザーは25分の作業セッションと5分の休憩を通じて生産性を向上させることができる。

背景:
- ポモドーロテクニックは生産性向上のための実証済みの手法であるが、タスク管理と統合したシンプルなWebアプリが不足している
- プロジェクトごとにタスクを管理し、作業時間を可視化することで、より効果的な時間管理が可能になる
- カレンダー表示やプロジェクト進捗の分析機能により、長期的な生産性の改善を支援する

概要:
- ユーザー認証機能（メールアドレス/パスワードによる登録・ログイン）
- プロジェクト・タスク管理機能（CRUD操作、色分け、目標ポモドーロ数設定）
- ポモドーロセッション機能（25分作業・5分休憩のタイマー、一時停止・再開）
- 生産性分析機能（カレンダー表示、週間進捗、タイムライン履歴）

## 2. 対象領域

### 2.1 対象ドメイン

- **User**: ユーザー管理
  - src/lib/server/features/user/core/user.ts: ユーザーエンティティ定義
  - src/lib/server/features/user/command/update-profile/handler.ts: プロフィール更新
  - src/lib/server/features/user/query/get-user/handler.ts: ユーザー情報取得

- **Auth**: 認証管理  
  - src/lib/server/features/auth/core/auth.ts: 認証関連の純粋関数
  - src/lib/server/features/auth/policy/authPolicy.ts: パスワード強度等のポリシー
  - src/lib/server/features/auth/command/register/handler.ts: ユーザー登録
  - src/lib/server/features/auth/command/login/handler.ts: ログイン処理

- **Project**: プロジェクト管理
  - src/lib/server/features/project/core/project.ts: プロジェクトエンティティ
  - src/lib/server/features/project/command/create-project/handler.ts: プロジェクト作成
  - src/lib/server/features/project/query/get-projects/handler.ts: プロジェクト一覧取得

- **Task**: タスク管理
  - src/lib/server/features/task/core/task.ts: タスクエンティティ
  - src/lib/server/features/task/policy/taskPolicy.ts: タスク関連のビジネスルール
  - src/lib/server/features/task/command/create-task/handler.ts: タスク作成
  - src/lib/server/features/task/command/toggle-task-status/handler.ts: タスク完了切替

- **PomodoroSession**: セッション管理
  - src/lib/server/features/pomodoro-session/core/pomodoroSession.ts: セッションエンティティ
  - src/lib/server/features/pomodoro-session/command/start-session/handler.ts: セッション開始
  - src/lib/server/features/pomodoro-session/command/complete-session/handler.ts: セッション完了

- **Analytics**: 分析機能
  - src/lib/server/features/analytics/core/analytics.ts: 分析関連の純粋関数
  - src/lib/server/features/analytics/query/get-calendar-data/handler.ts: カレンダーデータ取得
  - src/lib/server/features/analytics/query/get-project-progress/handler.ts: 進捗取得

### 2.2 対象フロー

- **register-and-login** (src/lib/server/flows/register-and-login/handler.ts): ユーザー登録後に自動ログイン
- **create-task-with-project** (src/lib/server/flows/create-task-with-project/handler.ts): プロジェクト存在確認後にタスク作成
- **start-pomodoro-for-task** (src/lib/server/flows/start-pomodoro-for-task/handler.ts): タスクステータス変更後にセッション開始

### 2.3 対象Adapter

- **UserRepositoryPrisma** (src/lib/server/adapter/repository/userRepository.prisma.ts): ユーザーDB操作
- **ProjectRepositoryPrisma** (src/lib/server/adapter/repository/projectRepository.prisma.ts): プロジェクトDB操作
- **TaskRepositoryPrisma** (src/lib/server/adapter/repository/taskRepository.prisma.ts): タスクDB操作
- **PomodoroSessionRepositoryPrisma** (src/lib/server/adapter/repository/pomodoroSessionRepository.prisma.ts): セッションDB操作
- **AuthServiceLucia** (src/lib/server/adapter/service/authService.lucia.ts): 認証サービス実装（パスワードハッシュ化、セッション管理）

### 2.4 対象ページ

- **認証ページ** (src/routes/(auth)/): ログイン、登録、パスワードリセット画面
- **メインページ** (src/routes/(app)/+page.svelte): タスク一覧、ポモドーロタイマー、プロジェクト表示
- **分析ページ** (src/routes/(app)/analytics/+page.svelte): カレンダー、進捗グラフ表示

## 3. 機能要件

### 3.1 機能の概要

CyberFocusは、ポモドーロテクニックとタスク管理を統合したWebアプリケーションです。

**主な機能**:
- ユーザー認証（メールアドレス/パスワードによる登録・ログイン）
- プロジェクト管理（作成・更新・削除、色分け、目標ポモドーロ数設定）
- タスク管理（作成・更新・削除、ステータス管理、予想ポモドーロ数設定）
- ポモドーロセッション（25分作業/5分休憩タイマー、一時停止・再開）
- 生産性分析（月間カレンダー、週間進捗、本日のタイムライン）

**期待される効果**:
- 集中力の向上と作業効率の改善
- タスクとプロジェクトの進捗可視化
- 長期的な生産性パターンの把握と改善

### 3.2 詳細要件

- **core/レベル**: 
  - User, Project, Task, PomodoroSessionの各エンティティを純粋関数で定義
  - createUser, createProject等のFactory関数で不変条件を保証
  - calculatePomodoroTime, validateEmailFormat等のビジネスロジック

- **policy/レベル**:
  - authPolicy: パスワード強度チェック（8文字以上、英数字含む）
  - taskPolicy: タスクのステータス遷移ルール（未着手→進行中→完了）

- **command/query/レベル**:
  - register command:
    - 入力: email, password
    - 処理: メール重複チェック、パスワードハッシュ化、ユーザー作成
    - 出力: 作成されたユーザー情報
  - start-session command:
    - 入力: taskId, userId
    - 処理: タスク存在確認、新規セッション作成（25分タイマー）
    - 出力: セッション情報

- **flows/レベル**:
  - register-and-login:
    ```
    1. register commandでユーザー作成
    2. login commandで自動ログイン
    3. セッション情報返却
    ```

- **シーケンス図**:
  ```
  +page.server.ts → flows/register-and-login → 
    → auth/command/register → adapter/repository/userRepository
    → auth/command/login → adapter/service/authService
  ```

### 3.3 非機能要件

- 入力検証: メールアドレス形式、パスワード強度の検証
- セキュリティ: パスワードのbcryptハッシュ化、セッションベース認証
- パフォーマンス: プロジェクト/タスク一覧は100件以内を想定

### 3.4 実装対象ファイル

**Prismaスキーマ**:
- prisma/schema.prisma: User, Project, Task, PomodoroSessionモデル定義

**Features**:
- src/lib/server/features/user/: core, command, query実装
- src/lib/server/features/auth/: core, policy, command, query実装
- src/lib/server/features/project/: core, command, query実装
- src/lib/server/features/task/: core, policy, command, query実装
- src/lib/server/features/pomodoro-session/: core, command, query実装
- src/lib/server/features/analytics/: core, query実装

**Flows**:
- src/lib/server/flows/register-and-login/handler.ts
- src/lib/server/flows/create-task-with-project/handler.ts
- src/lib/server/flows/start-pomodoro-for-task/handler.ts

**Port/Adapter**:
- src/lib/server/shared/port/repository/: 各Repositoryインターフェース
- src/lib/server/shared/port/service/: authService, emailServiceインターフェース
- src/lib/server/adapter/repository/: 各Repository Prisma実装
- src/lib/server/adapter/service/: authService実装

**Routes**:
- src/routes/(auth)/: login, register, reset-password
- src/routes/(app)/: +layout.server.ts（認証チェック）, +page.svelte/server.ts

### 3.5 テストケース

- **core/ユニット**: 
  - createUser: 有効なメールアドレスでユーザー作成（期待: ユーザーオブジェクト）
  - createProject: 色コード検証（期待: 有効な色のみ受付）
  - エッジ: 無効なメールアドレス、空のパスワード

- **command/query/ユニット**:
  - register: メール重複チェック（Repositoryモック使用）
  - start-session: タスク存在確認（Repositoryモック使用）
  
- **flows/統合**:
  - register-and-login: ユーザー作成からログインまでの一連の流れ
  - start-pomodoro-for-task: タスクステータス更新とセッション開始

- **adapter/契約**:
  - UserRepositoryPrisma: Testcontainerでユーザー作成・取得
  - AuthService: パスワードハッシュ化・検証

- **エッジケース**:
  - 既存メールアドレスでの登録
  - 存在しないタスクでのセッション開始
  - 同時に複数セッション開始の制限

## 4. 実装方法

### 4.1 全体アプローチ

アーキテクチャ原則に従い、以下の順序で実装を進める：
1. Prismaスキーマ定義とDB初期化
2. core/とport/の設計・実装（純粋関数とインターフェース）
3. adapter/の実装（DB操作、認証サービス）
4. command/query/の実装（UseCase層）
5. flows/の実装（複数ドメインのオーケストレーション）
6. routes/の実装（ページとサーバーサイド処理）
7. テスト実装

### 4.2 依存関係

- 依存ライブラリ: Prisma（ORM）, bcrypt（パスワードハッシュ）, zod（入力検証）
- SvelteKit: フレームワーク
- 内部依存: Auth → User, Task → Project/User, PomodoroSession → Task/Project/User

### 4.3 コード生成ガイドライン

- TypeScript厳密モード使用
- ESLint/Prettier準拠
- core/は純粋関数のみ（副作用ゼロ）
- handler.tsでの直接インスタンス使用（DIコンテナは将来実装）
- PrismaモデルはReadonly型として再利用
- 1ファイル200行以内を目標

## 5. 懸念点と潜在リスク

- **依存方向違反**: features間の直接import（eslint-plugin-boundariesで監視）
- **副作用の混入**: core/に日時取得やUUID生成が入る可能性（レビューで検出）
- **認証実装の複雑性**: セッション管理とCSRF対策の適切な実装
- **タイマー精度**: ブラウザタブが非アクティブ時のタイマー動作
- **同時実行制御**: 複数タブでの同時セッション開始の制御
- **データ整合性**: タスク削除時のセッション履歴の扱い

## 6. 確認事項と検証結果

| 項目カテゴリ     | 結果 (Passed/Failed) | コメント・残課題 |
|------------------|----------------------|------------------|
| テストカバレッジ | 未実施               | 実装後に80%以上を目標 |
| アーキテクチャ遵守 | 未実施             | 依存方向、行数制限の確認 |
| ドキュメント    | 未実施               | コードコメント、README作成 |