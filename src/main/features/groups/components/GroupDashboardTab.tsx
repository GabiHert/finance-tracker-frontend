import type { GroupSummary } from '../types'

interface GroupDashboardTabProps {
	summary: GroupSummary | null
}

function formatCurrency(value: number): string {
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	}).format(value)
}

export function GroupDashboardTab({ summary }: GroupDashboardTabProps) {
	if (!summary) {
		return (
			<div
				data-testid="group-dashboard-empty"
				className="text-center py-12"
			>
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
		)
	}

	return (
		<div data-testid="group-summary" className="space-y-6">
			<div className="grid gap-4 md:grid-cols-3">
				<div className="p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
					<p className="text-sm text-[var(--color-text-secondary)]">Total Despesas</p>
					<p className="text-2xl font-bold text-red-500">
						{formatCurrency(summary.totalExpenses)}
					</p>
				</div>
				<div className="p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
					<p className="text-sm text-[var(--color-text-secondary)]">Total Receitas</p>
					<p className="text-2xl font-bold text-green-500">
						{formatCurrency(summary.totalIncome)}
					</p>
				</div>
				<div className="p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
					<p className="text-sm text-[var(--color-text-secondary)]">Saldo</p>
					<p className={`text-2xl font-bold ${summary.netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
						{formatCurrency(summary.netBalance)}
					</p>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<div className="p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
					<h3 className="font-medium text-[var(--color-text)] mb-4">Despesas por Membro</h3>
					<div className="space-y-3">
						{summary.expensesByMember.map((member) => (
							<div key={member.memberId} className="flex items-center justify-between">
								<span className="text-[var(--color-text)]">{member.memberName}</span>
								<span className="text-[var(--color-text-secondary)]">
									{formatCurrency(member.total)}
								</span>
							</div>
						))}
					</div>
				</div>

				<div className="p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
					<h3 className="font-medium text-[var(--color-text)] mb-4">Despesas por Categoria</h3>
					<div className="space-y-3">
						{summary.expensesByCategory.map((category) => (
							<div key={category.categoryId} className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span
										className="w-3 h-3 rounded-full"
										style={{ backgroundColor: category.categoryColor }}
									/>
									<span className="text-[var(--color-text)]">{category.categoryName}</span>
								</div>
								<span className="text-[var(--color-text-secondary)]">
									{formatCurrency(category.total)}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

export default GroupDashboardTab
