import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Document {
  id: string;
  name: string;
  description: string;
  folderId: string;
  uploadDate: string;
  size: string;
  hasFile?: boolean;
}

interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
  order?: number;
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  folders: Folder[];
  documents: Document[];
  selectedFolder: string | null;
  setSelectedFolder: (id: string | null) => void;
  expandedFolders: Set<string>;
  toggleFolder: (id: string) => void;
  allExpanded: boolean;
  toggleExpandAll: () => void;
  isAdmin: boolean;
  draggedFolder: string | null;
  handleDragOver: (e: React.DragEvent, targetFolderId: string) => void;
  handleDeleteFolder: (folderId: string, e: React.MouseEvent) => void;
  apiUrl: string;
  createFolderButton: React.ReactNode;
}

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  folders,
  documents,
  selectedFolder,
  setSelectedFolder,
  expandedFolders,
  toggleFolder,
  allExpanded,
  toggleExpandAll,
  isAdmin,
  draggedFolder,
  handleDragOver,
  handleDeleteFolder,
  apiUrl,
  createFolderButton
}: SidebarProps) => {
  return (
    <>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`bg-white shadow-lg transition-all duration-300 ${
        sidebarOpen ? 'w-80 fixed lg:relative z-50 h-screen lg:h-auto' : 'w-0'
      } overflow-hidden flex flex-col`}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Icon name="Folder" size={20} />
            Структура папок
          </h2>
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <Icon name="X" size={18} />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {isAdmin && createFolderButton}
          <div className="mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleExpandAll}
              className="w-full justify-start gap-2"
            >
              <Icon name={allExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
              {allExpanded ? 'Свернуть все' : 'Развернуть все'}
            </Button>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setSelectedFolder(null)}
              className={`w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3 ${
                selectedFolder === null ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700'
              }`}
            >
              <Icon name="Home" size={18} />
              Все документы
              <span className="ml-auto text-sm">{documents.length}</span>
            </button>
            {folders.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((folder) => {
              const folderDocs = documents.filter(d => d.folderId === folder.id);
              const isExpanded = expandedFolders.has(folder.id);
              
              return (
              <div key={folder.id} className="space-y-1">
                <div 
                  className={`relative group w-full rounded-lg transition-all ${
                    selectedFolder === folder.id ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700'
                  } ${draggedFolder === folder.id ? 'opacity-30 scale-95' : ''} ${
                    draggedFolder && draggedFolder !== folder.id ? 'border-2 border-dashed border-primary' : ''
                  }`}
                  onDragOver={(e) => handleDragOver(e, folder.id)}
                >
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleFolder(folder.id)}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Icon 
                        name={isExpanded ? "ChevronDown" : "ChevronRight"} 
                        size={16} 
                        className="text-gray-500"
                      />
                    </button>
                    <div
                      onClick={() => setSelectedFolder(folder.id)}
                      className="flex-1 p-3 py-2 cursor-pointer hover:bg-gray-100/50 flex items-center gap-3 rounded-r-lg"
                    >
                      <div className={`p-1 rounded ${folder.color}`}>
                        <Icon name={folder.icon as any} size={16} />
                      </div>
                      <span className="flex-1 truncate">{folder.name}</span>
                      <span className="text-sm">{folderDocs.length}</span>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.id, e);
                        }}
                        className="p-2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 rounded"
                      >
                        <Icon name="Trash2" size={16} className="text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
                
                {isExpanded && folderDocs.length > 0 && (
                  <div className="ml-8 space-y-1">
                    {folderDocs.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => window.open(`${apiUrl}?path=view&id=${doc.id}`, '_blank')}
                        className="p-2 pl-3 rounded text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-gray-600"
                      >
                        <Icon name="FileText" size={14} />
                        <span className="flex-1 truncate">{doc.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
            })}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
