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
}

function DraggableField({ field }: DraggableFieldProps) {
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
      className={cn(
        'flex items-center gap-2 p-2.5 rounded-md border border-border bg-background cursor-grab',
        'hover:border-primary/50 hover:bg-accent/50 transition-colors',
        isDragging && 'opacity-50 ring-2 ring-primary'
      )}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded bg-muted">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <span className="text-sm font-medium">{field.label}</span>
    </div>
  );
}

export function FieldPalette() {
  const basicFields = fieldTypes.filter((f) => f.category === 'basic');
  const advancedFields = fieldTypes.filter((f) => f.category === 'advanced');
  const layoutFields = fieldTypes.filter((f) => f.category === 'layout');

  return (
    <div className="w-64 border-l bg-muted/30 p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-muted-foreground mb-4">
        أنواع الحقول
      </h3>

      <div className="space-y-6">
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">أساسي</h4>
          <div className="space-y-2">
            {basicFields.map((field) => (
              <DraggableField key={field.type} field={field} />
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">متقدم</h4>
          <div className="space-y-2">
            {advancedFields.map((field) => (
              <DraggableField key={field.type} field={field} />
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">التخطيط</h4>
          <div className="space-y-2">
            {layoutFields.map((field) => (
              <DraggableField key={field.type} field={field} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
