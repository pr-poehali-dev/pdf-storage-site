import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Document {
  id: string;
  name: string;
  description: string;
  folderId: string;
  uploadDate: string;
  size: string;
}

interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const folders: Folder[] = [
    { id: '1', name: 'Контракты', color: 'bg-purple-100 text-purple-700', icon: 'FileText' },
    { id: '2', name: 'Отчеты', color: 'bg-blue-100 text-blue-700', icon: 'BarChart3' },
    { id: '3', name: 'Инструкции', color: 'bg-green-100 text-green-700', icon: 'BookOpen' },
    { id: '4', name: 'Финансы', color: 'bg-orange-100 text-orange-700', icon: 'Wallet' },
  ];

  const documents: Document[] = [
    { id: '1', name: 'Договор поставки оборудования', description: 'Контракт на поставку серверного оборудования для ЦОД', folderId: '1', uploadDate: '2024-03-15', size: '2.4 MB' },
    { id: '2', name: 'Квартальный отчет Q1', description: 'Финансовый отчет за первый квартал 2024 года', folderId: '2', uploadDate: '2024-04-01', size: '1.8 MB' },
    { id: '3', name: 'Руководство пользователя CRM', description: 'Подробная инструкция по работе с CRM системой', folderId: '3', uploadDate: '2024-02-20', size: '5.2 MB' },
    { id: '4', name: 'Бюджет на 2024 год', description: 'Утвержденный бюджет компании на текущий финансовый год', folderId: '4', uploadDate: '2024-01-10', size: '3.1 MB' },
    { id: '5', name: 'Договор аренды офиса', description: 'Соглашение об аренде офисного помещения', folderId: '1', uploadDate: '2024-03-01', size: '1.2 MB' },
    { id: '6', name: 'Отчет по продажам', description: 'Аналитика продаж за последний месяц', folderId: '2', uploadDate: '2024-04-05', size: '900 KB' },
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = !selectedFolder || doc.folderId === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const getFolderById = (id: string) => folders.find(f => f.id === id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📁 Документы</h1>
          <p className="text-gray-600">Управляйте PDF документами с удобным поиском и организацией</p>
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

        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-4">
            <Icon name="Folder" className="text-gray-700" size={24} />
            <h2 className="text-2xl font-semibold text-gray-900">Папки</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <Card
                key={folder.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  selectedFolder === folder.id ? 'ring-2 ring-primary shadow-lg' : ''
                }`}
                onClick={() => setSelectedFolder(selectedFolder === folder.id ? null : folder.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${folder.color}`}>
                      <Icon name={folder.icon as any} size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{folder.name}</h3>
                      <p className="text-sm text-gray-500">
                        {documents.filter(d => d.folderId === folder.id).length} док.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Icon name="FileText" className="text-gray-700" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900">Документы</h2>
              {selectedFolder && (
                <Badge variant="secondary" className="text-sm">
                  {getFolderById(selectedFolder)?.name}
                  <button
                    onClick={() => setSelectedFolder(null)}
                    className="ml-2 hover:text-destructive transition-colors"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
            <Button className="gap-2 hover:scale-105 transition-transform">
              <Icon name="Upload" size={20} />
              Загрузить PDF
            </Button>
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
                  <Card key={doc.id} className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
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
                      <CardDescription className="line-clamp-2 text-sm">
                        {doc.description}
                      </CardDescription>
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
                        <Button variant="outline" size="sm" className="flex-1 hover:bg-primary hover:text-white transition-all">
                          <Icon name="Eye" size={16} className="mr-1" />
                          Открыть
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 hover:bg-secondary hover:text-white transition-all">
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
      </div>
    </div>
  );
};

export default Index;
