
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorAPI } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/ui/page-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';

// Define form schema
const formSchema = z.object({
  courseId: z.string({
    required_error: "Please select a course",
  }),
  studentId: z.string({
    required_error: "Please select a student",
  }),
  grade: z.coerce.number()
    .min(0, "Grade must be at least 0")
    .max(100, "Grade must be at most 100"),
});

type FormValues = z.infer<typeof formSchema>;

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
}

const InstructorSubmitGradesPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Fetch students for selected course
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['courseStudents', selectedCourseId],
    queryFn: () => {
      // Mock function - would be replaced with actual API call
      return Promise.resolve([
        { id: '1', name: 'John Doe', email: 'john.doe@university.edu' },
        { id: '2', name: 'Jane Smith', email: 'jane.smith@university.edu' },
        { id: '3', name: 'Bob Johnson', email: 'bob.johnson@university.edu' },
        { id: '4', name: 'Alice Williams', email: 'alice.williams@university.edu' },
        { id: '5', name: 'Charlie Brown', email: 'charlie.brown@university.edu' },
      ]);
    },
    enabled: !!selectedCourseId,
    refetchOnWindowFocus: false,
  });

  // Filter students based on search query
  const filteredStudents = students?.filter((student: Student) => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mutation for submitting a grade
  const submitGradeMutation = useMutation({
    mutationFn: instructorAPI.submitGrade,
    onSuccess: () => {
      toast({
        title: "Grade submitted successfully",
        description: "The student's grade has been updated.",
      });
      // Reset form fields except courseId
      form.setValue('studentId', '');
      form.setValue('grade', 0);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit grade",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: "",
      studentId: "",
      grade: 0,
    },
  });

  const onSubmit = async (data: FormValues) => {
    submitGradeMutation.mutate({
      courseId: data.courseId,
      studentId: data.studentId,
      grade: data.grade,
    });
  };

  const isLoading = coursesLoading || (selectedCourseId && studentsLoading);
  const isSubmitting = form.formState.isSubmitting || submitGradeMutation.isPending;

  return (
    <DashboardLayout>
      <PageHeader 
        title="Submit Grades" 
        description="Enter and submit student grades for your courses" 
      />

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Submit Student Grade</CardTitle>
            <CardDescription>
              Select a course and student to submit or update their grade
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <Form {...form}>
                <form className="space-y-6">
                  <FormField
                    control={form.control}
                    name="courseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedCourseId(value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {courses?.map((course: Course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.name} ({course.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedCourseId && (
                    <>
                      <div className="space-y-2">
                        <FormLabel>Find Student</FormLabel>
                        <div className="relative">
                          <Input
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="studentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a student" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {filteredStudents?.map((student: Student) => (
                                  <SelectItem key={student.id} value={student.id}>
                                    {student.name} - {student.email}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {filteredStudents?.length === 0 && searchQuery
                                ? "No students found matching your search"
                                : `${filteredStudents?.length || 0} students found`}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="grade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grade (0-100)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter a grade between 0 and 100. A grade of 55 or above is a pass.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </form>
              </Form>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting || !selectedCourseId}
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : 'Submit Grade'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InstructorSubmitGradesPage;
