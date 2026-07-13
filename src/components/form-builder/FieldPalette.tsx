import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
  Type,
  AlignLeft,
  Hash,
  Mail,
  Phone,
  Calendar,
  Clock,
  ChevronDown,
  CheckSquare,
  Circle,
  Upload,
  PenTool,
  Layers,
  Minus,
} from 'lucide-react';
import { FieldTypeConfig } from '../../types/form';
import { fieldTypes } from '../../data/mockForms';
import { cn } from '../../utils/cn';

const iconMap: Record<string, React.ElementType> = {
  Type,
  AlignLeft,
  Hash,
  Mail,
  Phone,
  Calendar,
  Clock,
  ChevronDown,
  CheckSquare,
  Circle,
  Upload,
  PenTool,
  Layers,
  Minus,
};

interface DraggableFieldProps {
  field: FieldTypeConfig;
  onAddField?: (field: FieldTypeConfig) => void;
}

function DraggableField({ field, onAddField }: DraggableFieldProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${field.type}`,
    data: {
      type: 'palette-item',
      fieldType: field,
    },
  });

  const Icon = iconMap[field.icon] || Type;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onAddField?.(field)}
      className={cn(
        'flex items-center gap-2 p-2.5 rounded-md border border-border bg-background cursor-grab',
        'hover:border-primary/50 hover:bg-accent/50 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isDragging && 'opacity-50 ring-2 ring-primary'
      )}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded bg-muted shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <span className="text-sm font-medium">{field.label}</span>
    </div>
  );
}

interface FieldPaletteProps {
  onAddField?: (field: FieldTypeConfig) => void;
}

export function FieldPalette({ onAddField }: FieldPaletteProps) {
  const basicFields = fieldTypes.filter((f) => f.category === 'basic');
  const advancedFields = fieldTypes.filter((f) => f.category === 'advanced');
  const layoutFields = fieldTypes.filter((f) => f.category === 'layout');

  return (
    <div className="w-full h-full md:w-64 md:border-l bg-muted/30 p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-muted-foreground mb-1">
        أنواع الحقول
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        انقر لإضافة الحقل، أو اسحبه إلى موضع محدد في النموذج
      </p>

      <div className="space-y-6">
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">أساسي</h4>
          <div className="space-y-2">
            {basicFields.map((field) => (
              <DraggableField key={field.type} field={field} onAddField={onAddField} />
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">متقدم</h4>
          <div className="space-y-2">
            {advancedFields.map((field) => (
              <DraggableField key={field.type} field={field} onAddField={onAddField} />
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">التخطيط</h4>
          <div className="space-y-2">
            {layoutFields.map((field) => (
              <DraggableField key={field.type} field={field} onAddField={onAddField} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
