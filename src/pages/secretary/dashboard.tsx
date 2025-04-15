
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { PageHeader } from '@/components/ui/page-header';
import { Calendar, Upload, Download, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { secretaryAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const SecretaryDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock data - in reality would come from an API
  const { data: scheduleFiles, isLoading } = useQuery({
    queryKey: ['scheduleFiles'],
    queryFn: () => {
      // Mock function - would be replaced with actual API call
      return Promise.resolve({
        uploadedFiles: 3,
        totalDownloads: 157,
        upcomingExams: 8,
        latestUpload: '2025-04-10T10:30:00',
        recentFiles: [
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
        ]
      });
    },
    refetchOnWindowFocus: false,
  });

  return (
    <DashboardLayout>
      <PageHeader 
        title={`Welcome, ${user?.name || 'Secretary'}`} 
        description="Overview of exam schedules and administration" 
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard 
              title="Uploaded Files" 
              value={scheduleFiles?.uploadedFiles || 0} 
              icon={<FileText className="h-4 w-4" />} 
            />
            <StatCard 
              title="Total Downloads" 
              value={scheduleFiles?.totalDownloads || 0} 
              icon={<Download className="h-4 w-4" />} 
            />
            <StatCard 
              title="Upcoming Exams" 
              value={scheduleFiles?.upcomingExams || 0} 
              icon={<Calendar className="h-4 w-4" />} 
            />
            <StatCard 
              title="Latest Upload" 
              value={scheduleFiles?.latestUpload ? new Date(scheduleFiles.latestUpload).toLocaleDateString() : 'Never'} 
              icon={<Upload className="h-4 w-4" />} 
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Uploaded Files</CardTitle>
                <CardDescription>
                  Most recently uploaded exam schedule files
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scheduleFiles?.recentFiles && scheduleFiles.recentFiles.length > 0 ? (
                  <div className="space-y-4">
                    {scheduleFiles.recentFiles.map((file: any) => (
                      <div
                        key={file.id}
                        className="flex justify-between items-center p-3 border rounded-md hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-university-600" />
                          <div>
                            <div className="font-medium line-clamp-1">{file.filename}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(file.uploadDate).toLocaleDateString()} • {file.size}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {file.downloads} downloads
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No files have been uploaded yet
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks for exam administration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start" 
                  onClick={() => navigate('/secretary/upload-schedule')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Schedule
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  View Download Statistics
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Academic Calendar
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default SecretaryDashboard;
