import { useState, useCallback, useEffect } from 'react'
import { Button } from '@main/components/ui/Button'
import { MetricCard } from './components/MetricCard'
import { PeriodSelector, type DateRange } from './components/PeriodSelector'
import { DonutChart } from './components/DonutChart'
import { TrendsChart } from './components/TrendsChart'
import { RecentTransactions } from './components/RecentTransactions'
import { GoalsProgress } from './components/GoalsProgress'
import { AlertsBanner } from './components/AlertsBanner'
import { fetchDashboardData, type DashboardData, type CustomDateRange } from './api/dashboard'
import { CreditCardStatusCard, getCreditCardStatus, type CreditCardStatus } from '@main/features/credit-card'
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

/**
 * Convert DD/MM/YYYY to YYYY-MM-DD format
 */
function convertDateFormat(dateStr: string): string {
	if (!dateStr) return ''
	const [day, month, year] = dateStr.split('/')
	if (!day || !month || !year) return ''
	return `${year}-${month}-${day}`
}

/**
 * Get current month in YYYY-MM format
 */
function getCurrentMonth(): string {
	const now = new Date()
	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, '0')
	return `${year}-${month}`
}

export function DashboardScreen() {
	const [period, setPeriod] = useState<Period>('this_month')
	const [customDateRange, setCustomDateRange] = useState<DateRange>({
		startDate: '',
		endDate: '',
	})
	const [isLoading, setIsLoading] = useState(true)
	const [lastUpdated, setLastUpdated] = useState(new Date())
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [ccStatus, setCcStatus] = useState<CreditCardStatus | null>(null)

	const loadDashboardData = useCallback(async () => {
		setIsLoading(true)
		setError(null)
		try {
			let options: { period: Period; customDateRange?: CustomDateRange }

			if (period === 'custom' && customDateRange.startDate && customDateRange.endDate) {
				// Convert DD/MM/YYYY to YYYY-MM-DD for API
				options = {
					period,
					customDateRange: {
						startDate: convertDateFormat(customDateRange.startDate),
						endDate: convertDateFormat(customDateRange.endDate),
					},
				}
			} else {
				options = { period }
			}

			const [data, creditCardStatus] = await Promise.all([
				fetchDashboardData(options),
				getCreditCardStatus().catch(() => null), // Don't fail if CC status fails
			])
			setDashboardData(data)
			setCcStatus(creditCardStatus)
			setLastUpdated(new Date())
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard')
		} finally {
			setIsLoading(false)
		}
	}, [period, customDateRange])

	useEffect(() => {
		// Only load if not custom, or if custom and both dates are set
		if (period !== 'custom' || (customDateRange.startDate && customDateRange.endDate)) {
			loadDashboardData()
		}
	}, [loadDashboardData, period, customDateRange])

	const handleRefresh = useCallback(() => {
		loadDashboardData()
	}, [loadDashboardData])

	// Default empty values when data is loading
	const summary = dashboardData?.summary ?? {
		totalBalance: 0,
		totalIncome: 0,
		totalExpenses: 0,
		netSavings: 0,
	}
	const categoryBreakdown = dashboardData?.categoryBreakdown ?? []
	const trendsData = dashboardData?.trendsData ?? []
	const recentTransactions = dashboardData?.recentTransactions ?? []
	const goalsProgress = dashboardData?.goalsProgress ?? []
	const alerts = dashboardData?.alerts ?? []

	const formatLastUpdated = (date: Date) => {
		return new Intl.DateTimeFormat('pt-BR', {
			hour: '2-digit',
			minute: '2-digit',
		}).format(date)
	}

	// Get user name from localStorage
	const getUserName = (): string => {
		try {
			const userJson = localStorage.getItem('user')
			if (userJson) {
				const user = JSON.parse(userJson)
				return user.name || 'Usuario'
			}
		} catch {
			console.error('Failed to parse user data')
		}
		return 'Usuario'
	}
	const userName = getUserName()

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
						<PeriodSelector
							value={period}
							onChange={setPeriod}
							customDateRange={customDateRange}
							onCustomDateRangeChange={setCustomDateRange}
						/>
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

				{/* Error Banner */}
				{error && (
					<div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
						<p>{error}</p>
						<button
							onClick={handleRefresh}
							className="mt-2 text-sm underline hover:no-underline"
						>
							Tentar novamente
						</button>
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

				{/* Credit Card Status Card */}
				{ccStatus && (
					<div className="mb-6">
						<CreditCardStatusCard
							status={ccStatus}
							month={getCurrentMonth()}
						/>
					</div>
				)}

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
