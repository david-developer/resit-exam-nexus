
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { PageHeader } from '@/components/ui/page-header';
import { BookOpen, CalendarClock, GraduationCap, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { studentAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const StudentDashboard = () => {
  const { user } = useAuth();

  // Fetch student grades
  const { data: gradesResponse, isLoading: gradesLoading } = useQuery({
    queryKey: ['studentGrades'],
    queryFn: studentAPI.getGrades,
    refetchOnWindowFocus: false,
  });

  // Fetch resit exams
  const { data: resitExams, isLoading: resitExamsLoading } = useQuery({
    queryKey: ['studentResitExams'],
    queryFn: studentAPI.getResitExams,
    refetchOnWindowFocus: false,
  });

  // Ensure grades is an array
  const grades = Array.isArray(gradesResponse) ? gradesResponse : [];
  const resitExamsArray = Array.isArray(resitExams) ? resitExams : [];

  // Calculate days until next exam
  const calculateDaysUntilNextExam = () => {
    if (!resitExamsArray || resitExamsArray.length === 0) return "No exams scheduled";
    
    const today = new Date();
    let closestExam = null;
    let closestDays = Infinity;
    
    resitExamsArray.forEach((exam) => {
      const examDate = new Date(exam.examDate);
      const diffDays = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0 && diffDays < closestDays) {
        closestDays = diffDays;
        closestExam = exam;
      }
    });
    
    return closestExam ? `${closestDays} days` : "No upcoming exams";
  };

  // Calculate statistics
  const stats = {
    totalCourses: grades.length || 0,
    coursesWithResit: resitExamsArray.length || 0,
    passingGrades: grades.filter((g) => g.grade >= 55).length || 0,
    daysUntilNextExam: calculateDaysUntilNextExam(),
  };

  const isLoading = gradesLoading || resitExamsLoading;

  return (
    <DashboardLayout>
      <PageHeader 
        title={`Welcome, ${user?.name || 'Student'}`} 
        description="Your academic progress at a glance"
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard 
              title="Enrolled Courses" 
              value={stats.totalCourses} 
              icon={<BookOpen className="h-4 w-4" />} 
            />
            <StatCard 
              title="Resit Exams" 
              value={stats.coursesWithResit} 
              icon={<CalendarClock className="h-4 w-4" />} 
            />
            <StatCard 
              title="Passing Grades" 
              value={stats.passingGrades} 
              icon={<GraduationCap className="h-4 w-4" />} 
            />
            <StatCard 
              title="Next Exam In" 
              value={stats.daysUntilNextExam} 
              icon={<Clock className="h-4 w-4" />} 
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Grades</CardTitle>
              </CardHeader>
              <CardContent>
                {grades && grades.length > 0 ? (
                  <div className="space-y-2">
                    {grades.slice(0, 5).map((grade) => (
                      <div 
                        key={grade.id} 
                        className="flex items-center justify-between p-2 border-b last:border-0"
                      >
                        <div className="font-medium">{grade.courseName}</div>
                        <div className={`font-semibold ${grade.grade >= 55 ? 'text-green-600' : 'text-red-600'}`}>
                          {grade.grade}%
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No grades available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Resit Exams</CardTitle>
              </CardHeader>
              <CardContent>
                {resitExamsArray && resitExamsArray.length > 0 ? (
                  <div className="space-y-2">
                    {resitExamsArray.slice(0, 5).map((exam) => (
                      <div 
                        key={exam.id} 
                        className="flex items-center justify-between p-2 border-b last:border-0"
                      >
                        <div>
                          <div className="font-medium">{exam.courseName}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(exam.examDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-sm bg-university-100 text-university-800 px-2 py-1 rounded-full">
                          {exam.location}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No upcoming resit exams</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;
