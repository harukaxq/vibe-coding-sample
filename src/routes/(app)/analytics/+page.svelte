<script lang="ts">
	import type { PageData } from './$types';
	
	export let data: PageData;
	
	function getDayOfWeek(date: Date): string {
		const days = ['日', '月', '火', '水', '木', '金', '土'];
		return days[date.getDay()];
	}
	
	function getMonthName(month: number): string {
		const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
		return months[month - 1];
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- ヘッダー -->
	<header class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div class="flex justify-between items-center">
				<h1 class="text-3xl font-bold text-gray-900">生産性分析</h1>
				<a href="/" class="text-indigo-600 hover:text-indigo-900">戻る</a>
			</div>
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- カレンダー -->
			<div class="bg-white rounded-lg shadow p-6">
				<h2 class="text-xl font-semibold mb-4">
					{data.calendarData.year}年 {getMonthName(data.calendarData.month)}
				</h2>
				
				<div class="grid grid-cols-7 gap-1">
					<!-- 曜日ヘッダー -->
					{#each ['日', '月', '火', '水', '木', '金', '土'] as day}
						<div class="text-center text-sm font-medium text-gray-500 p-2">
							{day}
						</div>
					{/each}
					
					<!-- 月初の空白セル -->
					{#each Array(new Date(data.calendarData.year, data.calendarData.month - 1, 1).getDay()) as _}
						<div class="p-2"></div>
					{/each}
					
					<!-- 日付セル -->
					{#each data.calendarData.days as day}
						<div class="border rounded p-2 min-h-[80px]">
							<div class="text-sm font-medium">
								{day.date.getDate()}
							</div>
							{#if day.completedPomodoros > 0}
								<div class="mt-1">
									<div class="text-xs text-green-600 font-semibold">
										{day.completedPomodoros} 🍅
									</div>
									<div class="text-xs text-gray-500">
										{day.totalMinutes}分
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<!-- プロジェクト進捗 -->
			<div class="bg-white rounded-lg shadow p-6">
				<h2 class="text-xl font-semibold mb-4">週間プロジェクト進捗</h2>
				
				<div class="space-y-4">
					{#each data.projectProgress as project}
						<div>
							<div class="flex justify-between items-center mb-1">
								<div class="flex items-center">
									<div 
										class="w-3 h-3 rounded mr-2"
										style="background-color: {project.color}"
									></div>
									<span class="font-medium">{project.projectName}</span>
								</div>
								<span class="text-sm text-gray-500">
									{project.completedPomodoros}/{project.targetPomodoros}
								</span>
							</div>
							
							<div class="w-full bg-gray-200 rounded-full h-2.5">
								<div 
									class="bg-green-600 h-2.5 rounded-full"
									style="width: {project.progressPercentage}%"
								></div>
							</div>
							
							<div class="flex justify-between items-center mt-1">
								<span class="text-xs text-gray-500">
									進捗: {project.progressPercentage}%
								</span>
								<span class="text-xs text-gray-500">
									残り: {project.remainingPomodoros}
								</span>
							</div>
						</div>
					{/each}
					
					{#if data.projectProgress.length === 0}
						<p class="text-gray-500">プロジェクトがありません</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- 統計サマリー -->
		<div class="mt-8 bg-white rounded-lg shadow p-6">
			<h2 class="text-xl font-semibold mb-4">今月の統計</h2>
			
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div>
					<p class="text-sm text-gray-500">合計ポモドーロ数</p>
					<p class="text-3xl font-bold text-indigo-600">
						{data.calendarData.days.reduce((sum, day) => sum + day.completedPomodoros, 0)}
					</p>
				</div>
				
				<div>
					<p class="text-sm text-gray-500">合計作業時間</p>
					<p class="text-3xl font-bold text-indigo-600">
						{Math.round(data.calendarData.days.reduce((sum, day) => sum + day.totalMinutes, 0) / 60)}時間
					</p>
				</div>
				
				<div>
					<p class="text-sm text-gray-500">平均ポモドーロ数/日</p>
					<p class="text-3xl font-bold text-indigo-600">
						{(data.calendarData.days.reduce((sum, day) => sum + day.completedPomodoros, 0) / data.calendarData.days.length).toFixed(1)}
					</p>
				</div>
			</div>
		</div>
	</main>
</div>