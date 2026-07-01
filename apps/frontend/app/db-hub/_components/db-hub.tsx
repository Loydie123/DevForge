"use client";

import { useDbHub } from "../../../hooks";
import Header from "../../../components/header";
import ConnectionsSidebar from "./connections-sidebar";
import SqlComposer from "./sql-composer";
import ResultsGrid from "./results-grid";

export default function DbHub() {
  const {
    user,
    isAuthLoading,
    connections,
    activeConnection,
    setActiveConnection,
    history,
    isLoadingConnections,
    isLoadingHistory,

    // Query states
    query,
    setQuery,
    isExecutingQuery,
    queryResult,
    executionError,
    handleRunQuery,

    // Connection Form states
    isAddFormOpen,
    setIsAddFormOpen,
    formName,
    setFormName,
    formType,
    handleTypeChange,
    formHost,
    setFormHost,
    formPort,
    setFormPort,
    formDatabase,
    setFormDatabase,
    formUsername,
    setFormUsername,
    formPassword,
    setFormPassword,
    
    // Test & Save triggers
    isTestingConnection,
    isSavingConnection,
    testFeedback,
    setTestFeedback,
    handleTestConnection,
    handleSaveConnection,
    handleDeleteConnection,
    handleClearHistory,
    handleLogout
  } = useDbHub();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
        <div className="h-6 w-6 rounded-full border-2 border-slate-800 border-t-emerald-400 animate-spin" />
        <span className="text-sm font-mono">Initializing DB Hub...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Top Shared Navbar */}
      <Header isConnected={true} user={user} onLogout={handleLogout} />

      {/* Main Container Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6 min-h-0">
        
        {/* Module Title Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-mono font-bold tracking-tight text-white">
            DB Hub Explorer
          </h1>
          <p className="text-xs text-slate-400">
            Establish database connections (Postgres, MySQL, MongoDB), run queries, and inspect tabular data structures.
          </p>
        </div>

        {/* Double-Panel Split Layout */}
        <div className="flex flex-col lg:flex-row gap-6 min-h-0 items-stretch">
          
          {/* Left panel: Connections & History sidebar */}
          <ConnectionsSidebar
            connections={connections}
            activeConnection={activeConnection}
            setActiveConnection={setActiveConnection}
            history={history}
            isLoadingConnections={isLoadingConnections}
            isLoadingHistory={isLoadingHistory}
            isAddFormOpen={isAddFormOpen}
            setIsAddFormOpen={setIsAddFormOpen}
            formName={formName}
            setFormName={setFormName}
            formType={formType}
            handleTypeChange={handleTypeChange}
            formHost={formHost}
            setFormHost={setFormHost}
            formPort={formPort}
            setFormPort={setFormPort}
            formDatabase={formDatabase}
            setFormDatabase={setFormDatabase}
            formUsername={formUsername}
            setFormUsername={setFormUsername}
            formPassword={formPassword}
            setFormPassword={setFormPassword}
            isTestingConnection={isTestingConnection}
            isSavingConnection={isSavingConnection}
            testFeedback={testFeedback}
            setTestFeedback={setTestFeedback}
            handleTestConnection={handleTestConnection}
            handleSaveConnection={handleSaveConnection}
            handleDeleteConnection={handleDeleteConnection}
            handleClearHistory={handleClearHistory}
          />

          {/* Right panel: SQL Editor & Output Grids */}
          <div className="flex-1 flex flex-col gap-6 min-h-0">
            {/* SQL Composer Area */}
            <SqlComposer
              activeConnection={activeConnection}
              query={query}
              setQuery={setQuery}
              isExecutingQuery={isExecutingQuery}
              handleRunQuery={handleRunQuery}
            />

            {/* Tabular Results Output Grid */}
            <ResultsGrid
              queryResult={queryResult}
              executionError={executionError}
              isExecutingQuery={isExecutingQuery}
            />
          </div>

        </div>
      </main>
    </div>
  );
}
