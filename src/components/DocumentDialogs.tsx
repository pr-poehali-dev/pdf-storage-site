import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const FOLDER_COLORS = [
  { value: 'bg-purple-100 text-purple-700', label: 'Фиолетовый' },
  { value: 'bg-blue-100 text-blue-700', label: 'Синий' },
  { value: 'bg-green-100 text-green-700', label: 'Зелёный' },
  { value: 'bg-orange-100 text-orange-700', label: 'Оранжевый' },
  { value: 'bg-pink-100 text-pink-700', label: 'Розовый' },
  { value: 'bg-yellow-100 text-yellow-700', label: 'Жёлтый' },
];

const FOLDER_ICONS = ['FileText', 'BarChart3', 'BookOpen', 'Wallet', 'Briefcase', 'Package', 'Shield', 'Database'];

interface DocumentDialogsProps {
  showLoginDialog: boolean;
  setShowLoginDialog: (show: boolean) => void;
  loginUsername: string;
  setLoginUsername: (username: string) => void;
  loginPassword: string;
  setLoginPassword: (password: string) => void;
  handleLogin: () => void;
  openFolderDialog: boolean;
  setOpenFolderDialog: (open: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  newFolderColor: string;
  setNewFolderColor: (color: string) => void;
  newFolderIcon: string;
  setNewFolderIcon: (icon: string) => void;
  handleCreateFolder: () => void;
  openDocDialog: boolean;
  setOpenDocDialog: (open: boolean) => void;
  newDocName: string;
  setNewDocName: (name: string) => void;
  newDocDescription: string;
  setNewDocDescription: (description: string) => void;
  newDocFolder: string;
  setNewDocFolder: (folder: string) => void;
  newDocFile: File | null;
  setNewDocFile: (file: File | null) => void;
  handleAddDocument: () => void;
  openEditDocDialog: boolean;
  setOpenEditDocDialog: (open: boolean) => void;
  handleUpdateDocument: () => void;
  folders: Folder[];
  isUpdating?: boolean;
}

export const LoginDialog = ({ 
  showLoginDialog, 
  setShowLoginDialog, 
  loginUsername, 
  setLoginUsername, 
  loginPassword, 
  setLoginPassword, 
  handleLogin 
}: Pick<DocumentDialogsProps, 'showLoginDialog' | 'setShowLoginDialog' | 'loginUsername' | 'setLoginUsername' | 'loginPassword' | 'setLoginPassword' | 'handleLogin'>) => (
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
);

export const CreateFolderDialog = ({
  openFolderDialog,
  setOpenFolderDialog,
  newFolderName,
  setNewFolderName,
  newFolderColor,
  setNewFolderColor,
  newFolderIcon,
  setNewFolderIcon,
  handleCreateFolder
}: Pick<DocumentDialogsProps, 'openFolderDialog' | 'setOpenFolderDialog' | 'newFolderName' | 'setNewFolderName' | 'newFolderColor' | 'setNewFolderColor' | 'newFolderIcon' | 'setNewFolderIcon' | 'handleCreateFolder'>) => (
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
);

export const AddDocumentDialog = ({
  openDocDialog,
  setOpenDocDialog,
  newDocName,
  setNewDocName,
  newDocDescription,
  setNewDocDescription,
  newDocFolder,
  setNewDocFolder,
  newDocFile,
  setNewDocFile,
  handleAddDocument,
  folders
}: Pick<DocumentDialogsProps, 'openDocDialog' | 'setOpenDocDialog' | 'newDocName' | 'setNewDocName' | 'newDocDescription' | 'setNewDocDescription' | 'newDocFolder' | 'setNewDocFolder' | 'newDocFile' | 'setNewDocFile' | 'handleAddDocument' | 'folders'>) => (
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
          <Label htmlFor="doc-file">Загрузить PDF файл *</Label>
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
);

export const EditDocumentDialog = ({
  openEditDocDialog,
  setOpenEditDocDialog,
  newDocName,
  setNewDocName,
  newDocDescription,
  setNewDocDescription,
  newDocFolder,
  setNewDocFolder,
  newDocFile,
  setNewDocFile,
  handleUpdateDocument,
  folders,
  isUpdating
}: Pick<DocumentDialogsProps, 'openEditDocDialog' | 'setOpenEditDocDialog' | 'newDocName' | 'setNewDocName' | 'newDocDescription' | 'setNewDocDescription' | 'newDocFolder' | 'setNewDocFolder' | 'newDocFile' | 'setNewDocFile' | 'handleUpdateDocument' | 'folders' | 'isUpdating'>) => {
  console.log('EditDocumentDialog render, isUpdating:', isUpdating);
  
  return (
  <Dialog open={openEditDocDialog} onOpenChange={setOpenEditDocDialog}>
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            disabled={isUpdating}
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
            disabled={isUpdating}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-doc-folder">Папка</Label>
          <Select value={newDocFolder} onValueChange={setNewDocFolder} disabled={isUpdating}>
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
        <div className="space-y-2">
          <Label htmlFor="edit-doc-file">Загрузить PDF файл (необязательно)</Label>
          <Input
            id="edit-doc-file"
            type="file"
            accept=".pdf"
            onChange={(e) => setNewDocFile(e.target.files?.[0] || null)}
            className="cursor-pointer"
            disabled={isUpdating}
          />
          {newDocFile && (
            <p className="text-sm text-gray-600">
              Выбран: {newDocFile.name} ({(newDocFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setOpenEditDocDialog(false)} disabled={isUpdating}>
          Отмена
        </Button>
        <Button onClick={handleUpdateDocument} disabled={isUpdating}>
          {isUpdating && <Icon name="Loader2" className="mr-2 animate-spin" size={16} />}
          Сохранить
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  );
};