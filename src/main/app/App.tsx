function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          Finance Tracker
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Gerencie suas financas de forma simples e eficiente
        </p>
      </header>

      <main className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Bem-vindo
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Sua aplicacao de controle financeiro esta pronta para uso.
          </p>
        </div>
      </main>

      <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Finance Tracker &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

export default App
