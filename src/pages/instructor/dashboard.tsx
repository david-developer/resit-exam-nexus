
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { PageHeader } from '@/components/ui/page-header';
import { BookOpen, Users, GraduationCap, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { instructorAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InstructorDashboard = () => {
  const { user } = useAuth();

  // Fetch resit stats for courses taught by instructor
  const { data: resitStats, isLoading } = useQuery({
    queryKey: ['instructorResitStats'],
    queryFn: instructorAPI.getResitStats,
    refetchOnWindowFocus: false,
  });

  const calculateStats = () => {
    if (!resitStats) return {
      totalCourses: 0,
      totalStudents: 0,
      avgPassRate: 0,
      upcomingDeadlines: 0,
    };
    
    const totalCourses = resitStats.courses.length;
    const totalStudents = resitStats.courses.reduce((sum: number, course: any) => sum + course.totalStudents, 0);
    
    const passRates = resitStats.courses.map((course: any) => ({
      passRate: course.passRate,
      students: course.totalStudents,
    }));
    
    // Weighted average pass rate
    const totalWeight = passRates.reduce((sum: number, item: any) => sum + item.students, 0);
    const weightedSum = passRates.reduce((sum: number, item: any) => sum + (item.passRate * item.students), 0);
    const avgPassRate = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    
    const upcomingDeadlines = resitStats.courses.filter((course: any) => 
      course.gradeSubmissionDeadline && new Date(course.gradeSubmissionDeadline) > new Date()
    ).length;
    
    return {
      totalCourses,
      totalStudents,
      avgPassRate,
      upcomingDeadlines,
    };
  };

  const stats = calculateStats();

  return (
    <DashboardLayout>
      <PageHeader 
        title={`Welcome, ${user?.name || 'Instructor'}`} 
        description="Overview of your courses and student performance" 
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard 
              title="Courses" 
              value={stats.totalCourses} 
              icon={<BookOpen className="h-4 w-4" />} 
            />
            <StatCard 
              title="Total Students" 
              value={stats.totalStudents} 
              icon={<Users className="h-4 w-4" />} 
            />
            <StatCard 
              title="Avg Pass Rate" 
              value={`${stats.avgPassRate}%`} 
              icon={<GraduationCap className="h-4 w-4" />} 
            />
            <StatCard 
              title="Upcoming Deadlines" 
              value={stats.upcomingDeadlines} 
              icon={<Clock className="h-4 w-4" />} 
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Grade Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {resitStats && resitStats.coursePerformance ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={resitStats.coursePerformance}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="term" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="avgGrade"
                        stroke="#6b63eb"
                        activeDot={{ r: 8 }}
                        name="Average Grade"
                      />
                      <Line
                        type="monotone"
                        dataKey="passRate"
                        stroke="#10b981"
                        name="Pass Rate %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-[300px]">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Courses Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Courses Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {resitStats && resitStats.courses && resitStats.courses.length > 0 ? (
                  <div className="space-y-4">
                    {resitStats.courses.map((course: any) => (
                      <div
                        key={course.id}
                        className="border rounded-md p-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{course.name}</h3>
                            <p className="text-sm text-muted-foreground">{course.code}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {course.totalStudents} students
                            </div>
                            <div className={`text-sm ${course.passRate >= 70 ? 'text-green-600' : course.passRate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                              {course.passRate}% pass rate
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-2 bg-secondary h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-university-500"
                            style={{ width: `${course.passRate}%` }}
                          />
                        </div>
                        
                        {course.resitRegistered > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {course.resitRegistered} students registered for resit
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-[300px]">
                    <p className="text-muted-foreground">No courses available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default InstructorDashboard;
