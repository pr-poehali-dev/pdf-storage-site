import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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

interface DocumentCardProps {
  doc: Document;
  folder: Folder | undefined;
  isAdmin: boolean;
  apiUrl: string;
  onEdit: (doc: Document) => void;
  onDelete: (docId: string, e: React.MouseEvent) => void;
}

const DocumentCard = ({ doc, folder, isAdmin, apiUrl, onEdit, onDelete }: DocumentCardProps) => {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group relative">
      {isAdmin && (
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(doc);
            }}
            className="p-2 hover:bg-blue-100 rounded"
          >
            <Icon name="Edit" size={16} className="text-blue-600" />
          </button>
          <button
            onClick={(e) => onDelete(doc.id, e)}
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
            onClick={() => window.open(`${apiUrl}?path=view&id=${doc.id}`, '_blank')}
          >
            <Icon name="Eye" size={16} className="mr-1" />
            Открыть
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 hover:bg-secondary hover:text-white transition-all"
            disabled={!doc.hasFile}
            onClick={() => window.open(`${apiUrl}?path=download&id=${doc.id}`, '_blank')}
          >
            <Icon name="Download" size={16} className="mr-1" />
            Скачать
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
