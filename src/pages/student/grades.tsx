
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentAPI } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/ui/page-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const StudentGradesPage = () => {
  // Fetch student grades
  const { data: grades, isLoading } = useQuery({
    queryKey: ['studentGrades'],
    queryFn: studentAPI.getGrades,
    refetchOnWindowFocus: false,
  });

  // Calculate GPA (simplified)
  const calculateGPA = (grades: any[]) => {
    if (!grades || grades.length === 0) return 0;
    
    const sum = grades.reduce((acc, grade) => acc + grade.grade, 0);
    return (sum / grades.length).toFixed(2);
  };

  // Group grades by semester
  const groupGradesBySemester = (grades: any[]) => {
    if (!grades) return {};
    
    return grades.reduce((acc, grade) => {
      if (!acc[grade.semester]) {
        acc[grade.semester] = [];
      }
      acc[grade.semester].push(grade);
      return acc;
    }, {});
  };

  const gradesBySemester = groupGradesBySemester(grades || []);
  const gpa = calculateGPA(grades || []);

  return (
    <DashboardLayout>
      <PageHeader 
        title="My Grades" 
        description="View your academic performance across all courses" 
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {grades && grades.length > 0 ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Overall Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-background rounded-lg p-4 border">
                      <div className="text-sm font-medium text-muted-foreground">Overall GPA</div>
                      <div className="text-3xl font-bold mt-1">{gpa}</div>
                    </div>
                    <div className="bg-background rounded-lg p-4 border">
                      <div className="text-sm font-medium text-muted-foreground">Total Courses</div>
                      <div className="text-3xl font-bold mt-1">{grades.length}</div>
                    </div>
                    <div className="bg-background rounded-lg p-4 border">
                      <div className="text-sm font-medium text-muted-foreground">Passing Rate</div>
                      <div className="text-3xl font-bold mt-1">
                        {Math.round((grades.filter(g => g.grade >= 55).length / grades.length) * 100)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {Object.keys(gradesBySemester).map((semester) => (
                <Card key={semester}>
                  <CardHeader>
                    <CardTitle>{semester}</CardTitle>
                    <CardDescription>
                      Semester GPA: {calculateGPA(gradesBySemester[semester])}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gradesBySemester[semester].map((grade: any) => (
                          <TableRow key={grade.id}>
                            <TableCell className="font-medium">{grade.courseName}</TableCell>
                            <TableCell>{grade.courseCode}</TableCell>
                            <TableCell>{grade.grade}%</TableCell>
                            <TableCell>
                              {grade.grade >= 55 ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                                  Pass
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                                  Fail
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-muted-foreground mb-2">No grades available</p>
                <p className="text-sm text-center max-w-md">
                  Your grades will appear here once they have been submitted by your instructors.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default StudentGradesPage;
