import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginScreen, RegisterScreen, ForgotPasswordScreen, ResetPasswordScreen } from '@main/features/auth'
import { TestComponentsScreen } from '@main/features/test-components'
import { CategoriesScreen } from '@main/features/categories'
import { TransactionsScreen } from '@main/features/transactions'
import { RulesScreen } from '@main/features/rules'
import { GoalsScreen } from '@main/features/goals'
import { DashboardScreen } from '@main/features/dashboard'
import { GroupsScreen, GroupDetailScreen } from '@main/features/groups'
import { SettingsScreen } from '@main/features/settings'
import { AppLayout, ToastProvider } from '@main/components/layout'

function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
	const token = localStorage.getItem('access_token')

	if (!token) {
		return <Navigate to="/login" replace />
	}

	return (
		<AppLayout>
			{children}
		</AppLayout>
	)
}

function App() {
	return (
		<BrowserRouter>
			<ToastProvider>
				<Routes>
					{/* Public routes */}
					<Route path="/login" element={<LoginScreen />} />
					<Route path="/register" element={<RegisterScreen />} />
					<Route path="/forgot-password" element={<ForgotPasswordScreen />} />
					<Route path="/reset-password" element={<ResetPasswordScreen />} />

					{/* Authenticated routes with AppLayout */}
					<Route path="/dashboard" element={<AuthenticatedRoute><DashboardScreen /></AuthenticatedRoute>} />
					<Route path="/test/components" element={<AuthenticatedRoute><TestComponentsScreen /></AuthenticatedRoute>} />
					<Route path="/categories" element={<AuthenticatedRoute><CategoriesScreen /></AuthenticatedRoute>} />
					<Route path="/transactions" element={<AuthenticatedRoute><TransactionsScreen /></AuthenticatedRoute>} />
					<Route path="/rules" element={<AuthenticatedRoute><RulesScreen /></AuthenticatedRoute>} />
					<Route path="/goals" element={<AuthenticatedRoute><GoalsScreen /></AuthenticatedRoute>} />
					<Route path="/groups" element={<AuthenticatedRoute><GroupsScreen /></AuthenticatedRoute>} />
					<Route path="/groups/:groupId" element={<AuthenticatedRoute><GroupDetailScreen /></AuthenticatedRoute>} />
					<Route path="/settings" element={<AuthenticatedRoute><SettingsScreen /></AuthenticatedRoute>} />

					{/* Redirects */}
					<Route path="/" element={<Navigate to="/login" replace />} />
					<Route path="*" element={<Navigate to="/login" replace />} />
				</Routes>
			</ToastProvider>
		</BrowserRouter>
	)
}

export default App
