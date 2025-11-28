import { useState, useCallback } from 'react'
import { Button } from '@main/components/ui/Button'
import { MetricCard } from './components/MetricCard'
import { PeriodSelector } from './components/PeriodSelector'
import { DonutChart } from './components/DonutChart'
import { TrendsChart } from './components/TrendsChart'
import { RecentTransactions } from './components/RecentTransactions'
import { GoalsProgress } from './components/GoalsProgress'
import { AlertsBanner } from './components/AlertsBanner'
import {
	mockSummary,
	mockCategoryBreakdown,
	mockTrendsData,
	mockRecentTransactions,
	mockGoalsProgress,
	mockAlerts,
} from './mock-data'
import type { Period } from './types'

function RefreshIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
			<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
			<path d="M3 3v5h5" />
			<path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
			<path d="M16 21h5v-5" />
		</svg>
	)
}

export function DashboardScreen() {
	const [period, setPeriod] = useState<Period>('this_month')
	const [isLoading, setIsLoading] = useState(false)
	const [lastUpdated, setLastUpdated] = useState(new Date())

	// Use mock data
	const summary = mockSummary
	const categoryBreakdown = mockCategoryBreakdown
	const trendsData = mockTrendsData
	const recentTransactions = mockRecentTransactions
	const goalsProgress = mockGoalsProgress
	const alerts = mockAlerts

	const handleRefresh = useCallback(() => {
		setIsLoading(true)
		// Simulate API call
		setTimeout(() => {
			setIsLoading(false)
			setLastUpdated(new Date())
		}, 500)
	}, [])

	const formatLastUpdated = (date: Date) => {
		return new Intl.DateTimeFormat('pt-BR', {
			hour: '2-digit',
			minute: '2-digit',
		}).format(date)
	}

	// Get user name (mock for now)
	const userName = 'Usuario'

	return (
		<div data-testid="dashboard-screen" className="min-h-screen p-6 bg-[var(--color-background)]">
			{isLoading && (
				<div
					data-testid="loading-indicator"
					className="fixed top-0 left-0 right-0 h-1 bg-[var(--color-primary)] animate-pulse"
				/>
			)}

			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
					<div>
						<h1 data-testid="user-greeting" className="text-2xl font-bold text-[var(--color-text)]">
							Ola, {userName}
						</h1>
						<p data-testid="last-updated" className="text-sm text-[var(--color-text-secondary)]">
							Ultima atualizacao: {formatLastUpdated(lastUpdated)}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<PeriodSelector value={period} onChange={setPeriod} />
						<Button
							data-testid="refresh-btn"
							variant="secondary"
							size="sm"
							onClick={handleRefresh}
							disabled={isLoading}
						>
							<RefreshIcon />
						</Button>
					</div>
				</div>

				{/* Alerts Banner */}
				{alerts.length > 0 && (
					<div className="mb-6">
						<AlertsBanner alerts={alerts} />
					</div>
				)}

				{/* Metric Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
					<MetricCard
						testId="balance"
						label="Saldo Total"
						value={summary.totalBalance}
						type="balance"
					/>
					<MetricCard
						testId="income"
						label="Receitas"
						value={summary.totalIncome}
						change={summary.incomeChange}
						type="income"
					/>
					<MetricCard
						testId="expenses"
						label="Despesas"
						value={summary.totalExpenses}
						change={summary.expensesChange}
						type="expenses"
					/>
					<MetricCard
						testId="savings"
						label="Economia"
						value={summary.netSavings}
						change={summary.savingsChange}
						type="savings"
					/>
				</div>

				{/* Charts Row */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
					<div className="lg:col-span-2">
						<TrendsChart data={trendsData} />
					</div>
					<div>
						<DonutChart data={categoryBreakdown} />
					</div>
				</div>

				{/* Recent Transactions and Goals */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<RecentTransactions transactions={recentTransactions} />
					<GoalsProgress goals={goalsProgress} />
				</div>
			</div>
		</div>
	)
}

export default DashboardScreen
