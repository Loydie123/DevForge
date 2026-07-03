"use client";

import useApiHub from "../_hooks/use-api-hub";
import CollectionsSidebar from "./collections-sidebar";
import RequestPanel from "./request-panel";
import ResponsePanel from "./response-panel";

export default function ApiHub() {
  const {
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
  } = useApiHub();

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6 min-h-0">
      {/* Module Title Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-mono font-bold tracking-tight text-white">
          API Hub Workbench
        </h1>
        <p className="text-xs text-slate-400">
          Compose REST endpoints, organize collections, manage environment parameters, and inspect HTTP response payloads.
        </p>
      </div>

      {/* Double-Panel Workspace */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-0 items-stretch">
        
        {/* Left Side: Sidebar */}
        <CollectionsSidebar
          collections={collections}
          history={history}
          isLoadingLists={isLoadingLists}
          sidebarTab={sidebarTab}
          setSidebarTab={setSidebarTab}
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

        {/* Right Side: Workbench & Response inspector split */}
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
  );
}
