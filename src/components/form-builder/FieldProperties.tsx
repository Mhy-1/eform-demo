import React from 'react';
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
      <div className="w-72 border-l bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground text-center mt-8">
          Select a field to edit its properties
        </p>
      </div>
    );
  }

  const updateField = (updates: Partial<FormField>) => {
    onUpdate({ ...field, ...updates });
  };

  const addOption = () => {
    const newOption: FieldOption = {
      label: `Option ${(field.options?.length || 0) + 1}`,
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

  return (
    <div className="w-72 border-l bg-muted/30 overflow-y-auto">
      <div className="sticky top-0 bg-muted/30 border-b p-4 flex items-center justify-between">
        <h3 className="font-semibold">Field Properties</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Label */}
        <div className="space-y-2">
          <Label htmlFor="field-label">Label</Label>
          <Input
            id="field-label"
            value={field.label}
            onChange={(e) => updateField({ label: e.target.value })}
          />
        </div>

        {/* Placeholder */}
        {['text', 'textarea', 'email', 'phone', 'number'].includes(field.type) && (
          <div className="space-y-2">
            <Label htmlFor="field-placeholder">Placeholder</Label>
            <Input
              id="field-placeholder"
              value={field.placeholder || ''}
              onChange={(e) => updateField({ placeholder: e.target.value })}
            />
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="field-description">Help Text</Label>
          <Input
            id="field-description"
            value={field.description || ''}
            onChange={(e) => updateField({ description: e.target.value })}
            placeholder="Additional instructions..."
          />
        </div>

        {/* Required */}
        {field.type !== 'section' && field.type !== 'divider' && (
          <div className="flex items-center justify-between">
            <Label htmlFor="field-required">Required</Label>
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
          <Label>Field Width</Label>
          <div className="flex gap-2">
            {(['full', 'half', 'third'] as const).map((width) => (
              <Button
                key={width}
                variant={field.width === width ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateField({ width })}
                className="flex-1 capitalize"
              >
                {width === 'full' ? '100%' : width === 'half' ? '50%' : '33%'}
              </Button>
            ))}
          </div>
        </div>

        {/* Options (for select/radio) */}
        {hasOptions && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <Button variant="ghost" size="sm" onClick={addOption}>
                <Plus className="w-4 h-4 mr-1" />
                Add
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
            Field Type: <span className="font-medium capitalize">{field.type}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ID: <span className="font-mono text-[10px]">{field.id}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
