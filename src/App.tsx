import { useState, useEffect } from 'react';
import { ArrowRight, Save, FileJson } from 'lucide-react';
import { FormDefinition, FormField, FormSettings } from './types/form';
import { mockForms, formCategories } from './data/mockForms';
import { generateId } from './utils/id';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FormList } from './components/FormList';
import { FormListSkeleton } from './components/ui/Skeleton';
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

// Arabic category labels
const categoryLabels: Record<string, string> = {
  'All': 'جميع التصنيفات',
  'HR': 'الموارد البشرية',
  'Safety': 'السلامة',
  'Security': 'الأمن',
  'Operations': 'العمليات',
  'IT': 'تقنية المعلومات',
};

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
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading for demo effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Form Settings
  const [formSettings, setFormSettings] = useState<FormSettings>({
    submitButtonText: 'إرسال',
    successMessage: 'تم إرسال النموذج بنجاح!',
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
      toast.error('الرجاء إدخال اسم النموذج');
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
    toast.success('تم إنشاء النموذج بنجاح');
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
      name: `${form.name} (نسخة)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setForms([duplicatedForm, ...forms]);
    toast.success('تم نسخ النموذج');
  };

  const handleDeleteForm = (formId: string) => {
    setForms(forms.filter((f) => f.id !== formId));
    toast.success('تم حذف النموذج');
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
    toast.success('تم حفظ النموذج بنجاح');
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
    toast.success('تم نشر النموذج بنجاح!');
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
    toast.success('تم تصدير النموذج بصيغة JSON');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-left" richColors />

      {viewMode === 'list' && (
        <>
          <Header onNewForm={handleNewForm} />
          <main className="container px-4 py-8 flex-1">
            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-4 items-center">
              <Input
                placeholder="بحث في النماذج..."
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
                    {categoryLabels[cat] || cat}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="All">جميع الحالات</option>
                <option value="draft">مسودة</option>
                <option value="published">منشور</option>
                <option value="archived">مؤرشف</option>
              </select>
            </div>

            {isLoading ? (
              <FormListSkeleton count={3} />
            ) : (
              <FormList
                forms={filteredForms}
                onEdit={handleEditForm}
                onPreview={handlePreviewForm}
                onDuplicate={handleDuplicateForm}
                onDelete={handleDeleteForm}
              />
            )}
          </main>
          <Footer />
        </>
      )}

      {(viewMode === 'builder' || viewMode === 'preview') && currentForm && (
        <div className="flex flex-col h-screen">
          {/* Builder Header */}
          <header className="border-b bg-background px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={handleBackToList}>
                  <ArrowRight className="w-4 h-4 ml-1" />
                  رجوع
                </Button>
                <div>
                  <h1 className="font-semibold">{currentForm.name}</h1>
                  <p className="text-xs text-muted-foreground">
                    {currentForm.status === 'published' ? 'منشور' : 'مسودة'} - الإصدار
                    {currentForm.version}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Tabs defaultValue="build" value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                  <TabsList>
                    <TabsTrigger value="build">البناء</TabsTrigger>
                    <TabsTrigger value="preview">معاينة</TabsTrigger>
                    <TabsTrigger value="settings">الإعدادات</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex items-center gap-2 mr-4">
                  <Button variant="outline" size="sm" onClick={exportFormJson}>
                    <FileJson className="w-4 h-4 ml-1" />
                    تصدير
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSaveForm}>
                    <Save className="w-4 h-4 ml-1" />
                    حفظ
                  </Button>
                  <Button size="sm" onClick={handlePublishForm}>
                    نشر
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
                  <h2 className="text-lg font-semibold mb-6">إعدادات النموذج</h2>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="submit-text">نص زر الإرسال</Label>
                      <Input
                        id="submit-text"
                        value={formSettings.submitButtonText}
                        onChange={(e) =>
                          setFormSettings({ ...formSettings, submitButtonText: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="success-message">رسالة النجاح</Label>
                      <Input
                        id="success-message"
                        value={formSettings.successMessage}
                        onChange={(e) =>
                          setFormSettings({ ...formSettings, successMessage: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>المظهر</Label>
                      <div className="flex gap-2">
                        {(['default', 'compact', 'modern'] as const).map((theme) => (
                          <Button
                            key={theme}
                            variant={formSettings.theme === theme ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFormSettings({ ...formSettings, theme })}
                          >
                            {theme === 'default' ? 'افتراضي' : theme === 'compact' ? 'مضغوط' : 'عصري'}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-medium">خيارات النموذج</h3>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>السماح بالحفظ كمسودة</Label>
                          <p className="text-xs text-muted-foreground">
                            يمكن للمستخدمين حفظ التقدم وإكمال النموذج لاحقاً
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
                          <Label>التوقيع مطلوب</Label>
                          <p className="text-xs text-muted-foreground">
                            يجب توقيع النموذج قبل الإرسال
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
                          <Label>إشعار عند الإرسال</Label>
                          <p className="text-xs text-muted-foreground">
                            إرسال إشعار بالبريد الإلكتروني عند تقديم النموذج
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
            <DialogTitle>إنشاء نموذج جديد</DialogTitle>
            <DialogDescription>
              أدخل اسم النموذج ووصفه للبدء.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="form-name">اسم النموذج *</Label>
              <Input
                id="form-name"
                placeholder="مثال: نموذج تعيين موظف جديد"
                value={newFormName}
                onChange={(e) => setNewFormName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-description">الوصف</Label>
              <Input
                id="form-description"
                placeholder="وصف مختصر لغرض النموذج"
                value={newFormDescription}
                onChange={(e) => setNewFormDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-category">التصنيف</Label>
              <select
                id="form-category"
                value={newFormCategory}
                onChange={(e) => setNewFormCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              >
                {formCategories.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabels[cat] || cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFormDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={createNewForm}>إنشاء النموذج</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
