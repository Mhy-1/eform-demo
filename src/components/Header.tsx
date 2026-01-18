import { FileText } from 'lucide-react';
import { Button } from './ui/Button';

interface HeaderProps {
  onNewForm: () => void;
}

export function Header({ onNewForm }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">منشئ النماذج الإلكترونية</h1>
            <p className="text-xs text-muted-foreground">منصة إنشاء النماذج الديناميكية</p>
          </div>
        </div>

        <Button onClick={onNewForm}>
          <span className="ml-2">+</span>
          نموذج جديد
        </Button>
      </div>
    </header>
  );
}
