
import React, { useRef, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { secretaryAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FileText, Upload, X, File, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

interface ScheduleFile {
  id: string;
  filename: string;
  uploadDate: string;
  size: string;
  downloads: number;
}

const SecretaryUploadSchedulePage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mock data - in reality would come from an API
  const { data: scheduleFiles, isLoading } = useQuery({
    queryKey: ['scheduleFiles'],
    queryFn: () => {
      // Mock function - would be replaced with actual API call
      return Promise.resolve([
        {
          id: '1',
          filename: 'Summer2025_ResitExams.pdf',
          uploadDate: '2025-04-10T10:30:00',
          size: '1.2 MB',
          downloads: 45,
        },
        {
          id: '2',
          filename: 'Winter2025_ResitExams.pdf',
          uploadDate: '2025-01-15T14:45:00',
          size: '984 KB',
          downloads: 78,
        },
        {
          id: '3',
          filename: 'ResitExams_Locations.pdf',
          uploadDate: '2025-03-22T09:15:00',
          size: '756 KB',
          downloads: 34,
        },
      ]);
    },
    refetchOnWindowFocus: false,
  });

  // Mutation for uploading a file
  const uploadMutation = useMutation({
    mutationFn: secretaryAPI.uploadSchedule,
    onMutate: () => {
      // Reset progress
      setUploadProgress(0);
      
      // Initialize progress simulation
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          
          return newProgress;
        });
      }, 200);
      
      // Store interval ID for cleanup
      return { intervalId: interval };
    },
    onSuccess: () => {
      // Complete progress
      setUploadProgress(100);
      
      toast({
        title: "File uploaded successfully",
        description: `${selectedFile?.name} has been uploaded.`,
      });
      
      // Reset file selection
      setSelectedFile(null);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['scheduleFiles'] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
    onSettled: (_data, _error, _variables, context: any) => {
      // Clear interval if it exists
      if (context?.intervalId) {
        clearInterval(context.intervalId);
      }
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      // Mock download functionality
      toast({
        title: "Download started",
        description: `Downloading ${filename}...`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const isUploading = uploadMutation.isPending;

  return (
    <DashboardLayout>
      <PageHeader 
        title="Upload Exam Schedule" 
        description="Upload resit exam schedule files for students and staff" 
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Schedule File</CardTitle>
            <CardDescription>
              Upload PDF files containing exam schedules, locations, and details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              
              {selectedFile ? (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-university-600" />
                    <div className="text-left">
                      <div className="font-medium">{selectedFile.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="py-8">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-1">
                    Drag and drop your file here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF, Word, and Excel files up to 10MB
                  </p>
                </div>
              )}
            </div>
            
            {isUploading && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              disabled={!selectedFile || isUploading}
              onClick={handleUpload}
            >
              {isUploading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uploaded Schedule Files</CardTitle>
            <CardDescription>
              List of all exam schedule files that have been uploaded
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : scheduleFiles && scheduleFiles.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduleFiles.map((file: ScheduleFile) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <File className="h-4 w-4 text-university-600" />
                          <span className="font-medium">{file.filename}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{file.size}</TableCell>
                      <TableCell>{file.downloads}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file.filename)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No files have been uploaded yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SecretaryUploadSchedulePage;
