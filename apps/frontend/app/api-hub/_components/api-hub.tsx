"use client";

import useApiHub from "../_hooks/use-api-hub";
import Header from "../../../components/header";
import CollectionsSidebar from "./collections-sidebar";
import RequestPanel from "./request-panel";
import ResponsePanel from "./response-panel";

export default function ApiHub() {
  const {
    user,
    isAuthLoading,
    collections,
    history,
    isLoadingLists,
    
    // Request composer state
    method,
    setMethod,
    url,
    setUrl,
    headers,
    setHeaders,
    body,
    setBody,
    
    // Actions & Senders
    isExecuting,
    response,
    executionError,
    handleSendRequest,
    
    // UI tabs
    composerTab,
    setComposerTab,
    responseTab,
    setResponseTab,
    sidebarTab,
    setSidebarTab,

    // Collections Management
    newCollectionName,
    setNewCollectionName,
    isCreatingCollection,
    handleCreateCollection,
    handleDeleteCollection,
    handleSaveRequest,
    handleDeleteRequest,
    
    // Loader actions
    loadSavedRequestIntoComposer,
    loadHistoryItemIntoComposer,
    handleClearHistory,
    handleLogout
  } = useApiHub();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
        <div className="h-6 w-6 rounded-full border-2 border-slate-800 border-t-emerald-400 animate-spin" />
        <span className="text-sm font-mono">Initializing API Hub...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Top Navigation Bar */}
      <Header isConnected={true} user={user} onLogout={handleLogout} />

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6 min-h-0">
        
        {/* Module Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-mono font-bold tracking-tight text-white">
            API Hub Console
          </h1>
          <p className="text-xs text-slate-400">
            Design HTTP requests, manage folder collections, and inspect real-time execution telemetry.
          </p>
        </div>

        {/* Double-Panel Split Layout */}
        <div className="flex flex-col lg:flex-row gap-6 min-h-0 items-stretch">
          
          {/* Left panel: Sider tree list */}
          <CollectionsSidebar
            collections={collections}
            history={history}
            sidebarTab={sidebarTab}
            setSidebarTab={setSidebarTab}
            isLoadingLists={isLoadingLists}
            newCollectionName={newCollectionName}
            setNewCollectionName={setNewCollectionName}
            isCreatingCollection={isCreatingCollection}
            handleCreateCollection={handleCreateCollection}
            handleDeleteCollection={handleDeleteCollection}
            handleSaveRequest={handleSaveRequest}
            handleDeleteRequest={handleDeleteRequest}
            loadSavedRequestIntoComposer={loadSavedRequestIntoComposer}
            loadHistoryItemIntoComposer={loadHistoryItemIntoComposer}
            handleClearHistory={handleClearHistory}
          />

          {/* Right panel: Editor Workspace */}
          <div className="flex-1 flex flex-col gap-6 min-h-0">
            {/* Request Composer */}
            <RequestPanel
              method={method}
              setMethod={setMethod}
              url={url}
              setUrl={setUrl}
              headers={headers}
              setHeaders={setHeaders}
              body={body}
              setBody={setBody}
              isExecuting={isExecuting}
              handleSendRequest={handleSendRequest}
              composerTab={composerTab}
              setComposerTab={setComposerTab}
            />

            {/* Response Inspector */}
            <ResponsePanel
              response={response}
              executionError={executionError}
              isExecuting={isExecuting}
              responseTab={responseTab}
              setResponseTab={setResponseTab}
            />
          </div>

        </div>
      </main>
    </div>
  );
}
