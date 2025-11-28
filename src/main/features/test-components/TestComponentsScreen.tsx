import { useState } from 'react'
import {
	Card,
	CardHeader,
	CardBody,
	CardFooter,
} from '@main/components/ui/Card'
import { Modal } from '@main/components/ui/Modal'
import { Button } from '@main/components/ui/Button'
import { Select, type SelectOption } from '@main/components/ui/Select'
import { IconPicker } from '@main/components/ui/IconPicker'
import { ColorPicker } from '@main/components/ui/ColorPicker'

const basicOptions: SelectOption[] = [
	{ value: '1', label: 'Option 1' },
	{ value: '2', label: 'Option 2' },
	{ value: '3', label: 'Option 3' },
	{ value: '4', label: 'Option 4' },
]

const optionsWithDisabled: SelectOption[] = [
	{ value: '1', label: 'Available Option 1' },
	{ value: '2', label: 'Disabled Option', disabled: true },
	{ value: '3', label: 'Available Option 2' },
]

export function TestComponentsScreen() {
	const [clickCount, setClickCount] = useState(0)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isModalSmOpen, setIsModalSmOpen] = useState(false)
	const [isModalMdOpen, setIsModalMdOpen] = useState(false)
	const [isModalLgOpen, setIsModalLgOpen] = useState(false)
	const [isModalNoEscapeOpen, setIsModalNoEscapeOpen] = useState(false)
	const [isModalScrollableOpen, setIsModalScrollableOpen] = useState(false)

	// Select state
	const [basicSelectValue, setBasicSelectValue] = useState('')
	const [searchableSelectValue, setSearchableSelectValue] = useState('')
	const [multiSelectValue, setMultiSelectValue] = useState<string[]>([])
	const [clearableSelectValue, setClearableSelectValue] = useState('')
	const [disabledOptionsSelectValue, setDisabledOptionsSelectValue] = useState('')

	// Icon Picker state
	const [selectedIcon, setSelectedIcon] = useState('wallet')

	// Color Picker state
	const [selectedColor, setSelectedColor] = useState('#3B82F6')

	const handleCardClick = () => {
		setClickCount(prev => prev + 1)
	}

	return (
		<div className="min-h-screen p-8 bg-[var(--color-background)]">
			<h1 className="text-3xl font-bold mb-8 text-[var(--color-text)]">
				Component Test Page
			</h1>

			{/* Click counter for testing */}
			<div data-testid="click-count" className="mb-4 text-sm text-[var(--color-text-secondary)]">
				{clickCount}
			</div>

			<div className="space-y-8">
				{/* Card Section */}
				<section>
					<h2 className="text-xl font-semibold mb-4 text-[var(--color-text)]">
						Card Component
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{/* Default Card */}
						<Card data-testid="card-default">
							<p>Default card content</p>
						</Card>

						{/* Clickable Card */}
						<Card
							data-testid="card-clickable"
							variant="clickable"
							onClick={handleCardClick}
						>
							<p>Clickable card - click me!</p>
						</Card>

						{/* Card with Header, Body, Footer */}
						<Card data-testid="card-sections">
							<CardHeader data-testid="card-header">
								Card Header
							</CardHeader>
							<CardBody data-testid="card-body">
								Card Body Content
							</CardBody>
							<CardFooter data-testid="card-footer">
								Card Footer
							</CardFooter>
						</Card>
					</div>

					{/* Padding Variants */}
					<h3 className="text-lg font-medium mt-6 mb-3 text-[var(--color-text)]">
						Padding Variants
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<Card data-testid="card-padding-none" padding="none">
							<p>Padding: none</p>
						</Card>
						<Card data-testid="card-padding-sm" padding="sm">
							<p>Padding: sm</p>
						</Card>
						<Card data-testid="card-padding-md" padding="md">
							<p>Padding: md</p>
						</Card>
						<Card data-testid="card-padding-lg" padding="lg">
							<p>Padding: lg</p>
						</Card>
					</div>

					{/* Shadow Variants */}
					<h3 className="text-lg font-medium mt-6 mb-3 text-[var(--color-text)]">
						Shadow Variants
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<Card data-testid="card-shadow-none" shadow="none">
							<p>Shadow: none</p>
						</Card>
						<Card data-testid="card-shadow-sm" shadow="sm">
							<p>Shadow: sm</p>
						</Card>
						<Card data-testid="card-shadow-md" shadow="md">
							<p>Shadow: md</p>
						</Card>
						<Card data-testid="card-shadow-lg" shadow="lg">
							<p>Shadow: lg</p>
						</Card>
					</div>
				</section>

				{/* Modal Section */}
				<section>
					<h2 className="text-xl font-semibold mb-4 text-[var(--color-text)]">
						Modal Component
					</h2>

					<div className="flex flex-wrap gap-4">
						<Button
							data-testid="open-modal-btn"
							onClick={() => setIsModalOpen(true)}
						>
							Open Modal
						</Button>
						<Button
							data-testid="open-modal-sm"
							variant="secondary"
							onClick={() => setIsModalSmOpen(true)}
						>
							Small Modal
						</Button>
						<Button
							data-testid="open-modal-md"
							variant="secondary"
							onClick={() => setIsModalMdOpen(true)}
						>
							Medium Modal
						</Button>
						<Button
							data-testid="open-modal-lg"
							variant="secondary"
							onClick={() => setIsModalLgOpen(true)}
						>
							Large Modal
						</Button>
						<Button
							data-testid="open-modal-no-escape"
							variant="tertiary"
							onClick={() => setIsModalNoEscapeOpen(true)}
						>
							No Escape Key
						</Button>
						<Button
							data-testid="open-modal-scrollable"
							variant="tertiary"
							onClick={() => setIsModalScrollableOpen(true)}
						>
							Scrollable Modal
						</Button>
					</div>

					{/* Default Modal */}
					<Modal
						isOpen={isModalOpen}
						onClose={() => setIsModalOpen(false)}
						title="Modal Title"
						footer={
							<>
								<Button variant="secondary" onClick={() => setIsModalOpen(false)}>
									Cancel
								</Button>
								<Button onClick={() => setIsModalOpen(false)}>
									Confirm
								</Button>
							</>
						}
					>
						<p className="text-[var(--color-text-secondary)]">
							This is the modal content. You can put anything here.
						</p>
					</Modal>

					{/* Small Modal */}
					<Modal
						isOpen={isModalSmOpen}
						onClose={() => setIsModalSmOpen(false)}
						title="Small Modal"
						size="sm"
					>
						<p className="text-[var(--color-text-secondary)]">
							This is a small modal (400px max-width).
						</p>
					</Modal>

					{/* Medium Modal */}
					<Modal
						isOpen={isModalMdOpen}
						onClose={() => setIsModalMdOpen(false)}
						title="Medium Modal"
						size="md"
					>
						<p className="text-[var(--color-text-secondary)]">
							This is a medium modal (560px max-width).
						</p>
					</Modal>

					{/* Large Modal */}
					<Modal
						isOpen={isModalLgOpen}
						onClose={() => setIsModalLgOpen(false)}
						title="Large Modal"
						size="lg"
					>
						<p className="text-[var(--color-text-secondary)]">
							This is a large modal (720px max-width).
						</p>
					</Modal>

					{/* No Escape Modal */}
					<Modal
						isOpen={isModalNoEscapeOpen}
						onClose={() => setIsModalNoEscapeOpen(false)}
						title="No Escape Key Modal"
						closeOnEscape={false}
					>
						<p className="text-[var(--color-text-secondary)]">
							This modal cannot be closed with the Escape key. Use the close button.
						</p>
					</Modal>

					{/* Scrollable Modal */}
					<Modal
						isOpen={isModalScrollableOpen}
						onClose={() => setIsModalScrollableOpen(false)}
						title="Scrollable Modal"
						footer={
							<Button onClick={() => setIsModalScrollableOpen(false)}>
								Close
							</Button>
						}
					>
						<div className="space-y-4">
							{Array.from({ length: 20 }).map((_, i) => (
								<p key={i} className="text-[var(--color-text-secondary)]">
									Paragraph {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
									Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
								</p>
							))}
						</div>
					</Modal>
				</section>

				{/* Select Section */}
				<section>
					<h2 className="text-xl font-semibold mb-4 text-[var(--color-text)]">
						Select Component
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
						{/* Basic Select */}
						<div>
							<p className="text-sm text-[var(--color-text-secondary)] mb-2">Basic Select</p>
							<Select
								options={basicOptions}
								value={basicSelectValue}
								onChange={val => setBasicSelectValue(val as string)}
								placeholder="Select an option"
							/>
						</div>

						{/* Searchable Select */}
						<div>
							<p className="text-sm text-[var(--color-text-secondary)] mb-2">Searchable Select</p>
							<Select
								data-testid="select-searchable"
								options={basicOptions}
								value={searchableSelectValue}
								onChange={val => setSearchableSelectValue(val as string)}
								searchable
								placeholder="Search options..."
							/>
						</div>

						{/* Multi Select */}
						<div>
							<p className="text-sm text-[var(--color-text-secondary)] mb-2">Multi Select</p>
							<Select
								data-testid="select-multi"
								options={basicOptions}
								value={multiSelectValue}
								onChange={val => setMultiSelectValue(val as string[])}
								multiple
								placeholder="Select multiple"
							/>
						</div>

						{/* Clearable Select */}
						<div>
							<p className="text-sm text-[var(--color-text-secondary)] mb-2">Clearable Select</p>
							<Select
								data-testid="select-clearable"
								options={basicOptions}
								value={clearableSelectValue}
								onChange={val => setClearableSelectValue(val as string)}
								clearable
								placeholder="Select an option"
							/>
						</div>

						{/* Disabled Select */}
						<div>
							<p className="text-sm text-[var(--color-text-secondary)] mb-2">Disabled Select</p>
							<Select
								data-testid="select-disabled"
								options={basicOptions}
								value=""
								onChange={() => {}}
								disabled
								placeholder="Disabled"
							/>
						</div>

						{/* Error Select */}
						<div>
							<p className="text-sm text-[var(--color-text-secondary)] mb-2">Select with Error</p>
							<Select
								data-testid="select-error"
								options={basicOptions}
								value=""
								onChange={() => {}}
								error="This field is required"
								placeholder="Select an option"
							/>
						</div>

						{/* Select with Disabled Options */}
						<div>
							<p className="text-sm text-[var(--color-text-secondary)] mb-2">With Disabled Options</p>
							<Select
								data-testid="select-with-disabled"
								options={optionsWithDisabled}
								value={disabledOptionsSelectValue}
								onChange={val => setDisabledOptionsSelectValue(val as string)}
								placeholder="Select an option"
							/>
						</div>
					</div>
				</section>

				{/* Icon Picker Section */}
				<section>
					<h2 className="text-xl font-semibold mb-4 text-[var(--color-text)]">
						Icon Picker Component
					</h2>

					<div className="max-w-md">
						<p className="text-sm text-[var(--color-text-secondary)] mb-2">
							Selected: <span data-testid="selected-icon-value">{selectedIcon}</span>
						</p>
						<IconPicker
							value={selectedIcon}
							onChange={setSelectedIcon}
						/>
					</div>
				</section>

				{/* Color Picker Section */}
				<section>
					<h2 className="text-xl font-semibold mb-4 text-[var(--color-text)]">
						Color Picker Component
					</h2>

					<div className="max-w-md">
						<p className="text-sm text-[var(--color-text-secondary)] mb-2">
							Selected: <span data-testid="selected-color-value">{selectedColor}</span>
						</p>
						<ColorPicker
							value={selectedColor}
							onChange={setSelectedColor}
						/>
					</div>
				</section>
			</div>
		</div>
	)
}

export default TestComponentsScreen
