
import React from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// Define form schema
const formSchema = z.object({
  courseId: z.string({
    required_error: "Please select a course",
  }),
  examType: z.string({
    required_error: "Please select an exam type",
  }),
  examDate: z.date({
    required_error: "Please select an exam date",
  }),
  startTime: z.string({
    required_error: "Please enter a start time",
  }).regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Please enter a valid time in HH:MM format",
  }),
  duration: z.coerce.number({
    required_error: "Please enter the exam duration",
  }).min(1, {
    message: "Duration must be at least 1 minute",
  }),
  location: z.string({
    required_error: "Please enter an exam location",
  }).min(1, {
    message: "Location cannot be empty",
  }),
  materials: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// For mocking purposes
interface Course {
  id: string;
  name: string;
  code: string;
}

const InstructorResitDetailsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Mutation for submitting resit exam details
  const updateResitDetailsMutation = useMutation({
    mutationFn: instructorAPI.updateResitDetails,
    onSuccess: () => {
      toast({
        title: "Resit details saved",
        description: "The resit exam details have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save resit details",
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
      examType: "",
      startTime: "14:00",
      duration: 120,
      location: "",
      materials: "",
      notes: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    updateResitDetailsMutation.mutate({
      ...data,
      // Format date for API
      examDate: format(data.examDate, 'yyyy-MM-dd'),
    });
  };

  const isLoading = coursesLoading;
  const isSubmitting = form.formState.isSubmitting || updateResitDetailsMutation.isPending;

  return (
    <DashboardLayout>
      <PageHeader 
        title="Resit Exam Details" 
        description="Create or update resit examination details for your courses" 
      />

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Resit Exam Configuration</CardTitle>
            <CardDescription>
              Set up the details for your course's resit examination
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
                          onValueChange={field.onChange}
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

                  <FormField
                    control={form.control}
                    name="examType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select exam type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="written">Written Exam</SelectItem>
                            <SelectItem value="oral">Oral Exam</SelectItem>
                            <SelectItem value="practical">Practical Exam</SelectItem>
                            <SelectItem value="online">Online Exam</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="examDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Exam Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time (24h format)</FormLabel>
                          <FormControl>
                            <Input placeholder="14:00" {...field} />
                          </FormControl>
                          <FormDescription>
                            Format: HH:MM (e.g., 14:00 for 2 PM)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Room 101, Building A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="materials"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permitted Materials</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g., Scientific calculator, one A4 sheet with notes"
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          List all materials students are allowed to bring to the exam
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional information for students and staff"
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : 'Save Resit Details'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InstructorResitDetailsPage;
