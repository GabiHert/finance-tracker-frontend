import { DonutChart } from '@main/features/dashboard/components/DonutChart'
import { TrendsChart } from '@main/features/dashboard/components/TrendsChart'
import { PeriodSelector, type DateRange } from '@main/features/dashboard/components/PeriodSelector'
import { formatCurrency, formatPercentage } from '@main/features/dashboard/types'
import type { Period } from '@main/features/dashboard/types'
import { MemberContributionChart } from './MemberContributionChart'
import { getIconComponent } from '@main/components/ui/IconPicker'
import type { GroupDashboardData } from '../types'

interface GroupDashboardTabProps {
	data: GroupDashboardData | null
	period: Period
	onPeriodChange: (period: Period) => void
	customDateRange?: DateRange
	onCustomDateRangeChange?: (range: DateRange) => void
	onRefresh: () => void
	isLoading: boolean
}

function RefreshIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="w-4 h-4"
		>
			<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
			<path d="M3 3v5h5" />
			<path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
			<path d="M16 16h5v5" />
		</svg>
	)
}

interface MetricCardProps {
	testId: string
	label: string
	value: number
	change?: number
	type: 'income' | 'expenses' | 'balance' | 'members'
	isCurrency?: boolean
}

function MetricCard({ testId, label, value, change, type, isCurrency = true }: MetricCardProps) {
	const getColorClass = () => {
		switch (type) {
			case 'income':
				return 'text-green-500'
			case 'expenses':
				return 'text-red-500'
			case 'balance':
				return value >= 0 ? 'text-green-500' : 'text-red-500'
			case 'members':
				return 'text-[var(--color-primary)]'
			default:
				return 'text-[var(--color-text)]'
		}
	}

	return (
		<div
			data-testid={`metric-card-${testId}`}
			className="p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]"
		>
			<p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
			<p className={`text-2xl font-bold ${getColorClass()}`}>
				{isCurrency ? formatCurrency(value) : value}
			</p>
			{change !== undefined && (
				<p className={`text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
					{formatPercentage(change)} vs periodo anterior
				</p>
			)}
		</div>
	)
}

export function GroupDashboardTab({
	data,
	period,
	onPeriodChange,
	customDateRange,
	onCustomDateRangeChange,
	onRefresh,
	isLoading,
}: GroupDashboardTabProps) {
	if (!data || (data.summary.totalExpenses === 0 && data.summary.totalIncome === 0 && data.memberBreakdown.length === 0)) {
		return (
			<div className="space-y-6">
				{/* Header with Period Selector */}
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-medium text-[var(--color-text)]">Visao Geral</h2>
					<div className="flex items-center gap-2">
						<PeriodSelector
							value={period}
							onChange={onPeriodChange}
							customDateRange={customDateRange}
							onCustomDateRangeChange={onCustomDateRangeChange}
						/>
						<button
							onClick={onRefresh}
							disabled={isLoading}
							className="p-2 rounded-lg hover:bg-[var(--color-background)] text-[var(--color-text-secondary)]"
							title="Atualizar"
						>
							<RefreshIcon />
						</button>
					</div>
				</div>

				<div data-testid="group-dashboard-empty" className="text-center py-12">
					<div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-background)] rounded-full flex items-center justify-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className="w-8 h-8 text-[var(--color-text-secondary)]"
						>
							<path d="M3 3v18h18" />
							<path d="m19 9-5 5-4-4-3 3" />
						</svg>
					</div>
					<h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
						Nenhum dado disponivel
					</h3>
					<p className="text-[var(--color-text-secondary)]">
						Adicione transacoes para ver o resumo do grupo
					</p>
				</div>
			</div>
		)
	}

	// Transform data for dashboard components
	const categoryBreakdown = data.categoryBreakdown.map((cat) => ({
		categoryId: cat.categoryId,
		categoryName: cat.categoryName,
		categoryColor: cat.categoryColor,
		amount: cat.amount,
		percentage: cat.percentage,
	}))

	const trendsData = data.trends.map((t) => ({
		date: t.date,
		income: t.income,
		expenses: t.expenses,
	}))

	return (
		<div data-testid="group-summary" className="space-y-6">
			{/* Header with Period Selector */}
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-medium text-[var(--color-text)]">Visao Geral</h2>
				<div className="flex items-center gap-2">
					<PeriodSelector
						value={period}
						onChange={onPeriodChange}
						customDateRange={customDateRange}
						onCustomDateRangeChange={onCustomDateRangeChange}
					/>
					<button
						onClick={onRefresh}
						disabled={isLoading}
						className={`p-2 rounded-lg hover:bg-[var(--color-background)] text-[var(--color-text-secondary)] ${
							isLoading ? 'animate-spin' : ''
						}`}
						title="Atualizar"
					>
						<RefreshIcon />
					</button>
				</div>
			</div>

			{/* Metric Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<MetricCard
					testId="expenses"
					label="Despesas"
					value={data.summary.totalExpenses}
					change={data.summary.expensesChange}
					type="expenses"
				/>
				<MetricCard
					testId="income"
					label="Receitas"
					value={data.summary.totalIncome}
					change={data.summary.incomeChange}
					type="income"
				/>
				<MetricCard
					testId="balance"
					label="Saldo"
					value={data.summary.netBalance}
					type="balance"
				/>
				<MetricCard
					testId="members"
					label="Membros Ativos"
					value={data.summary.memberCount}
					type="members"
					isCurrency={false}
				/>
			</div>

			{/* Charts Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{trendsData.length > 0 ? (
					<TrendsChart data={trendsData} />
				) : (
					<div
						data-testid="trends-chart"
						className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4"
					>
						<h3 className="text-lg font-medium text-[var(--color-text)] mb-4">
							Evolucao Financeira
						</h3>
						<div className="text-center py-8 text-[var(--color-text-secondary)]">
							Sem dados suficientes para o grafico
						</div>
					</div>
				)}
				{categoryBreakdown.length > 0 ? (
					<DonutChart data={categoryBreakdown} />
				) : (
					<div
						data-testid="category-donut"
						className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4"
					>
						<h3 className="text-lg font-medium text-[var(--color-text)] mb-4">
							Despesas por Categoria
						</h3>
						<div className="text-center py-8 text-[var(--color-text-secondary)]">
							Nenhuma despesa no periodo
						</div>
					</div>
				)}
			</div>

			{/* Member Contribution */}
			<MemberContributionChart data={data.memberBreakdown} />

			{/* Recent Transactions */}
			<div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4">
				<h3 className="text-lg font-medium text-[var(--color-text)] mb-4">
					Transacoes Recentes do Grupo
				</h3>
				{data.recentTransactions.length === 0 ? (
					<div className="text-center py-8 text-[var(--color-text-secondary)]">
						Nenhuma transacao recente
					</div>
				) : (
					<div className="space-y-3">
						{data.recentTransactions.slice(0, 5).map((tx) => {
							const IconComponent = getIconComponent(tx.categoryIcon || 'folder')
							return (
								<div key={tx.id} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
									<div className="flex items-center gap-3">
										<div
											className="w-10 h-10 rounded-full flex items-center justify-center"
											style={{ backgroundColor: `${tx.categoryColor}20`, color: tx.categoryColor }}
										>
											<IconComponent className="w-5 h-5" />
										</div>
										<div>
											<p className="text-sm font-medium text-[var(--color-text)]">
												{tx.description}
											</p>
											<p className="text-xs text-[var(--color-text-secondary)]">
												{tx.categoryName} - por {tx.memberName}
											</p>
										</div>
									</div>
									<span className={`text-sm font-medium ${tx.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
										{formatCurrency(tx.amount, true)}
									</span>
								</div>
							)
						})}
					</div>
				)}
			</div>
		</div>
	)
}

export default GroupDashboardTab
