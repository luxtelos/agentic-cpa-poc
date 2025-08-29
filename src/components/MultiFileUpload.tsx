import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { LLMProvider, LLMServiceFactory } from '@/services/llm/LLMServiceFactory';

interface FileWithStatus {
  file: File;
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  extractedText?: string;
  error?: string;
}

interface MultiFileUploadProps {
  provider: LLMProvider;
  onFilesReady: (files: File[]) => void;
  isProcessing?: boolean;
}

export const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
  provider,
  onFilesReady,
  isProcessing = false
}) => {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get provider capabilities directly from environment variables as fallback
  const getProviderLimits = () => {
    if (provider === 'claude') {
      return {
        maxFiles: parseInt(import.meta.env.VITE_CLAUDE_MAX_FILES || '52'),
        maxSizeMB: parseInt(import.meta.env.VITE_CLAUDE_MAX_FILE_SIZE_MB || '500')
      };
    } else {
      return {
        maxFiles: parseInt(import.meta.env.VITE_PERPLEXITY_MAX_FILES || '1'),
        maxSizeMB: parseInt(import.meta.env.VITE_PERPLEXITY_MAX_FILE_SIZE_MB || '5')
      };
    }
  };
  
  const [capabilities, setCapabilities] = useState<{ maxFiles: number; maxSizeMB: number }>(getProviderLimits());
  
  // Get provider capabilities
  useEffect(() => {
    console.log('[MultiFileUpload] Provider changed:', provider);
    const limits = getProviderLimits();
    console.log('[MultiFileUpload] Provider limits from env:', limits);
    
    try {
      // Try to get from service factory first
      const availableProviders = LLMServiceFactory.getAvailableProviders();
      console.log('[MultiFileUpload] Available providers:', availableProviders);
      
      if (availableProviders.includes(provider as any)) {
        const service = LLMServiceFactory.getProvider(provider === 'auto' ? 'perplexity' : provider);
        const caps = service.getCapabilities();
        console.log('[MultiFileUpload] Service capabilities:', caps);
        setCapabilities({
          maxFiles: caps.maxFiles,
          maxSizeMB: caps.maxFileSize / (1024 * 1024)
        });
      } else {
        // Fallback to environment variables
        console.log('[MultiFileUpload] Provider not in factory, using env limits');
        setCapabilities(limits);
      }
    } catch (error) {
      console.warn('[MultiFileUpload] Could not get provider capabilities, using env limits:', error);
      // Fallback to environment variables
      setCapabilities(limits);
    }
  }, [provider]);
  
  const maxFiles = capabilities.maxFiles;
  const maxSizePerFile = capabilities.maxSizeMB;
  
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);
  
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Only PDF files are supported' };
    }
    
    if (file.size > maxSizePerFile * 1024 * 1024) {
      return { valid: false, error: `File too large. Max size is ${maxSizePerFile}MB` };
    }
    
    return { valid: true };
  };
  
  const processFiles = (newFiles: File[]) => {
    console.log('[MultiFileUpload] Processing files:', {
      provider,
      maxFiles,
      maxSizePerFile,
      newFilesCount: newFiles.length,
      currentFilesCount: files.length
    });
    
    // Check provider limitations
    if (provider === 'perplexity' && newFiles.length > 1) {
      toast({
        title: 'Single File Only',
        description: 'Perplexity only supports single file upload',
        variant: 'default'
      });
      newFiles = [newFiles[0]];
    }
    
    // Limit to max files
    const remainingSlots = maxFiles - files.length;
    if (remainingSlots <= 0) {
      toast({
        title: 'File Limit Reached',
        description: `Maximum ${maxFiles} file(s) allowed`,
        variant: 'destructive'
      });
      return;
    }
    
    const filesToAdd = newFiles.slice(0, remainingSlots);
    
    // Validate and add files
    const processedFiles: FileWithStatus[] = filesToAdd.map(file => {
      const validation = validateFile(file);
      return {
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        status: validation.valid ? 'pending' : 'error',
        progress: 0,
        error: validation.error
      };
    });
    
    setFiles(prev => [...prev, ...processedFiles]);
    
    // Auto-process if all files are valid
    const validFiles = processedFiles.filter(f => f.status === 'pending');
    if (validFiles.length > 0) {
      const rawFiles = validFiles.map(f => f.file);
      onFilesReady(files.concat(processedFiles).filter(f => f.status === 'pending').map(f => f.file));
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      processFiles(Array.from(selectedFiles));
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeFile = (id: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      onFilesReady(updated.filter(f => f.status === 'pending').map(f => f.file));
      return updated;
    });
  };
  
  const clearAll = () => {
    setFiles([]);
    onFilesReady([]);
  };
  
  return (
    <div className="w-full space-y-4">
      {/* Provider Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={provider === 'claude' ? 'default' : 'secondary'}>
            {provider === 'claude' ? 'Claude' : 'Perplexity'}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {maxFiles > 1 
              ? `Up to ${maxFiles} files, ${maxSizePerFile}MB each`
              : `Single file only, ${maxSizePerFile}MB max`}
          </span>
        </div>
      </div>
      
      {/* Drop Zone */}
      <Card
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed p-8 text-center transition-all cursor-pointer
          ${isDragging 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'}
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={provider === 'claude'}
          accept="application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />
        
        <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-lg font-medium mb-2">
          {provider === 'claude' 
            ? 'Drag & drop PDFs here'
            : 'Drag & drop a PDF here'}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          or
        </p>
        <Button variant="outline" size="sm" disabled={isProcessing}>
          {provider === 'claude' ? 'Select Files' : 'Select File'}
        </Button>
      </Card>
      
      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              {files.length} file{files.length > 1 ? 's' : ''} selected
            </h3>
            {files.length > 0 && !isProcessing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-destructive hover:text-destructive"
              >
                Clear All
              </Button>
            )}
          </div>
          
          {files.map(file => (
            <Card key={file.id} className="p-3">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  
                  {/* Progress Bar */}
                  {file.status === 'processing' && (
                    <Progress value={file.progress} className="mt-2 h-1" />
                  )}
                  
                  {/* Error Message */}
                  {file.error && (
                    <p className="text-xs text-destructive mt-1">{file.error}</p>
                  )}
                </div>
                
                {/* Status Icons */}
                <div className="flex items-center gap-2">
                  {file.status === 'pending' && !isProcessing && (
                    <Badge variant="secondary">Ready</Badge>
                  )}
                  {file.status === 'processing' || (file.status === 'pending' && isProcessing) && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  {file.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-success-600" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  
                  {!isProcessing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};