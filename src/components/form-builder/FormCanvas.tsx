import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Settings, Copy } from 'lucide-react';
import { FormField } from '../../types/form';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';

interface SortableFieldProps {
  field: FormField;
  isSelected: boolean;
  onSelect: (fieldId: string) => void;
  onDelete: (fieldId: string) => void;
  onDuplicate: (fieldId: string) => void;
}

function SortableField({
  field,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const widthClass =
    field.width === 'half'
      ? 'w-1/2'
      : field.width === 'third'
        ? 'w-1/3'
        : 'w-full';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        widthClass,
        'p-1',
        isDragging && 'opacity-50'
      )}
    >
      <div
        className={cn(
          'relative group border rounded-lg p-4 bg-background transition-all',
          isSelected
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-border hover:border-primary/50'
        )}
        onClick={() => onSelect(field.id)}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Field Content */}
        <div className="ml-6">
          {field.type === 'section' ? (
            <div className="py-2">
              <h3 className="font-semibold text-lg">{field.label}</h3>
              {field.description && (
                <p className="text-sm text-muted-foreground">{field.description}</p>
              )}
            </div>
          ) : field.type === 'divider' ? (
            <div className="py-4">
              <hr className="border-t border-border" />
            </div>
          ) : (
            <>
              <label className="block text-sm font-medium mb-1">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </label>
              {renderFieldPreview(field)}
              {field.description && (
                <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(field.id);
            }}
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(field.id);
            }}
          >
            <Settings className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(field.id);
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function renderFieldPreview(field: FormField) {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'phone':
      return (
        <input
          type="text"
          placeholder={field.placeholder}
          disabled
          className="w-full px-3 py-2 border rounded-md bg-muted/50 text-muted-foreground text-sm"
        />
      );
    case 'textarea':
      return (
        <textarea
          placeholder={field.placeholder}
          disabled
          rows={3}
          className="w-full px-3 py-2 border rounded-md bg-muted/50 text-muted-foreground text-sm resize-none"
        />
      );
    case 'number':
      return (
        <input
          type="number"
          placeholder={field.placeholder}
          disabled
          className="w-full px-3 py-2 border rounded-md bg-muted/50 text-muted-foreground text-sm"
        />
      );
    case 'date':
      return (
        <input
          type="date"
          disabled
          className="w-full px-3 py-2 border rounded-md bg-muted/50 text-muted-foreground text-sm"
        />
      );
    case 'time':
      return (
        <input
          type="time"
          disabled
          className="w-full px-3 py-2 border rounded-md bg-muted/50 text-muted-foreground text-sm"
        />
      );
    case 'select':
      return (
        <select
          disabled
          className="w-full px-3 py-2 border rounded-md bg-muted/50 text-muted-foreground text-sm"
        >
          <option>Select an option...</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    case 'checkbox':
      return (
        <div className="flex items-center gap-2">
          <input type="checkbox" disabled className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">Checkbox option</span>
        </div>
      );
    case 'radio':
      return (
        <div className="space-y-2">
          {field.options?.map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <input type="radio" disabled className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">{opt.label}</span>
            </div>
          ))}
        </div>
      );
    case 'file':
      return (
        <div className="border-2 border-dashed rounded-md p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Drag and drop or click to upload
          </p>
        </div>
      );
    case 'signature':
      return (
        <div className="border-2 border-dashed rounded-md p-8 text-center bg-muted/30">
          <p className="text-sm text-muted-foreground">Signature pad</p>
        </div>
      );
    default:
      return null;
  }
}

interface FormCanvasProps {
  fields: FormField[];
  selectedFieldId: string | null;
  onSelectField: (fieldId: string | null) => void;
  onDeleteField: (fieldId: string) => void;
  onDuplicateField: (fieldId: string) => void;
}

export function FormCanvas({
  fields,
  selectedFieldId,
  onSelectField,
  onDeleteField,
  onDuplicateField,
}: FormCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'form-canvas',
  });

  return (
    <div className="flex-1 bg-muted/20 p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <div
          ref={setNodeRef}
          className={cn(
            'min-h-[400px] border-2 border-dashed rounded-lg p-4 transition-colors',
            isOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/20',
            fields.length === 0 && 'flex items-center justify-center'
          )}
          onClick={() => onSelectField(null)}
        >
          {fields.length === 0 ? (
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium mb-1">Drag fields here</p>
              <p className="text-sm">
                Start building your form by dragging fields from the left panel
              </p>
            </div>
          ) : (
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-wrap -m-1">
                {fields.map((field) => (
                  <SortableField
                    key={field.id}
                    field={field}
                    isSelected={selectedFieldId === field.id}
                    onSelect={onSelectField}
                    onDelete={onDeleteField}
                    onDuplicate={onDuplicateField}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>
      </div>
    </div>
  );
}
