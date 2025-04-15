
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentAPI } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/ui/page-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ScheduleFile {
  id: string;
  filename: string;
  uploadDate: string;
  size: string;
}

const StudentExamSchedulePage = () => {
  const [searchTerm, setSearchTerm] = useState('');

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
        },
        {
          id: '2',
          filename: 'Winter2025_ResitExams.pdf',
          uploadDate: '2025-01-15T14:45:00',
          size: '984 KB',
        },
        {
          id: '3',
          filename: 'ResitExams_Locations.pdf',
          uploadDate: '2025-03-22T09:15:00',
          size: '756 KB',
        },
      ]);
    },
    refetchOnWindowFocus: false,
  });

  const handleDownload = async (filename: string) => {
    try {
      const blob = await studentAPI.getSchedule(filename);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      
      // Append to body, click and remove
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const filteredFiles = scheduleFiles?.filter((file: ScheduleFile) => 
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader 
        title="Exam Schedule" 
        description="Download the official resit examination schedule" 
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <Input
                placeholder="Search schedules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {filteredFiles && filteredFiles.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file: ScheduleFile) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-university-600" />
                          {file.filename}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{file.size}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(file.filename)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No schedule files found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default StudentExamSchedulePage;
