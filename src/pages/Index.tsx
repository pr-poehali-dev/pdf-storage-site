import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/61726929-8064-4724-aa73-122743ce45cf';
const AUTH_URL = 'https://functions.poehali.dev/0260e0c7-55cb-4dce-8b66-8677fbbe2609';

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
      const response = await fetch(`${API_URL}?path=folders`);
      const data = await response.json();
      setFolders(data.map((f: any, index: number) => ({ ...f, id: f.id.toString(), order: f.order ?? index })));
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить папки', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await fetch(`${API_URL}?path=documents`);
      const data = await response.json();
      setDocuments(data.map((d: any) => ({ ...d, id: d.id.toString(), folderId: d.folderId.toString() })));
    } catch (error) {
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDocName,
          description: newDocDescription,
          folderId: parseInt(newDocFolder),
          file: fileBase64,
        }),
      });

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
    setOpenEditDocDialog(true);
  };

  const handleUpdateDocument = async () => {
    if (!editingDoc || !newDocName.trim()) {
      toast({ title: 'Ошибка', description: 'Введите название документа', variant: 'destructive' });
      return;
    }

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
          {isAdmin && (
            <Dialog open={openFolderDialog} onOpenChange={setOpenFolderDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full mb-4 gap-2">
                  <Icon name="FolderPlus" size={18} />
                  Создать папку
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Создать новую папку</DialogTitle>
                  <DialogDescription>Укажите название, цвет и иконку для новой папки</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="folder-name">Название папки</Label>
                    <Input
                      id="folder-name"
                      placeholder="Например: Важные документы"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="folder-color">Цвет</Label>
                    <Select value={newFolderColor} onValueChange={setNewFolderColor}>
                      <SelectTrigger id="folder-color">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FOLDER_COLORS.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded ${color.value}`}></div>
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="folder-icon">Иконка</Label>
                    <Select value={newFolderIcon} onValueChange={setNewFolderIcon}>
                      <SelectTrigger id="folder-icon">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FOLDER_ICONS.map((icon) => (
                          <SelectItem key={icon} value={icon}>
                            <div className="flex items-center gap-2">
                              <Icon name={icon as any} size={16} />
                              {icon}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenFolderDialog(false)}>Отмена</Button>
                  <Button onClick={handleCreateFolder}>Создать</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
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
                        onClick={() => window.open(`${API_URL}?path=view&id=${doc.id}`, '_blank')}
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
              <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Icon name="Lock" size={18} />
                    Вход для админа
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Вход администратора</DialogTitle>
                    <DialogDescription>Введите логин и пароль для управления документами</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username">Логин</Label>
                      <Input
                        id="username"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        placeholder="admin"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Пароль</Label>
                      <Input
                        id="password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••"
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleLogin}>Войти</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
              <Dialog open={openDocDialog} onOpenChange={setOpenDocDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2 hover:scale-105 transition-transform">
                    <Icon name="Upload" size={20} />
                    Добавить документ
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить документ</DialogTitle>
                  <DialogDescription>Укажите информацию о документе</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="doc-name">Название документа</Label>
                    <Input
                      id="doc-name"
                      placeholder="Например: Договор с поставщиком"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc-description">Описание</Label>
                    <Textarea
                      id="doc-description"
                      placeholder="Краткое описание документа..."
                      value={newDocDescription}
                      onChange={(e) => setNewDocDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc-folder">Папка</Label>
                    <Select value={newDocFolder} onValueChange={setNewDocFolder}>
                      <SelectTrigger id="doc-folder">
                        <SelectValue placeholder="Выберите папку" />
                      </SelectTrigger>
                      <SelectContent>
                        {folders.map((folder) => (
                          <SelectItem key={folder.id} value={folder.id}>
                            <div className="flex items-center gap-2">
                              <Icon name={folder.icon as any} size={16} />
                              {folder.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc-file">Загрузить PDF файл (необязательно)</Label>
                    <Input
                      id="doc-file"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setNewDocFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                    {newDocFile && (
                      <p className="text-sm text-gray-600">
                        Выбран: {newDocFile.name} ({(newDocFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDocDialog(false)}>Отмена</Button>
                  <Button onClick={handleAddDocument}>Добавить</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                  <Card key={doc.id} className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group relative">
                    {isAdmin && (
                      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDocument(doc);
                          }}
                          className="p-2 hover:bg-blue-100 rounded"
                        >
                          <Icon name="Edit" size={16} className="text-blue-600" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteDocument(doc.id, e)}
                          className="p-2 hover:bg-red-100 rounded"
                        >
                          <Icon name="Trash2" size={16} className="text-red-600" />
                        </button>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className={`p-2 rounded-lg ${folder?.color}`}>
                          <Icon name="FileText" size={20} />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {doc.size}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {doc.name}
                      </CardTitle>
                      {doc.description ? (
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <CardDescription className="line-clamp-2 text-sm cursor-help">
                              {doc.description}
                            </CardDescription>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-md p-3">
                            <p className="whitespace-pre-wrap">{doc.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <CardDescription className="line-clamp-2 text-sm text-gray-400">
                          Описание отсутствует
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Icon name="Calendar" size={14} />
                          {new Date(doc.uploadDate).toLocaleDateString('ru-RU')}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {folder?.name}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 hover:bg-primary hover:text-white transition-all"
                          disabled={!doc.hasFile}
                          onClick={() => window.open(`${API_URL}?path=view&id=${doc.id}`, '_blank')}
                        >
                          <Icon name="Eye" size={16} className="mr-1" />
                          Открыть
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 hover:bg-secondary hover:text-white transition-all"
                          disabled={!doc.hasFile}
                          onClick={() => window.open(`${API_URL}?path=download&id=${doc.id}`, '_blank')}
                        >
                          <Icon name="Download" size={16} className="mr-1" />
                          Скачать
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <Dialog open={openEditDocDialog} onOpenChange={setOpenEditDocDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать документ</DialogTitle>
              <DialogDescription>Измените информацию о документе</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-doc-name">Название документа</Label>
                <Input
                  id="edit-doc-name"
                  placeholder="Название документа"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-doc-description">Описание</Label>
                <Textarea
                  id="edit-doc-description"
                  placeholder="Описание документа..."
                  value={newDocDescription}
                  onChange={(e) => setNewDocDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-doc-folder">Папка</Label>
                <Select value={newDocFolder} onValueChange={setNewDocFolder}>
                  <SelectTrigger id="edit-doc-folder">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenEditDocDialog(false)}>Отмена</Button>
              <Button onClick={handleUpdateDocument}>Сохранить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
};

export default Index;