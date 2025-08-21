import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useToast } from './ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';

export default function PromptAdmin() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load prompt on mount - either from localStorage or default file
  useEffect(() => {
    const loadPrompt = async () => {
      const customPrompt = localStorage.getItem('customPrompt');
      
      if (customPrompt) {
        setPrompt(customPrompt);
        setIsLoading(false);
      } else {
        // Load default prompt from public file
        try {
          const response = await fetch('/prompt.txt');
          if (response.ok) {
            const defaultPrompt = await response.text();
            setPrompt(defaultPrompt);
          }
        } catch (error) {
          console.error('Failed to load default prompt:', error);
        }
        setIsLoading(false);
      }
    };
    
    loadPrompt();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPrompt(content);
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('customPrompt', prompt);
    console.log('Custom prompt saved:', prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''));
    toast({
      title: 'Prompt Updated',
      description: 'Custom prompt saved (will persist until browser refresh)',
    });
    setIsSaving(false);
  };

  const handleReset = async () => {
    localStorage.removeItem('customPrompt');
    // Load the default prompt from file
    try {
      const response = await fetch('/prompt.txt');
      if (response.ok) {
        const defaultPrompt = await response.text();
        setPrompt(defaultPrompt);
        toast({
          title: 'Reset to Default',
          description: 'Loaded default prompt from prompt.txt',
        });
      }
    } catch (error) {
      console.error('Failed to load default prompt:', error);
      setPrompt('');
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Prompt Management</CardTitle>
        <CardDescription>Update the AI system prompt</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Upload Prompt File</Label>
              <Input 
                type="file" 
                accept=".txt" 
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
            </div>
            <div>
              <Label>Prompt Editor</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder={isLoading ? "Loading prompt..." : "Enter your custom prompt here..."}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>
          Reset to Default
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Prompt'}
        </Button>
      </CardFooter>
    </Card>
  );
}
