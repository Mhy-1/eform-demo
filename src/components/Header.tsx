import React from 'react';
import { FileText, Github, ExternalLink } from 'lucide-react';
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
            <h1 className="text-lg font-bold">E-Form Builder</h1>
            <p className="text-xs text-muted-foreground">Dynamic Form Creation Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://github.com/msharydajam/eform-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">View Source</span>
            </a>
          </Button>
          <Button onClick={onNewForm}>
            <span className="mr-2">+</span>
            New Form
          </Button>
        </div>
      </div>
    </header>
  );
}
