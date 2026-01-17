import { useState } from 'react';
import { ArrowLeft, Save, FileJson } from 'lucide-react';
import { FormDefinition, FormField, FormSettings } from './types/form';
import { mockForms, formCategories } from './data/mockForms';
import { generateId } from './utils/id';
import { Header } from './components/Header';
import { FormList } from './components/FormList';
import { FormBuilder, FormPreview } from './components/form-builder';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Label } from './components/ui/Label';
import { Tabs, TabsList, TabsTrigger } from './components/ui/Tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './components/ui/Dialog';
import { Toaster, toast } from 'sonner';

type ViewMode = 'list' | 'builder' | 'preview';

function App() {
  const [forms, setForms] = useState<FormDefinition[]>(mockForms);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentForm, setCurrentForm] = useState<FormDefinition | null>(null);
  const [builderFields, setBuilderFields] = useState<FormField[]>([]);
  const [activeTab, setActiveTab] = useState<'build' | 'preview' | 'settings'>('build');
  const [showNewFormDialog, setShowNewFormDialog] = useState(false);
  const [newFormName, setNewFormName] = useState('');
  const [newFormDescription, setNewFormDescription] = useState('');
  const [newFormCategory, setNewFormCategory] = useState('HR');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Settings
  const [formSettings, setFormSettings] = useState<FormSettings>({
    submitButtonText: 'Submit',
    successMessage: 'Form submitted successfully!',
    allowSaveDraft: true,
    requireSignature: false,
    notifyOnSubmit: true,
    theme: 'default',
  });

  const filteredForms = forms.filter((form) => {
    const matchesCategory = filterCategory === 'All' || form.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || form.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleNewForm = () => {
    setShowNewFormDialog(true);
    setNewFormName('');
    setNewFormDescription('');
    setNewFormCategory('HR');
  };

  const createNewForm = () => {
    if (!newFormName.trim()) {
      toast.error('Please enter a form name');
      return;
    }

    const newForm: FormDefinition = {
      id: `form-${generateId()}`,
      name: newFormName,
      description: newFormDescription,
      category: newFormCategory,
      version: 1,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: { ...formSettings },
      sections: [],
    };

    setCurrentForm(newForm);
    setBuilderFields([]);
    setFormSettings({ ...formSettings });
    setViewMode('builder');
    setActiveTab('build');
    setShowNewFormDialog(false);
    toast.success('New form created');
  };

  const handleEditForm = (form: FormDefinition) => {
    setCurrentForm(form);
    // Flatten sections into fields for the builder
    const allFields = form.sections.flatMap((s) => s.fields);
    setBuilderFields(allFields);
    setFormSettings(form.settings);
    setViewMode('builder');
    setActiveTab('build');
  };

  const handlePreviewForm = (form: FormDefinition) => {
    setCurrentForm(form);
    const allFields = form.sections.flatMap((s) => s.fields);
    setBuilderFields(allFields);
    setFormSettings(form.settings);
    setViewMode('preview');
  };

  const handleDuplicateForm = (form: FormDefinition) => {
    const duplicatedForm: FormDefinition = {
      ...form,
      id: `form-${generateId()}`,
      name: `${form.name} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setForms([duplicatedForm, ...forms]);
    toast.success('Form duplicated');
  };

  const handleDeleteForm = (formId: string) => {
    setForms(forms.filter((f) => f.id !== formId));
    toast.success('Form deleted');
  };

  const handleSaveForm = () => {
    if (!currentForm) return;

    const updatedForm: FormDefinition = {
      ...currentForm,
      updatedAt: new Date().toISOString(),
      settings: formSettings,
      sections: [
        {
          id: 'main-section',
          title: 'Form Fields',
          fields: builderFields,
        },
      ],
    };

    const existingIndex = forms.findIndex((f) => f.id === currentForm.id);
    if (existingIndex >= 0) {
      const newForms = [...forms];
      newForms[existingIndex] = updatedForm;
      setForms(newForms);
    } else {
      setForms([updatedForm, ...forms]);
    }

    setCurrentForm(updatedForm);
    toast.success('Form saved successfully');
  };

  const handlePublishForm = () => {
    if (!currentForm) return;

    const updatedForm: FormDefinition = {
      ...currentForm,
      status: 'published',
      updatedAt: new Date().toISOString(),
      version: currentForm.version + 1,
      settings: formSettings,
      sections: [
        {
          id: 'main-section',
          title: 'Form Fields',
          fields: builderFields,
        },
      ],
    };

    const existingIndex = forms.findIndex((f) => f.id === currentForm.id);
    if (existingIndex >= 0) {
      const newForms = [...forms];
      newForms[existingIndex] = updatedForm;
      setForms(newForms);
    } else {
      setForms([updatedForm, ...forms]);
    }

    setCurrentForm(updatedForm);
    toast.success('Form published!');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentForm(null);
    setBuilderFields([]);
    setActiveTab('build');
  };

  const exportFormJson = () => {
    if (!currentForm) return;

    const formData = {
      ...currentForm,
      settings: formSettings,
      sections: [
        {
          id: 'main-section',
          title: 'Form Fields',
          fields: builderFields,
        },
      ],
    };

    const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentForm.name.replace(/\s+/g, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Form exported as JSON');
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" richColors />

      {viewMode === 'list' && (
        <>
          <Header onNewForm={handleNewForm} />
          <main className="container px-4 py-8">
            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-4 items-center">
              <Input
                placeholder="Search forms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background text-sm"
              >
                {formCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="All">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <FormList
              forms={filteredForms}
              onEdit={handleEditForm}
              onPreview={handlePreviewForm}
              onDuplicate={handleDuplicateForm}
              onDelete={handleDeleteForm}
            />
          </main>
        </>
      )}

      {(viewMode === 'builder' || viewMode === 'preview') && currentForm && (
        <div className="flex flex-col h-screen">
          {/* Builder Header */}
          <header className="border-b bg-background px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={handleBackToList}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <div>
                  <h1 className="font-semibold">{currentForm.name}</h1>
                  <p className="text-xs text-muted-foreground">
                    {currentForm.status === 'published' ? 'Published' : 'Draft'} - v
                    {currentForm.version}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Tabs defaultValue="build" value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                  <TabsList>
                    <TabsTrigger value="build">Build</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex items-center gap-2 ml-4">
                  <Button variant="outline" size="sm" onClick={exportFormJson}>
                    <FileJson className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSaveForm}>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" onClick={handlePublishForm}>
                    Publish
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'build' && (
              <FormBuilder initialFields={builderFields} onChange={setBuilderFields} />
            )}

            {activeTab === 'preview' && (
              <div className="h-full overflow-y-auto p-6 bg-muted/20">
                <div className="bg-background rounded-lg shadow-sm border p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold">{currentForm.name}</h2>
                    <p className="text-muted-foreground">{currentForm.description}</p>
                  </div>
                  <FormPreview fields={builderFields} settings={formSettings} />
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="h-full overflow-y-auto p-6 bg-muted/20">
                <div className="max-w-2xl mx-auto bg-background rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold mb-6">Form Settings</h2>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="submit-text">Submit Button Text</Label>
                      <Input
                        id="submit-text"
                        value={formSettings.submitButtonText}
                        onChange={(e) =>
                          setFormSettings({ ...formSettings, submitButtonText: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="success-message">Success Message</Label>
                      <Input
                        id="success-message"
                        value={formSettings.successMessage}
                        onChange={(e) =>
                          setFormSettings({ ...formSettings, successMessage: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <div className="flex gap-2">
                        {(['default', 'compact', 'modern'] as const).map((theme) => (
                          <Button
                            key={theme}
                            variant={formSettings.theme === theme ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFormSettings({ ...formSettings, theme })}
                            className="capitalize"
                          >
                            {theme}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-medium">Form Options</h3>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Allow Save as Draft</Label>
                          <p className="text-xs text-muted-foreground">
                            Users can save progress and complete later
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formSettings.allowSaveDraft}
                          onChange={(e) =>
                            setFormSettings({ ...formSettings, allowSaveDraft: e.target.checked })
                          }
                          className="h-4 w-4"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Require Signature</Label>
                          <p className="text-xs text-muted-foreground">
                            Form must be signed before submission
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formSettings.requireSignature}
                          onChange={(e) =>
                            setFormSettings({ ...formSettings, requireSignature: e.target.checked })
                          }
                          className="h-4 w-4"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Notify on Submit</Label>
                          <p className="text-xs text-muted-foreground">
                            Send email notification when form is submitted
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formSettings.notifyOnSubmit}
                          onChange={(e) =>
                            setFormSettings({ ...formSettings, notifyOnSubmit: e.target.checked })
                          }
                          className="h-4 w-4"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Form Dialog */}
      <Dialog open={showNewFormDialog} onOpenChange={setShowNewFormDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
            <DialogDescription>
              Give your form a name and description to get started.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="form-name">Form Name *</Label>
              <Input
                id="form-name"
                placeholder="e.g., Employee Onboarding Form"
                value={newFormName}
                onChange={(e) => setNewFormName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-description">Description</Label>
              <Input
                id="form-description"
                placeholder="Brief description of the form's purpose"
                value={newFormDescription}
                onChange={(e) => setNewFormDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-category">Category</Label>
              <select
                id="form-category"
                value={newFormCategory}
                onChange={(e) => setNewFormCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              >
                {formCategories.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFormDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createNewForm}>Create Form</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
