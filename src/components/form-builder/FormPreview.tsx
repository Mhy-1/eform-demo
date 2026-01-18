import { useForm } from 'react-hook-form';
import { FormField, FormSettings } from '../../types/form';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface FormPreviewProps {
  fields: FormField[];
  settings: FormSettings;
  onSubmit?: (data: Record<string, unknown>) => void;
}

export function FormPreview({ fields, settings, onSubmit }: FormPreviewProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const onFormSubmit = (data: Record<string, unknown>) => {
    console.log('Form submitted:', data);
    onSubmit?.(data);
    alert(settings.successMessage || 'تم إرسال النموذج بنجاح!');
    reset();
  };

  const renderField = (field: FormField) => {
    const widthClass =
      field.width === 'half'
        ? 'w-full sm:w-1/2'
        : field.width === 'third'
          ? 'w-full sm:w-1/3'
          : 'w-full';

    if (field.type === 'section') {
      return (
        <div key={field.id} className="w-full pt-6 pb-2">
          <h3 className="text-lg font-semibold">{field.label}</h3>
          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
        </div>
      );
    }

    if (field.type === 'divider') {
      return (
        <div key={field.id} className="w-full py-4">
          <hr className="border-t border-border" />
        </div>
      );
    }

    const errorMessage = errors[field.id]?.message as string | undefined;

    return (
      <div key={field.id} className={cn(widthClass, 'p-2')}>
        <div className="space-y-1.5">
          <label htmlFor={field.id} className="block text-sm font-medium">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </label>

          {renderFieldInput(field, register)}

          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}

          {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
        </div>
      </div>
    );
  };

  const renderFieldInput = (
    field: FormField,
    register: ReturnType<typeof useForm>['register']
  ) => {
    const baseInputClass =
      'w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <input
            id={field.id}
            type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
            placeholder={field.placeholder}
            {...register(field.id, { required: field.required && 'هذا الحقل مطلوب' })}
            className={baseInputClass}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={field.id}
            placeholder={field.placeholder}
            rows={4}
            {...register(field.id, { required: field.required && 'هذا الحقل مطلوب' })}
            className={cn(baseInputClass, 'resize-none')}
          />
        );

      case 'number':
        return (
          <input
            id={field.id}
            type="number"
            placeholder={field.placeholder}
            {...register(field.id, {
              required: field.required && 'هذا الحقل مطلوب',
              valueAsNumber: true,
            })}
            className={baseInputClass}
          />
        );

      case 'date':
        return (
          <input
            id={field.id}
            type="date"
            {...register(field.id, { required: field.required && 'هذا الحقل مطلوب' })}
            className={baseInputClass}
          />
        );

      case 'time':
        return (
          <input
            id={field.id}
            type="time"
            {...register(field.id, { required: field.required && 'هذا الحقل مطلوب' })}
            className={baseInputClass}
          />
        );

      case 'select':
        return (
          <select
            id={field.id}
            {...register(field.id, { required: field.required && 'هذا الحقل مطلوب' })}
            className={baseInputClass}
          >
            <option value="">اختر خياراً...</option>
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
            <input
              id={field.id}
              type="checkbox"
              {...register(field.id)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm">نعم</span>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <input
                  id={`${field.id}-${opt.value}`}
                  type="radio"
                  value={opt.value}
                  {...register(field.id, {
                    required: field.required && 'الرجاء اختيار خيار',
                  })}
                  className="h-4 w-4"
                />
                <label htmlFor={`${field.id}-${opt.value}`} className="text-sm">
                  {opt.label}
                </label>
              </div>
            ))}
          </div>
        );

      case 'file':
        return (
          <div className="border-2 border-dashed border-input rounded-md p-6 text-center hover:border-primary/50 transition-colors">
            <input
              id={field.id}
              type="file"
              {...register(field.id)}
              className="hidden"
            />
            <label htmlFor={field.id} className="cursor-pointer">
              <p className="text-sm text-muted-foreground">
                انقر للرفع أو اسحب وأفلت
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, DOC, JPG, PNG حتى 10MB
              </p>
            </label>
          </div>
        );

      case 'signature':
        return (
          <div className="border-2 border-dashed border-input rounded-md p-8 text-center bg-muted/30">
            <p className="text-sm text-muted-foreground">
              لوحة التوقيع ستظهر هنا
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              (الوضع التجريبي - لوحة التوقيع معطلة)
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="flex flex-wrap -m-2">{fields.map(renderField)}</div>

        <div className="flex gap-3 pt-6 border-t mt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'جاري الإرسال...' : settings.submitButtonText || 'إرسال'}
          </Button>
          {settings.allowSaveDraft && (
            <Button type="button" variant="outline">
              حفظ كمسودة
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
