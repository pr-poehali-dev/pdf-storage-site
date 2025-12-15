import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';
import DocumentCard from '@/components/DocumentCard';
import { LoginDialog, CreateFolderDialog, AddDocumentDialog, EditDocumentDialog } from '@/components/DocumentDialogs';

const API_URL = 'https://functions.poehali.dev/7916b8a7-f1d6-439c-b8dd-33447351a72e';
const AUTH_URL = 'https://functions.poehali.dev/afe527ed-a001-4bca-9f22-54d1b5e5c2ea';

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

const FOLDER_COLORS = [
  { value: 'bg-purple-100 text-purple-700', label: 'Фиолетовый' },
  { value: 'bg-blue-100 text-blue-700', label: 'Синий' },
  { value: 'bg-green-100 text-green-700', label: 'Зелёный' },
  { value: 'bg-orange-100 text-orange-700', label: 'Оранжевый' },
  { value: 'bg-pink-100 text-pink-700', label: 'Розовый' },
  { value: 'bg-yellow-100 text-yellow-700', label: 'Жёлтый' },
];

const FOLDER_ICONS = ['FileText', 'BarChart3', 'BookOpen', 'Wallet', 'Briefcase', 'Package', 'Shield', 'Database'];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('adminToken'));

  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0].value);
  const [newFolderIcon, setNewFolderIcon] = useState(FOLDER_ICONS[0]);
  const [openFolderDialog, setOpenFolderDialog] = useState(false);

  const [newDocName, setNewDocName] = useState('');
  const [newDocDescription, setNewDocDescription] = useState('');
  const [newDocFolder, setNewDocFolder] = useState('');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const [openDocDialog, setOpenDocDialog] = useState(false);

  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [openEditDocDialog, setOpenEditDocDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [draggedFolder, setDraggedFolder] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadFolders();
    loadDocuments();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!adminToken) {
      setIsAdmin(false);
      return;
    }

    try {
      const response = await fetch(AUTH_URL, {
        headers: { 'X-Admin-Token': adminToken }
      });
      const data = await response.json();
      setIsAdmin(data.authenticated === true);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('adminToken', data.token);
        setAdminToken(data.token);
        setIsAdmin(true);
        setShowLoginDialog(false);
        setLoginUsername('');
        setLoginPassword('');
        toast({ title: 'Успешно!', description: 'Вы вошли как администратор' });
      } else {
        toast({ title: 'Ошибка', description: 'Неверные данные для входа', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось войти', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken(null);
    setIsAdmin(false);
    toast({ title: 'Выход', description: 'Вы вышли из режима администратора' });
  };

  const loadFolders = async () => {
    try {
      console.log('Loading folders from:', `${API_URL}?path=folders`);
      const response = await fetch(`${API_URL}?path=folders`);
      console.log('Folders response status:', response.status);
      const data = await response.json();
      console.log('Folders data:', data);
      setFolders(data.map((f: any, index: number) => ({ ...f, id: f.id.toString(), order: f.order ?? index })));
      console.log('Folders set successfully');
    } catch (error) {
      console.error('Fetch error:', error, 'for', `${API_URL}?path=folders`);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить папки', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      console.log('Loading documents from:', `${API_URL}?path=documents`);
      const response = await fetch(`${API_URL}?path=documents`);
      console.log('Documents response status:', response.status);
      const data = await response.json();
      console.log('Documents data length:', data.length);
      setDocuments(data.map((d: any) => ({ ...d, id: d.id.toString(), folderId: d.folderId.toString() })));
      console.log('Documents set successfully');
    } catch (error) {
      console.error('Fetch error:', error, 'for', `${API_URL}?path=documents`);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить документы', variant: 'destructive' });
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = !selectedFolder || doc.folderId === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const getFolderById = (id: string) => folders.find(f => f.id === id);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({ title: 'Ошибка', description: 'Введите название папки', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(`${API_URL}?path=folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName,
          color: newFolderColor,
          icon: newFolderIcon,
        }),
      });

      const newFolder = await response.json();
      setFolders([...folders, { ...newFolder, id: newFolder.id.toString() }]);
      setNewFolderName('');
      setNewFolderColor(FOLDER_COLORS[0].value);
      setNewFolderIcon(FOLDER_ICONS[0]);
      setOpenFolderDialog(false);
      toast({ title: 'Успешно!', description: `Папка "${newFolderName}" создана` });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось создать папку', variant: 'destructive' });
    }
  };

  const handleAddDocument = async () => {
    if (!newDocName.trim()) {
      toast({ title: 'Ошибка', description: 'Введите название документа', variant: 'destructive' });
      return;
    }
    if (!newDocFolder) {
      toast({ title: 'Ошибка', description: 'Выберите папку', variant: 'destructive' });
      return;
    }
    if (!newDocFile) {
      toast({ title: 'Ошибка', description: 'Загрузите PDF файл', variant: 'destructive' });
      return;
    }

    try {
      const reader = new FileReader();
      const fileBase64 = await new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]);
        };
        reader.readAsDataURL(newDocFile);
      });

      const response = await fetch(`${API_URL}?path=documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDocName,
          description: newDocDescription,
          folderId: parseInt(newDocFolder),
          file: fileBase64,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      const newDoc = await response.json();
      setDocuments([...documents, { ...newDoc, id: newDoc.id.toString(), folderId: newDoc.folderId.toString() }]);
      setNewDocName('');
      setNewDocDescription('');
      setNewDocFolder('');
      setNewDocFile(null);
      setOpenDocDialog(false);
      toast({ title: 'Успешно!', description: `Документ "${newDocName}" добавлен` });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось добавить документ', variant: 'destructive' });
    }
  };

  const handleDeleteFolder = async (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const folder = getFolderById(folderId);
    const hasDocuments = documents.some(d => d.folderId === folderId);
    
    if (hasDocuments) {
      toast({ 
        title: 'Ошибка', 
        description: 'Нельзя удалить папку с документами. Сначала переместите или удалите документы.', 
        variant: 'destructive' 
      });
      return;
    }

    try {
      await fetch(`${API_URL}?path=folders&id=${folderId}`, { method: 'DELETE' });
      setFolders(folders.filter(f => f.id !== folderId));
      if (selectedFolder === folderId) {
        setSelectedFolder(null);
      }
      toast({ title: 'Удалено', description: `Папка "${folder?.name}" удалена` });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить папку', variant: 'destructive' });
    }
  };

  const handleDeleteDocument = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const doc = documents.find(d => d.id === docId);
    
    try {
      await fetch(`${API_URL}?path=documents&id=${docId}`, { method: 'DELETE' });
      setDocuments(documents.filter(d => d.id !== docId));
      toast({ title: 'Удалено', description: `Документ "${doc?.name}" удалён` });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить документ', variant: 'destructive' });
    }
  };

  const handleEditDocument = (doc: Document) => {
    setEditingDoc(doc);
    setNewDocName(doc.name);
    setNewDocDescription(doc.description);
    setNewDocFolder(doc.folderId);
    setNewDocFile(null);
    setOpenEditDocDialog(true);
  };

  const handleUpdateDocument = async () => {
    if (!editingDoc || !newDocName.trim()) {
      toast({ title: 'Ошибка', description: 'Введите название документа', variant: 'destructive' });
      return;
    }

    setIsUpdating(true);
    try {
      let fileBase64 = null;
      if (newDocFile) {
        const reader = new FileReader();
        fileBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const base64 = reader.result as string;
            resolve(base64.split(',')[1]);
          };
          reader.readAsDataURL(newDocFile);
        });
      }

      const response = await fetch(`${API_URL}?path=documents`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: parseInt(editingDoc.id),
          name: newDocName,
          description: newDocDescription,
          folderId: parseInt(newDocFolder),
          file: fileBase64,
        }),
      });

      const updatedDoc = await response.json();
      setDocuments(documents.map(d => 
        d.id === editingDoc.id 
          ? { ...updatedDoc, id: updatedDoc.id.toString(), folderId: updatedDoc.folderId.toString() }
          : d
      ));
      setEditingDoc(null);
      setNewDocName('');
      setNewDocDescription('');
      setNewDocFolder('');
      setNewDocFile(null);
      setOpenEditDocDialog(false);
      toast({ title: 'Успешно!', description: 'Документ обновлён' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить документ', variant: 'destructive' });
    } finally {
      console.log('Finished update, isUpdating:', false);
      setIsUpdating(false);
    }
  };

  const handleDragStart = (folderId: string) => {
    setDraggedFolder(folderId);
  };

  const handleDragOver = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    if (!draggedFolder || draggedFolder === targetFolderId) return;

    const draggedIndex = folders.findIndex(f => f.id === draggedFolder);
    const targetIndex = folders.findIndex(f => f.id === targetFolderId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newFolders = [...folders];
    const [removed] = newFolders.splice(draggedIndex, 1);
    newFolders.splice(targetIndex, 0, removed);

    setFolders(newFolders.map((f, index) => ({ ...f, order: index })));
  };

  const handleDragEnd = async () => {
    if (!draggedFolder) return;
    
    try {
      await fetch(`${API_URL}?path=folders-reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folders: folders.map((f, index) => ({ id: parseInt(f.id), order: index }))
        }),
      });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить порядок', variant: 'destructive' });
    }
    
    setDraggedFolder(null);
  };

  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpandedFolders(new Set());
      setAllExpanded(false);
    } else {
      setExpandedFolders(new Set(folders.map(f => f.id)));
      setAllExpanded(true);
    }
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
    setAllExpanded(newExpanded.size === folders.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" className="animate-spin mx-auto mb-4 text-primary" size={48} />
          <p className="text-gray-600 text-lg">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white flex relative">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        folders={folders}
        documents={documents}
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
        expandedFolders={expandedFolders}
        toggleFolder={toggleFolder}
        allExpanded={allExpanded}
        toggleExpandAll={toggleExpandAll}
        isAdmin={isAdmin}
        draggedFolder={draggedFolder}
        handleDragOver={handleDragOver}
        handleDeleteFolder={handleDeleteFolder}
        apiUrl={API_URL}
        createFolderButton={
          <CreateFolderDialog
            openFolderDialog={openFolderDialog}
            setOpenFolderDialog={setOpenFolderDialog}
            newFolderName={newFolderName}
            setNewFolderName={setNewFolderName}
            newFolderColor={newFolderColor}
            setNewFolderColor={setNewFolderColor}
            newFolderIcon={newFolderIcon}
            setNewFolderIcon={setNewFolderIcon}
            handleCreateFolder={handleCreateFolder}
          />
        }
      />
      
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Icon name="Menu" size={18} />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">📁 Каталог психотехник</h1>
              <p className="text-sm md:text-base text-gray-600">Воспользуйтесь поиском или переходом по структуре</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            {isAdmin ? (
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <Icon name="LogOut" size={18} />
                Выйти
              </Button>
            ) : (
              <LoginDialog
                showLoginDialog={showLoginDialog}
                setShowLoginDialog={setShowLoginDialog}
                loginUsername={loginUsername}
                setLoginUsername={setLoginUsername}
                loginPassword={loginPassword}
                setLoginPassword={setLoginPassword}
                handleLogin={handleLogin}
              />
            )}
          </div>
        </div>

        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="relative">
            <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Поиск по названию или описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-6 text-lg border-2 focus:border-primary transition-all duration-300"
            />
          </div>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Icon name="FileText" className="text-gray-700" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900">Документы</h2>
              {selectedFolder && (
                <Badge 
                  variant="secondary" 
                  className="text-sm cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => setSelectedFolder(null)}
                >
                  {getFolderById(selectedFolder)?.name}
                  <span className="ml-2 hover:text-destructive transition-colors">
                    ×
                  </span>
                </Badge>
              )}
            </div>
            {isAdmin && (
              <AddDocumentDialog
                openDocDialog={openDocDialog}
                setOpenDocDialog={setOpenDocDialog}
                newDocName={newDocName}
                setNewDocName={setNewDocName}
                newDocDescription={newDocDescription}
                setNewDocDescription={setNewDocDescription}
                newDocFolder={newDocFolder}
                setNewDocFolder={setNewDocFolder}
                newDocFile={newDocFile}
                setNewDocFile={setNewDocFile}
                handleAddDocument={handleAddDocument}
                folders={folders}
              />
            )}
          </div>

          {filteredDocuments.length === 0 ? (
            <Card className="p-12 text-center">
              <Icon name="SearchX" className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 text-lg">Документы не найдены</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => {
                const folder = getFolderById(doc.folderId);
                return (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    folder={folder}
                    isAdmin={isAdmin}
                    apiUrl={API_URL}
                    onEdit={handleEditDocument}
                    onDelete={handleDeleteDocument}
                  />
                );
              })}
            </div>
          )}
        </div>

        <EditDocumentDialog
          openEditDocDialog={openEditDocDialog}
          setOpenEditDocDialog={setOpenEditDocDialog}
          newDocName={newDocName}
          setNewDocName={setNewDocName}
          newDocDescription={newDocDescription}
          setNewDocDescription={setNewDocDescription}
          newDocFolder={newDocFolder}
          setNewDocFolder={setNewDocFolder}
          newDocFile={newDocFile}
          setNewDocFile={setNewDocFile}
          handleUpdateDocument={handleUpdateDocument}
          folders={folders}
          isUpdating={isUpdating}
        />
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
};

export default Index;