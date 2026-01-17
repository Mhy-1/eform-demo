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
import { FormField, FieldTypeConfig } from '../../types/form';
import { fieldTypes } from '../../data/mockForms';
import { generateId } from '../../utils/id';
import { FieldPalette } from './FieldPalette';
import { FormCanvas } from './FormCanvas';
import { FieldProperties } from './FieldProperties';

interface FormBuilderProps {
  initialFields?: FormField[];
  onChange?: (fields: FormField[]) => void;
}

export function FormBuilder({ initialFields = [], onChange }: FormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

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
        setSelectedFieldId(newField.id);
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
      setSelectedFieldId(duplicatedField.id);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full">
        <FieldPalette />
        <FormCanvas
          fields={fields}
          selectedFieldId={selectedFieldId}
          onSelectField={setSelectedFieldId}
          onDeleteField={handleDeleteField}
          onDuplicateField={handleDuplicateField}
        />
        <FieldProperties
          field={selectedField}
          onUpdate={handleUpdateField}
          onClose={() => setSelectedFieldId(null)}
        />
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
