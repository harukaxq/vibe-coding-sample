<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
	<div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
		<div>
			<h2 class="text-center text-3xl font-extrabold text-gray-900">CyberFocus</h2>
			<p class="mt-2 text-center text-sm text-gray-600">アカウント登録</p>
		</div>

		<form method="POST" use:enhance class="mt-8 space-y-6">
			{#if form?.error}
				<div class="rounded-md bg-red-50 p-4">
					<p class="text-sm text-red-800">{form.error}</p>
				</div>
			{/if}

			<div class="space-y-4">
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700">
						お名前（任意）
					</label>
					<input
						id="name"
						name="name"
						type="text"
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
					/>
				</div>

				<div>
					<label for="email" class="block text-sm font-medium text-gray-700">
						メールアドレス
					</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700">
						パスワード
					</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
					/>
					<p class="mt-1 text-xs text-gray-500">8文字以上、英字と数字を含む</p>
				</div>
			</div>

			<div>
				<button
					type="submit"
					class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				>
					登録
				</button>
			</div>

			<div class="text-sm text-center">
				<a href="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
					既にアカウントをお持ちの方はこちら
				</a>
			</div>
		</form>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
	}
</style>