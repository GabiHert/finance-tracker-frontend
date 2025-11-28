import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginScreen, RegisterScreen } from '@main/features/auth'
import { TestComponentsScreen } from '@main/features/test-components'
import { CategoriesScreen } from '@main/features/categories'
import { TransactionsScreen } from '@main/features/transactions'
import { RulesScreen } from '@main/features/rules'
import { GoalsScreen } from '@main/features/goals'
import { DashboardScreen } from '@main/features/dashboard'
import { GroupsScreen, GroupDetailScreen } from '@main/features/groups'

function ForgotPasswordPlaceholder() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-background)]">
			<div className="w-full max-w-md text-center">
				<h1 className="text-2xl font-bold text-[var(--color-text)] mb-4">
					Esqueceu a senha?
				</h1>
				<p className="text-[var(--color-text-secondary)]">
					Esta página será implementada em breve.
				</p>
			</div>
		</div>
	)
}

function DashboardPlaceholder() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[var(--color-background)]">
			<header className="text-center">
				<h1 className="text-4xl font-bold text-[var(--color-primary)] mb-4">
					Finance Tracker
				</h1>
				<p className="text-lg text-[var(--color-text-secondary)] mb-8">
					Gerencie suas financas de forma simples e eficiente
				</p>
			</header>

			<main className="w-full max-w-md">
				<div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-lg p-6 border border-[var(--color-border)]">
					<h2 className="text-xl font-semibold mb-4 text-[var(--color-text)]">
						Bem-vindo
					</h2>
					<p className="text-[var(--color-text-secondary)]">
						Sua aplicacao de controle financeiro esta pronta para uso.
					</p>
				</div>
			</main>

			<footer className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
				<p>Finance Tracker &copy; {new Date().getFullYear()}</p>
			</footer>
		</div>
	)
}

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<LoginScreen />} />
				<Route path="/register" element={<RegisterScreen />} />
				<Route path="/forgot-password" element={<ForgotPasswordPlaceholder />} />
				<Route path="/dashboard" element={<DashboardScreen />} />
				<Route path="/test/components" element={<TestComponentsScreen />} />
				<Route path="/categories" element={<CategoriesScreen />} />
				<Route path="/transactions" element={<TransactionsScreen />} />
				<Route path="/rules" element={<RulesScreen />} />
				<Route path="/goals" element={<GoalsScreen />} />
				<Route path="/groups" element={<GroupsScreen />} />
				<Route path="/groups/:groupId" element={<GroupDetailScreen />} />
				<Route path="/" element={<Navigate to="/login" replace />} />
				<Route path="*" element={<Navigate to="/login" replace />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App
