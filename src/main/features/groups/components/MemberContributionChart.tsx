import type { GroupMemberBreakdown } from '../types'

interface MemberContributionChartProps {
	data: GroupMemberBreakdown[]
}

function formatCurrency(value: number): string {
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	}).format(value)
}

export function MemberContributionChart({ data }: MemberContributionChartProps) {
	if (data.length === 0) {
		return (
			<div
				data-testid="member-contribution-chart"
				className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4"
			>
				<h3 className="text-lg font-medium text-[var(--color-text)] mb-4">
					Contribuicao por Membro
				</h3>
				<div className="text-center py-8 text-[var(--color-text-secondary)]">
					Nenhuma despesa no periodo
				</div>
			</div>
		)
	}

	const maxTotal = Math.max(...data.map((m) => m.total))

	return (
		<div
			data-testid="member-contribution-chart"
			className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4"
		>
			<h3 className="text-lg font-medium text-[var(--color-text)] mb-4">
				Contribuicao por Membro
			</h3>
			<div className="space-y-4">
				{data.map((member) => (
					<div key={member.memberId} className="space-y-1">
						<div className="flex items-center justify-between text-sm">
							<div className="flex items-center gap-2">
								<div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs">
									{member.avatarUrl ? (
										<img
											src={member.avatarUrl}
											alt=""
											className="w-full h-full rounded-full"
										/>
									) : (
										member.memberName.charAt(0).toUpperCase()
									)}
								</div>
								<span className="text-[var(--color-text)]">{member.memberName}</span>
								<span className="text-[var(--color-text-secondary)] text-xs">
									({member.transactionCount} transacoes)
								</span>
							</div>
							<span className="text-[var(--color-text-secondary)]">
								{formatCurrency(member.total)} ({member.percentage.toFixed(1)}%)
							</span>
						</div>
						<div className="h-2 bg-[var(--color-background)] rounded-full overflow-hidden">
							<div
								className="h-full bg-[var(--color-primary)] rounded-full transition-all"
								style={{ width: `${(member.total / maxTotal) * 100}%` }}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default MemberContributionChart
