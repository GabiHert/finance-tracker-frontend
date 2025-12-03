import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@main/components/ui/Button'
import { GroupCard } from './components/GroupCard'
import { GroupModal } from './GroupModal'
import { fetchGroups, createGroup, updateGroup } from './api'
import type { Group } from './types'

export function GroupsScreen() {
	const navigate = useNavigate()
	const [groups, setGroups] = useState<Group[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

	const loadGroups = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)
			const data = await fetchGroups()
			setGroups(data)
		} catch (err) {
			setError('Erro ao carregar grupos')
			console.error('Error loading groups:', err)
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		loadGroups()
	}, [loadGroups])

	const handleAddGroup = () => {
		setSelectedGroup(null)
		setIsModalOpen(true)
	}

	const handleGroupClick = (group: Group) => {
		navigate(`/groups/${group.id}`)
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setSelectedGroup(null)
	}

	const handleSaveGroup = async (data: { name: string; description?: string }) => {
		try {
			if (selectedGroup) {
				const updated = await updateGroup(selectedGroup.id, {
					name: data.name,
					description: data.description,
				})
				setGroups(groups.map((g) => (g.id === selectedGroup.id ? updated : g)))
			} else {
				const created = await createGroup(data)
				setGroups([...groups, created])
			}
			handleCloseModal()
		} catch (err) {
			console.error('Error saving group:', err)
		}
	}

	if (isLoading) {
		return (
			<div data-testid="groups-screen" className="min-h-screen p-6 bg-[var(--color-background)]">
				<div className="max-w-4xl mx-auto">
					<div className="flex items-center justify-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div data-testid="groups-screen" className="min-h-screen p-6 bg-[var(--color-background)]">
				<div className="max-w-4xl mx-auto">
					<div className="text-center py-12">
						<p className="text-red-500 mb-4">{error}</p>
						<Button onClick={loadGroups}>Tentar novamente</Button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div data-testid="groups-screen" className="min-h-screen p-6 bg-[var(--color-background)]">
			<div className="max-w-4xl mx-auto">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold text-[var(--color-text)]">
						Grupos
					</h1>
					<Button data-testid="new-group-btn" onClick={handleAddGroup}>
						+ Novo Grupo
					</Button>
				</div>

				<p className="text-[var(--color-text-secondary)] mb-6">
					Gerencie despesas compartilhadas com familia, amigos ou colegas.
				</p>

				{groups.length === 0 ? (
					<div
						data-testid="groups-empty-state"
						className="text-center py-12 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]"
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
								<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
								<circle cx="9" cy="7" r="4" />
								<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
								<path d="M16 3.13a4 4 0 0 1 0 7.75" />
							</svg>
						</div>
						<h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
							Nenhum grupo criado
						</h3>
						<p className="text-[var(--color-text-secondary)] mb-4">
							Crie seu primeiro grupo para compartilhar despesas
						</p>
						<Button data-testid="create-first-group-btn" onClick={handleAddGroup}>
							Criar Grupo
						</Button>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2">
						{groups.map((group) => (
							<GroupCard
								key={group.id}
								group={group}
								onClick={handleGroupClick}
							/>
						))}
					</div>
				)}
			</div>

			<GroupModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				onSave={handleSaveGroup}
				group={selectedGroup}
			/>
		</div>
	)
}

export default GroupsScreen
