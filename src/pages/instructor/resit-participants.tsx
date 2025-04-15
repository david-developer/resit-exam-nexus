
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { instructorAPI } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/ui/page-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search, Download, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// For mocking purposes
interface Course {
  id: string;
  name: string;
  code: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  originalGrade: number;
  resitStatus: 'registered' | 'confirmed' | 'completed';
  registrationDate: string;
}

const InstructorResitParticipantsPage = () => {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Mock data - in reality would come from an API
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['instructorCourses'],
    queryFn: () => {
      // Mock function - would be replaced with actual API call
      return Promise.resolve([
        { id: '1', name: 'Introduction to Computer Science', code: 'CS101' },
        { id: '2', name: 'Data Structures and Algorithms', code: 'CS201' },
        { id: '3', name: 'Database Systems', code: 'CS301' },
      ]);
    },
    refetchOnWindowFocus: false,
  });

  // Fetch resit participants for selected course
  const { data: participants, isLoading: participantsLoading } = useQuery({
    queryKey: ['resitParticipants', selectedCourseId],
    queryFn: () => {
      if (!selectedCourseId) return Promise.resolve([]);
      return instructorAPI.getResitParticipants(selectedCourseId);
    },
    enabled: !!selectedCourseId,
    refetchOnWindowFocus: false,
    placeholderData: [],
  });

  // Filter participants based on search query and status
  const filteredParticipants = participants?.filter((student: Student) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      !statusFilter || student.resitStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    if (!filteredParticipants || filteredParticipants.length === 0) return;
    
    // Create CSV content
    const headers = ['ID', 'Name', 'Email', 'Original Grade', 'Registration Date', 'Status'];
    const rows = filteredParticipants.map((student: Student) => [
      student.id,
      student.name,
      student.email,
      student.originalGrade,
      new Date(student.registrationDate).toLocaleDateString(),
      student.resitStatus
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `resit-participants-${selectedCourseId}.csv`);
    link.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'registered':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Registered</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <PageHeader 
        title="Resit Participants" 
        description="View and manage students registered for resit examinations" 
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <span>Resit Participants</span>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="w-[200px]">
                <Select
                  value={selectedCourseId || ""}
                  onValueChange={setSelectedCourseId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((course: Course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code}: {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={!selectedCourseId || !filteredParticipants?.length}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coursesLoading ? (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : !selectedCourseId ? (
            <div className="text-center py-8 text-muted-foreground">
              Please select a course to view resit participants
            </div>
          ) : participantsLoading ? (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                
                <div>
                  <Select
                    value={statusFilter || ""}
                    onValueChange={(value) => setStatusFilter(value || null)}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="registered">Registered</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {filteredParticipants?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Original Grade</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParticipants.map((student: Student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground">{student.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-red-600 font-medium">
                          {student.originalGrade}%
                        </TableCell>
                        <TableCell>
                          {new Date(student.registrationDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(student.resitStatus)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No participants found matching your search criteria
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default InstructorResitParticipantsPage;
