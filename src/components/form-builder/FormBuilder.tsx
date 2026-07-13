import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Layers, LayoutGrid, Settings2 } from 'lucide-react';
import { FormField, FieldTypeConfig } from '../../types/form';
import { fieldTypes } from '../../data/mockForms';
import { generateId } from '../../utils/id';
import { cn } from '../../utils/cn';
import { FieldPalette } from './FieldPalette';
import { FormCanvas } from './FormCanvas';
import { FieldProperties } from './FieldProperties';

interface FormBuilderProps {
  initialFields?: FormField[];
  onChange?: (fields: FormField[]) => void;
}

type MobilePanel = 'palette' | 'canvas' | 'properties';

export function FormBuilder({ initialFields = [], onChange }: FormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  // Below the md breakpoint the three panels can't fit side by side, so only
  // one is shown at a time and this tracks which. Ignored on desktop, where
  // all three panels are always visible.
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('canvas');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const selectedField = fields.find((f) => f.id === selectedFieldId) || null;

  const updateFields = useCallback(
    (newFields: FormField[]) => {
      setFields(newFields);
      onChange?.(newFields);
    },
    [onChange]
  );

  // Selecting a field also brings the properties panel forward on mobile,
  // where only one panel is visible at a time.
  const selectField = useCallback((fieldId: string | null) => {
    setSelectedFieldId(fieldId);
    if (fieldId) {
      setMobilePanel('properties');
    }
  }, []);

  const handleAddFieldFromPalette = useCallback(
    (fieldTypeData: FieldTypeConfig) => {
      const newField: FormField = {
        id: `field-${generateId()}`,
        type: fieldTypeData.type,
        label: fieldTypeData.defaultConfig.label || fieldTypeData.label,
        placeholder: fieldTypeData.defaultConfig.placeholder,
        description: fieldTypeData.defaultConfig.description,
        required: fieldTypeData.defaultConfig.required || false,
        width: fieldTypeData.defaultConfig.width || 'full',
        options: fieldTypeData.defaultConfig.options,
      };
      updateFields([...fields, newField]);
      selectField(newField.id);
    },
    [fields, updateFields, selectField]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Check if dragging from palette
    if (active.id.toString().startsWith('palette-')) {
      const fieldTypeData = active.data.current?.fieldType as FieldTypeConfig;
      if (fieldTypeData) {
        const newField: FormField = {
          id: `field-${generateId()}`,
          type: fieldTypeData.type,
          label: fieldTypeData.defaultConfig.label || fieldTypeData.label,
          placeholder: fieldTypeData.defaultConfig.placeholder,
          description: fieldTypeData.defaultConfig.description,
          required: fieldTypeData.defaultConfig.required || false,
          width: fieldTypeData.defaultConfig.width || 'full',
          options: fieldTypeData.defaultConfig.options,
        };

        // Add to canvas
        if (over.id === 'form-canvas') {
          updateFields([...fields, newField]);
        } else {
          // Insert at specific position
          const overIndex = fields.findIndex((f) => f.id === over.id);
          if (overIndex !== -1) {
            const newFields = [...fields];
            newFields.splice(overIndex, 0, newField);
            updateFields(newFields);
          } else {
            updateFields([...fields, newField]);
          }
        }
        selectField(newField.id);
      }
    } else {
      // Reordering existing fields
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        updateFields(arrayMove(fields, oldIndex, newIndex));
      }
    }
  };

  const handleUpdateField = (updatedField: FormField) => {
    updateFields(fields.map((f) => (f.id === updatedField.id ? updatedField : f)));
  };

  const handleDeleteField = (fieldId: string) => {
    updateFields(fields.filter((f) => f.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  const handleDuplicateField = (fieldId: string) => {
    const fieldToDuplicate = fields.find((f) => f.id === fieldId);
    if (fieldToDuplicate) {
      const duplicatedField: FormField = {
        ...fieldToDuplicate,
        id: `field-${generateId()}`,
        label: `${fieldToDuplicate.label} (Copy)`,
      };
      const index = fields.findIndex((f) => f.id === fieldId);
      const newFields = [...fields];
      newFields.splice(index + 1, 0, duplicatedField);
      updateFields(newFields);
      selectField(duplicatedField.id);
    }
  };

  const mobileTabs: { id: MobilePanel; label: string; icon: typeof Layers }[] = [
    { id: 'palette', label: 'الحقول', icon: Layers },
    { id: 'canvas', label: `النموذج${fields.length > 0 ? ` (${fields.length})` : ''}`, icon: LayoutGrid },
    { id: 'properties', label: 'الخصائص', icon: Settings2 },
  ];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full min-h-0 md:flex-row">
        {/* Mobile panel switcher: below md, panels can't fit side by side,
            so only one shows at a time. Hidden on desktop, where all three
            panels are always visible together. */}
        <div className="md:hidden shrink-0 border-b bg-background">
          <div className="grid grid-cols-3">
            {mobileTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMobilePanel(id)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium border-b-2 transition-colors',
                  mobilePanel === id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
                aria-current={mobilePanel === id}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div
          className={cn(
            'min-h-0',
            mobilePanel === 'palette' ? 'flex-1' : 'hidden',
            'md:flex-none md:block'
          )}
        >
          <FieldPalette onAddField={handleAddFieldFromPalette} />
        </div>
        <div
          className={cn(
            'min-h-0',
            mobilePanel === 'canvas' ? 'flex-1' : 'hidden',
            'md:flex-1 md:block'
          )}
        >
          <FormCanvas
            fields={fields}
            selectedFieldId={selectedFieldId}
            onSelectField={selectField}
            onDeleteField={handleDeleteField}
            onDuplicateField={handleDuplicateField}
          />
        </div>
        <div
          className={cn(
            'min-h-0',
            mobilePanel === 'properties' ? 'flex-1' : 'hidden',
            'md:flex-none md:block'
          )}
        >
          <FieldProperties
            field={selectedField}
            onUpdate={handleUpdateField}
            onClose={() => setSelectedFieldId(null)}
          />
        </div>
      </div>
      <DragOverlay>
        {activeId && activeId.startsWith('palette-') && (
          <div className="p-3 bg-background border rounded-lg shadow-lg opacity-90">
            <span className="text-sm font-medium">
              {fieldTypes.find((f) => `palette-${f.type}` === activeId)?.label}
            </span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
