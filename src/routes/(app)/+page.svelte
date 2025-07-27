<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let showProjectForm = false;
	let showTaskForm = false;
	let selectedProjectId = '';
	let timerInterval: ReturnType<typeof setInterval> | null = null;
	let remainingTime = 0;

	$: activeSession = data.activeSession;
	$: if (activeSession) {
		startTimer();
	} else {
		stopTimer();
	}

	function startTimer() {
		if (!activeSession) return;
		
		const elapsed = Math.floor((Date.now() - new Date(activeSession.startedAt).getTime()) / 1000);
		remainingTime = Math.max(0, activeSession.duration * 60 - elapsed);
		
		if (timerInterval) clearInterval(timerInterval);
		
		timerInterval = setInterval(() => {
			remainingTime--;
			if (remainingTime <= 0) {
				stopTimer();
			}
		}, 1000);
	}

	function stopTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	}

	function formatTime(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	}

	onDestroy(() => {
		stopTimer();
	});
</script>

<div class="min-h-screen bg-gray-50">
	<!-- ヘッダー -->
	<header class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div class="flex justify-between items-center">
				<h1 class="text-3xl font-bold text-gray-900">CyberFocus</h1>
				<div class="flex items-center space-x-4">
					<span class="text-sm text-gray-600">{data.user.email}</span>
					<a href="/analytics" class="text-indigo-600 hover:text-indigo-900">分析</a>
					<form method="POST" action="/logout" use:enhance>
						<button type="submit" class="text-gray-600 hover:text-gray-900">ログアウト</button>
					</form>
				</div>
			</div>
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- プロジェクト一覧 -->
			<div class="lg:col-span-1">
				<div class="bg-white rounded-lg shadow p-6">
					<div class="flex justify-between items-center mb-4">
						<h2 class="text-xl font-semibold">プロジェクト</h2>
						<button
							on:click={() => showProjectForm = !showProjectForm}
							class="text-indigo-600 hover:text-indigo-900"
						>
							+
						</button>
					</div>

					{#if showProjectForm}
						<form method="POST" action="?/createProject" use:enhance class="mb-4">
							<input
								name="name"
								type="text"
								placeholder="プロジェクト名"
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
							/>
							<input
								name="color"
								type="color"
								value="#000000"
								class="w-full h-10 mb-2"
							/>
							<input
								name="targetPomodoros"
								type="number"
								placeholder="目標ポモドーロ数"
								min="0"
								max="100"
								class="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
							/>
							<button
								type="submit"
								class="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
							>
								作成
							</button>
						</form>
					{/if}

					<div class="space-y-2">
						{#each data.projects as project}
							<button
								on:click={() => selectedProjectId = project.id}
								class="w-full text-left p-3 rounded-md hover:bg-gray-50 flex items-center justify-between"
								class:bg-gray-100={selectedProjectId === project.id}
							>
								<div class="flex items-center">
									<div 
										class="w-4 h-4 rounded mr-3"
										style="background-color: {project.color}"
									></div>
									<span>{project.name}</span>
								</div>
								<span class="text-sm text-gray-500">
									目標: {project.targetPomodoros}
								</span>
							</button>
						{/each}
					</div>
				</div>
			</div>

			<!-- タスク一覧とタイマー -->
			<div class="lg:col-span-2">
				<!-- ポモドーロタイマー -->
				{#if activeSession}
					<div class="bg-white rounded-lg shadow p-6 mb-8">
						<h2 class="text-xl font-semibold mb-4">
							{activeSession.type === 'work' ? '作業中' : '休憩中'}
						</h2>
						<div class="text-6xl font-mono text-center mb-4">
							{formatTime(remainingTime)}
						</div>
						<form method="POST" action="?/completePomodoro" use:enhance>
							<input type="hidden" name="sessionId" value={activeSession.id} />
							<button
								type="submit"
								class="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700"
							>
								完了
							</button>
						</form>
					</div>
				{/if}

				<!-- タスク一覧 -->
				<div class="bg-white rounded-lg shadow p-6">
					<div class="flex justify-between items-center mb-4">
						<h2 class="text-xl font-semibold">タスク</h2>
						<button
							on:click={() => showTaskForm = !showTaskForm}
							class="text-indigo-600 hover:text-indigo-900"
							disabled={!selectedProjectId}
						>
							+
						</button>
					</div>

					{#if showTaskForm && selectedProjectId}
						<form method="POST" action="?/createTask" use:enhance class="mb-4">
							<input type="hidden" name="projectId" value={selectedProjectId} />
							<input
								name="title"
								type="text"
								placeholder="タスク名"
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
							/>
							<textarea
								name="description"
								placeholder="説明（任意）"
								class="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
							></textarea>
							<input
								name="estimatedPomodoros"
								type="number"
								placeholder="予想ポモドーロ数"
								min="1"
								max="20"
								value="1"
								class="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
							/>
							<button
								type="submit"
								class="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
							>
								作成
							</button>
						</form>
					{/if}

					<div class="space-y-2">
						{#each data.tasks.filter(t => !selectedProjectId || t.projectId === selectedProjectId) as task}
							<div class="p-4 border rounded-lg">
								<div class="flex justify-between items-start">
									<div class="flex-1">
										<h3 class="font-semibold">{task.title}</h3>
										{#if task.description}
											<p class="text-sm text-gray-600 mt-1">{task.description}</p>
										{/if}
										<div class="flex items-center mt-2 space-x-4">
											<span class="text-sm text-gray-500">
												{task.completedPomodoros}/{task.estimatedPomodoros} ポモドーロ
											</span>
											<span class="text-sm text-gray-500">
												進捗: {task.progress}%
											</span>
										</div>
									</div>
									<div class="flex items-center space-x-2">
										{#if task.status !== 'completed' && !activeSession}
											<form method="POST" action="?/startPomodoro" use:enhance>
												<input type="hidden" name="taskId" value={task.id} />
												<button
													type="submit"
													class="text-green-600 hover:text-green-900"
												>
													開始
												</button>
											</form>
										{/if}
										<form method="POST" action="?/toggleTask" use:enhance>
											<input type="hidden" name="taskId" value={task.id} />
											<button
												type="submit"
												class="text-indigo-600 hover:text-indigo-900"
											>
												{task.status === 'completed' ? '未完了に戻す' : '完了'}
											</button>
										</form>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</main>
</div>