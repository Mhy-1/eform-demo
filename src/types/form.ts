export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'date'
  | 'time'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'signature'
  | 'section'
  | 'divider';

export interface FieldOption {
  label: string;
  value: string;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email';
  value?: string | number;
  message: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required: boolean;
  options?: FieldOption[];
  validation?: ValidationRule[];
  defaultValue?: string | number | boolean;
  width?: 'full' | 'half' | 'third';
  conditionalLogic?: {
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
    value: string | number;
  };
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  collapsed?: boolean;
}

export interface FormDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  sections: FormSection[];
  settings: FormSettings;
  createdAt: string;
  updatedAt: string;
}

export interface FormSettings {
  submitButtonText: string;
  successMessage: string;
  allowSaveDraft: boolean;
  requireSignature: boolean;
  notifyOnSubmit: boolean;
  theme: 'default' | 'compact' | 'modern';
}

export interface FormEntry {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  submittedBy?: string;
}

export interface FieldTypeConfig {
  type: FieldType;
  label: string;
  icon: string;
  category: 'basic' | 'advanced' | 'layout';
  defaultConfig: Partial<FormField>;
}
