import type { Group } from './types'
import { mockGroups as initialMockGroups, mockMembers, mockCurrentUser } from './mock-data'

// Simple in-memory store for groups (shared between screens)
// In a real app, this would be replaced with Redux, Context, or API calls
let groups: Group[] = [...initialMockGroups]

export function getGroups(): Group[] {
	return groups
}

export function getGroupById(id: string): Group | undefined {
	return groups.find(g => g.id === id)
}

export function addGroup(groupData: { name: string; description?: string }): Group {
	const newGroup: Group = {
		id: `group-${Date.now()}`,
		name: groupData.name,
		description: groupData.description || '',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		memberCount: 1,
		members: [mockCurrentUser],
		currentUserRole: 'admin',
		pendingInvites: [],
	}
	groups = [...groups, newGroup]
	return newGroup
}

export function updateGroup(id: string, updates: Partial<Group>): Group | undefined {
	const index = groups.findIndex(g => g.id === id)
	if (index === -1) return undefined

	groups[index] = { ...groups[index], ...updates, updatedAt: new Date().toISOString() }
	groups = [...groups] // Trigger re-render by creating new array reference
	return groups[index]
}

export function deleteGroup(id: string): boolean {
	const initialLength = groups.length
	groups = groups.filter(g => g.id !== id)
	return groups.length < initialLength
}

// For testing purposes - reset to initial state
export function resetGroups(): void {
	groups = [...initialMockGroups]
}
