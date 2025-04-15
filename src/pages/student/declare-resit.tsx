import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentAPI } from '@/lib/api';
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  courseId: z.string({
    required_error: "Please select a course",
  }),
});

const StudentDeclareResitPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: grades, isLoading: gradesLoading } = useQuery({
    queryKey: ['studentGrades'],
    queryFn: studentAPI.getGrades,
    refetchOnWindowFocus: false,
  });

  const { data: resitExams, isLoading: resitExamsLoading } = useQuery({
    queryKey: ['studentResitExams'],
    queryFn: studentAPI.getResitExams,
    refetchOnWindowFocus: false,
  });

  const declareResitMutation = useMutation({
    mutationFn: studentAPI.declareResit,
    onSuccess: () => {
      toast({
        title: "Resit declared successfully",
        description: "You have been registered for the resit exam.",
      });
      queryClient.invalidateQueries({ queryKey: ['studentResitExams'] });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to declare resit",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: "",
    },
  });

  const getEligibleCourses = () => {
    if (!grades) return [];
    
    const registeredResitIds = resitExams ? resitExams.map((exam: any) => exam.courseId) : [];
    
    return grades.filter((grade: any) => {
      return grade.grade < 55 && !registeredResitIds.includes(grade.courseId);
    });
  };

  const eligibleCourses = getEligibleCourses();
  const isLoading = gradesLoading || resitExamsLoading;
  const isSubmitting = form.formState.isSubmitting || declareResitMutation.isPending;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    declareResitMutation.mutate(data.courseId);
  };

  return (
    <DashboardLayout>
      <PageHeader 
        title="Declare Resit Exam" 
        description="Register for a resit examination for your eligible courses"
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Declare Resit</CardTitle>
              <CardDescription>
                Select a course for which you want to take a resit exam
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eligibleCourses.length > 0 ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="courseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a course" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {eligibleCourses.map((course: any) => (
                                <SelectItem key={course.courseId} value={course.courseId}>
                                  {course.courseName} - {course.grade}%
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select a course you failed and want to take a resit exam for
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No eligible courses</AlertTitle>
                  <AlertDescription>
                    You don't have any courses eligible for resit exams, or you've already registered for all possible resits.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              {eligibleCourses.length > 0 && (
                <Button
                  className="w-full"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <LoadingSpinner size="sm" /> : 'Declare Resit'}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentDeclareResitPage;
