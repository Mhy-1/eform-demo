export function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-4 mt-auto">
      <div className="container px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
            نسخة تجريبية - Demo
          </span>
        </div>
        <p className="text-center sm:text-right">
          © {new Date().getFullYear()} م.مشاري دعجم
        </p>
      </div>
    </footer>
  );
}
