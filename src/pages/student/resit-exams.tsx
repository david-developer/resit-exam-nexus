
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentAPI } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/ui/page-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const StudentResitExamsPage = () => {
  // Fetch resit exams
  const { data: resitExams, isLoading } = useQuery({
    queryKey: ['studentResitExams'],
    queryFn: studentAPI.getResitExams,
    refetchOnWindowFocus: false,
  });

  // Filter exams by status
  const getUpcomingExams = () => {
    if (!resitExams) return [];
    const now = new Date();
    return resitExams.filter((exam: any) => new Date(exam.examDate) > now);
  };

  const getPastExams = () => {
    if (!resitExams) return [];
    const now = new Date();
    return resitExams.filter((exam: any) => new Date(exam.examDate) <= now);
  };

  const upcomingExams = getUpcomingExams();
  const pastExams = getPastExams();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render exam card
  const renderExamCard = (exam: any) => (
    <Card key={exam.id} className="mb-4">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">{exam.courseName}</h3>
            <p className="text-sm text-muted-foreground mb-2">{exam.courseCode}</p>
            
            <div className="flex items-center text-sm mt-4">
              <Calendar className="h-4 w-4 mr-2 text-university-600" />
              <span>{formatDate(exam.examDate)}</span>
            </div>
            
            <div className="flex items-center text-sm mt-2">
              <Clock className="h-4 w-4 mr-2 text-university-600" />
              <span>{formatTime(exam.examDate)} - {formatTime(exam.endTime)}</span>
            </div>
            
            <div className="flex items-center text-sm mt-2">
              <MapPin className="h-4 w-4 mr-2 text-university-600" />
              <span>{exam.location}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className="border-university-200 bg-university-50">
              {exam.examType}
            </Badge>
            
            {new Date(exam.examDate) > new Date() ? (
              <div className="text-sm bg-university-100 text-university-800 mt-2 px-3 py-1 rounded-full">
                {Math.ceil((new Date(exam.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
              </div>
            ) : (
              <div className="text-sm bg-gray-100 text-gray-800 mt-2 px-3 py-1 rounded-full">
                Completed
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <PageHeader 
        title="My Resit Exams" 
        description="View all your upcoming and past resit examinations" 
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingExams.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastExams.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingExams.length > 0 ? (
              upcomingExams.map(renderExamCard)
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <p className="text-muted-foreground mb-2">No upcoming resit exams</p>
                  <p className="text-sm text-center max-w-md">
                    You don't have any upcoming resit exams. Check the "Declare Resit" page if you need to register for a resit.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="space-y-4">
            {pastExams.length > 0 ? (
              pastExams.map(renderExamCard)
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <p className="text-muted-foreground mb-2">No past resit exams</p>
                  <p className="text-sm text-center max-w-md">
                    You haven't taken any resit exams yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </DashboardLayout>
  );
};

export default StudentResitExamsPage;
