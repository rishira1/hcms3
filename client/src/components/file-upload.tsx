import { useState, useRef } from 'react';
import { Upload, X, FileText, Camera, PenTool, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
  type: 'photo' | 'idCard' | 'signature';
  file: File | null;
  onFileChange: (file: File | null) => void;
  accept: string;
  maxSize: number; // in MB
  required?: boolean;
  isUploading?: boolean;
  uploadProgress?: number;
}

const FILE_TYPE_CONFIG = {
  photo: {
    icon: Camera,
    title: 'Upload Photo',
    description: 'Upload a recent passport-size photograph (JPG/PNG, max 2MB)',
  },
  idCard: {
    icon: FileText,
    title: 'Upload ID Card',
    description: 'Upload a clear copy of your government-issued ID (JPG/PNG/PDF, max 5MB)',
  },
  signature: {
    icon: PenTool,
    title: 'Upload Scanned Signature',
    description: 'Upload a clear signature on white background (JPG/PNG, max 1MB)',
  },
};

export function FileUpload({ 
  type, 
  file, 
  onFileChange, 
  accept, 
  maxSize, 
  required = false,
  isUploading = false,
  uploadProgress = 0
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = FILE_TYPE_CONFIG[type];
  const Icon = config.icon;

  const handleFileSelect = (selectedFile: File) => {
    // Validate file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      alert(`File size should not exceed ${maxSize}MB`);
      return;
    }

    // Validate file type
    const allowedExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      alert(`Invalid file type. Please select a file with one of these extensions: ${allowedExtensions.join(', ')}`);
      return;
    }

    onFileChange(selectedFile);

    // Generate preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const removeFile = () => {
    onFileChange(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-4 sm:p-6 transition-colors ${
        dragOver 
          ? 'border-primary bg-primary/5' 
          : file 
            ? 'border-green-300 bg-green-50' 
            : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        required={required}
      />

      {file ? (
        // File selected state
        <div className="text-center">
          {preview ? (
            <div className="mb-4">
              <img
                src={preview}
                alt="Preview"
                className={`mx-auto rounded-lg border ${
                  type === 'signature' ? 'w-32 h-16 bg-white' : 'w-24 h-24'
                } object-cover`}
              />
            </div>
          ) : (
            <div className="mb-4">
              <FileText className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
          )}
          <p className="font-medium text-gray-900 mb-2">{file.name}</p>
          <p className="text-sm text-gray-500 mb-4">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
          
          {isUploading ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-600">Uploading... {uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-gray-500">Please wait while your file is being processed</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto"
              >
                Change File
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={removeFile}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          )}
        </div>
      ) : (
        // Empty state
        <div className="text-center">
          <Icon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            {config.title}{required && '*'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 px-2">
            {config.description}
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose File
          </Button>
        </div>
      )}
    </div>
  );
}
