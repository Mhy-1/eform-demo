import { X, Plus, Trash2 } from 'lucide-react';
import { FormField, FieldOption } from '../../types/form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { generateId } from '../../utils/id';

interface FieldPropertiesProps {
  field: FormField | null;
  onUpdate: (field: FormField) => void;
  onClose: () => void;
}

export function FieldProperties({ field, onUpdate, onClose }: FieldPropertiesProps) {
  if (!field) {
    return (
      <div className="w-72 border-r bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground text-center mt-8">
          اختر حقلاً لتعديل خصائصه
        </p>
      </div>
    );
  }

  const updateField = (updates: Partial<FormField>) => {
    onUpdate({ ...field, ...updates });
  };

  const addOption = () => {
    const newOption: FieldOption = {
      label: `الخيار ${(field.options?.length || 0) + 1}`,
      value: `option-${generateId()}`,
    };
    updateField({ options: [...(field.options || []), newOption] });
  };

  const updateOption = (index: number, updates: Partial<FieldOption>) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = { ...newOptions[index], ...updates };
    updateField({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = (field.options || []).filter((_, i) => i !== index);
    updateField({ options: newOptions });
  };

  const hasOptions = field.type === 'select' || field.type === 'radio';

  // Arabic field type labels
  const fieldTypeLabels: Record<string, string> = {
    text: 'حقل نص',
    textarea: 'منطقة نص',
    number: 'رقم',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    date: 'التاريخ',
    time: 'الوقت',
    select: 'قائمة منسدلة',
    checkbox: 'خيار متعدد',
    radio: 'اختيار واحد',
    file: 'رفع ملف',
    signature: 'التوقيع',
    section: 'عنوان القسم',
    divider: 'فاصل',
  };

  return (
    <div className="w-72 border-r bg-muted/30 overflow-y-auto">
      <div className="sticky top-0 bg-muted/30 border-b p-4 flex items-center justify-between">
        <h3 className="font-semibold">خصائص الحقل</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Label */}
        <div className="space-y-2">
          <Label htmlFor="field-label">العنوان</Label>
          <Input
            id="field-label"
            value={field.label}
            onChange={(e) => updateField({ label: e.target.value })}
          />
        </div>

        {/* Placeholder */}
        {['text', 'textarea', 'email', 'phone', 'number'].includes(field.type) && (
          <div className="space-y-2">
            <Label htmlFor="field-placeholder">نص توضيحي</Label>
            <Input
              id="field-placeholder"
              value={field.placeholder || ''}
              onChange={(e) => updateField({ placeholder: e.target.value })}
            />
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="field-description">نص المساعدة</Label>
          <Input
            id="field-description"
            value={field.description || ''}
            onChange={(e) => updateField({ description: e.target.value })}
            placeholder="تعليمات إضافية..."
          />
        </div>

        {/* Required */}
        {field.type !== 'section' && field.type !== 'divider' && (
          <div className="flex items-center justify-between">
            <Label htmlFor="field-required">مطلوب</Label>
            <input
              type="checkbox"
              id="field-required"
              checked={field.required}
              onChange={(e) => updateField({ required: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
          </div>
        )}

        {/* Width */}
        <div className="space-y-2">
          <Label>عرض الحقل</Label>
          <div className="flex gap-2">
            {(['full', 'half', 'third'] as const).map((width) => (
              <Button
                key={width}
                variant={field.width === width ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateField({ width })}
                className="flex-1"
              >
                {width === 'full' ? '١٠٠٪' : width === 'half' ? '٥٠٪' : '٣٣٪'}
              </Button>
            ))}
          </div>
        </div>

        {/* Options (for select/radio) */}
        {hasOptions && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>الخيارات</Label>
              <Button variant="ghost" size="sm" onClick={addOption}>
                <Plus className="w-4 h-4 ml-1" />
                إضافة
              </Button>
            </div>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={option.value} className="flex gap-2">
                  <Input
                    value={option.label}
                    onChange={(e) => updateOption(index, { label: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-destructive hover:text-destructive"
                    onClick={() => removeOption(index)}
                    disabled={(field.options?.length || 0) <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Field Type Info */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            نوع الحقل: <span className="font-medium">{fieldTypeLabels[field.type] || field.type}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            المعرّف: <span className="font-mono text-[10px]" dir="ltr">{field.id}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
