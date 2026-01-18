import { FileText, Edit, Eye, Copy, Trash2 } from 'lucide-react';
import { FormDefinition } from '../types/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

// Arabic category mapping
const categoryLabels: Record<string, string> = {
  'HR': 'الموارد البشرية',
  'Safety': 'السلامة',
  'Security': 'الأمن',
  'Operations': 'العمليات',
  'IT': 'تقنية المعلومات',
};

interface FormListProps {
  forms: FormDefinition[];
  onEdit: (form: FormDefinition) => void;
  onPreview: (form: FormDefinition) => void;
  onDuplicate: (form: FormDefinition) => void;
  onDelete: (formId: string) => void;
}

export function FormList({ forms, onEdit, onPreview, onDuplicate, onDelete }: FormListProps) {
  const getStatusBadge = (status: FormDefinition['status']) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">منشور</Badge>;
      case 'draft':
        return <Badge variant="secondary">مسودة</Badge>;
      case 'archived':
        return <Badge variant="outline">مؤرشف</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (forms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-1">لا توجد نماذج</h3>
        <p className="text-sm text-muted-foreground mb-4">
          أنشئ نموذجك الأول للبدء
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {forms.map((form) => (
        <Card
          key={form.id}
          className={cn(
            'group hover:shadow-md transition-shadow cursor-pointer',
            form.status === 'archived' && 'opacity-60'
          )}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-primary/10">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {categoryLabels[form.category] || form.category}
                </Badge>
              </div>
              {getStatusBadge(form.status)}
            </div>
            <CardTitle className="mt-3 text-lg">{form.name}</CardTitle>
            <CardDescription className="line-clamp-2">{form.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
              <span>
                {form.sections.reduce((acc, s) => acc + s.fields.length, 0)} حقل
              </span>
              <span>الإصدار {form.version}</span>
              <span>آخر تحديث {formatDate(form.updatedAt)}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(form);
                }}
              >
                <Edit className="w-3.5 h-3.5 ml-1" />
                تعديل
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(form);
                }}
              >
                <Eye className="w-3.5 h-3.5 ml-1" />
                معاينة
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(form);
                }}
              >
                <Copy className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('هل أنت متأكد من حذف هذا النموذج؟')) {
                    onDelete(form.id);
                  }
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
