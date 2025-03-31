"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Info, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Types based on your Prisma schema
interface AttendanceSubject {
  id: string;
  slNo: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  presentTotal: string;
  attendancePercentage: string;
}

interface Attendance {
  id: string;
  userId: string;
  date: string;
  subjects: AttendanceSubject[];
}

interface DailyAttendanceSubject {
  id: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  attendedClasses: number;
  totalClasses: number;
}

interface DailyAttendance {
  id: string;
  userId: string;
  date: string;
  subjects: DailyAttendanceSubject[];
}

interface AttendanceData {
  attendanceRecords: Attendance[];
  dailyAttendanceRecords: DailyAttendance[];
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  attendanceData?: {
    attendance?: Attendance;
    dailyAttendance?: DailyAttendance;
  };
}

export default function AttendanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  // Fetch attendance data for the current month
  useEffect(() => {
    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
        
        const response = await fetch(`/api/attendance/calendar?year=${year}&month=${month}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch attendance data");
        }
        
        const data = await response.json();
        setAttendanceData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Error fetching attendance data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [currentDate]);

  // Generate calendar days for the current month
  useEffect(() => {
    const generateCalendarDays = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      // First day of the month
      const firstDayOfMonth = new Date(year, month, 1);
      // Last day of the month
      const lastDayOfMonth = new Date(year, month + 1, 0);
      
      // Day of the week for the first day (0 = Sunday, 6 = Saturday)
      const firstDayWeekday = firstDayOfMonth.getDay();
      
      const days: CalendarDay[] = [];
      
      // Add days from previous month to fill the first week
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = firstDayWeekday - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonthLastDay - i);
        days.push({
          date,
          isCurrentMonth: false,
          attendanceData: attendanceData ? mapAttendanceDataToDate(date) : undefined,
        });
      }
      
      // Add days of the current month
      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(year, month, i);
        days.push({
          date,
          isCurrentMonth: true,
          attendanceData: attendanceData ? mapAttendanceDataToDate(date) : undefined,
        });
      }
      
      // Add days from next month to complete the last week
      const remainingDays = 7 - (days.length % 7);
      if (remainingDays < 7) {
        for (let i = 1; i <= remainingDays; i++) {
          const date = new Date(year, month + 1, i);
          days.push({
            date,
            isCurrentMonth: false,
            attendanceData: attendanceData ? mapAttendanceDataToDate(date) : undefined,
          });
        }
      }
      
      return days;
    };
    
    // Map attendance data to a specific date
    const mapAttendanceDataToDate = (date: Date) => {
      if (!attendanceData) return undefined;
      
      const dateString = date.toISOString().split('T')[0];
      
      const attendance = attendanceData.attendanceRecords.find(
        record => new Date(record.date).toISOString().split('T')[0] === dateString
      );
      
      const dailyAttendance = attendanceData.dailyAttendanceRecords.find(
        record => new Date(record.date).toISOString().split('T')[0] === dateString
      );
      
      if (!attendance && !dailyAttendance) return undefined;
      
      return {
        attendance,
        dailyAttendance,
      };
    };
    
    setCalendarDays(generateCalendarDays());
  }, [attendanceData, currentDate]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
  };

  // Get attendance status for a day
  const getAttendanceStatus = (day: CalendarDay) => {
    if (!day.attendanceData) return null;
    
    const { dailyAttendance } = day.attendanceData;
    
    if (!dailyAttendance || !dailyAttendance.subjects.length) return null;
    
    // Calculate overall attendance for the day
    const totalAttended = dailyAttendance.subjects.reduce((sum, subject) => sum + subject.attendedClasses, 0);
    const totalClasses = dailyAttendance.subjects.reduce((sum, subject) => sum + subject.totalClasses, 0);
    
    if (totalClasses === 0) return null;
    
    const attendancePercentage = (totalAttended / totalClasses) * 100;
    
    if (attendancePercentage === 100) return "full";
    if (attendancePercentage > 0) return "partial";
    return "absent";
  };

  // Day click handler
  const handleDayClick = (day: CalendarDay) => {
    setSelectedDay(day);
  };

  // Get today's date for highlighting current day
  const today = new Date();
  const isToday = (date: Date) => {
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Get class count for a day
  const getClassCount = (day: CalendarDay) => {
    if (!day.attendanceData?.dailyAttendance) return 0;
    return day.attendanceData.dailyAttendance.subjects.length;
  };

  // Get week days header
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      {/* Calendar section (left side) */}
      <Card className="w-full lg:w-2/5 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg font-medium">Attendance Calendar</CardTitle>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={goToPreviousMonth}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="font-medium text-sm px-2 text-center">
                {formatDate(currentDate)}
              </div>
              <button
                onClick={goToNextMonth}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Calendar legend */}
          <div className="flex justify-end gap-3 mt-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Full</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-gray-600">Partial</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-gray-600">Absent</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            // Loading skeleton for calendar
            <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg overflow-hidden">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={`header-${i}`} className="bg-white font-medium text-center py-2 text-xs text-gray-500">
                  {weekDays[i]}
                </div>
              ))}
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={`day-${i}`} className="aspect-square h-10" />
              ))}
            </div>
          ) : error ? (
            // Error state
            <div className="flex flex-col items-center justify-center h-60 text-center p-4">
              <div className="text-red-500 mb-2 text-sm">{error}</div>
              <p className="text-gray-500 text-sm">Please try selecting another month or refreshing the page.</p>
            </div>
          ) : (
            // Calendar grid
            <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg overflow-hidden">
              {/* Week days header */}
              {weekDays.map((day) => (
                <div key={day} className="bg-white font-medium text-center py-2 text-xs text-gray-500">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                const attendanceStatus = getAttendanceStatus(day);
                const classCount = getClassCount(day);
                const hasClasses = classCount > 0;
                const isSelected = selectedDay?.date.toDateString() === day.date.toDateString();
                const isTodayDate = isToday(day.date);
                
                return (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={`bg-white h-10 relative flex flex-col items-center justify-start
                            ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-800'}
                            ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                            ${isTodayDate ? 'ring-1 ring-inset ring-blue-300' : ''}
                          `}
                          onClick={() => handleDayClick(day)}
                        >
                          <span className={`text-xs font-medium mt-1 ${isTodayDate ? 'text-blue-500' : ''}`}>
                            {day.date.getDate()}
                          </span>
                          
                          {/* Attendance indicator */}
                          {hasClasses && (
                            <div className="mt-1">
                              <div 
                                className={`w-2 h-2 rounded-full
                                  ${attendanceStatus === 'full' ? 'bg-green-500' : ''}
                                  ${attendanceStatus === 'partial' ? 'bg-yellow-500' : ''}
                                  ${attendanceStatus === 'absent' ? 'bg-red-500' : ''}
                                `}
                              />
                            </div>
                          )}
                          
                          {/* Class count indicator - only show if has classes */}
                          {hasClasses && (
                            <span className="absolute bottom-0 right-0 text-xxs bg-blue-100 text-blue-700 px-1 rounded-tl text-center" style={{ fontSize: '0.6rem' }}>
                              {classCount}
                            </span>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent hidden={!hasClasses} side="bottom">
                        <div className="p-1 max-w-xs">
                          <p className="font-medium text-xs">{day.date.toLocaleDateString()}</p>
                          <ul className="text-xs mt-1">
                            {day.attendanceData?.dailyAttendance?.subjects.map((subject) => (
                              <li key={subject.id} className="flex items-center gap-1 mb-1">
                                <Badge className={`text-white text-xs py-0.5 ${
                                  subject.attendedClasses === subject.totalClasses ? "bg-green-500" : 
                                  subject.attendedClasses > 0 ? "bg-yellow-500" : "bg-red-500"
                                }`}>
                                  {subject.attendedClasses}/{subject.totalClasses}
                                </Badge>
                                <span className="truncate">{subject.subjectCode}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Attendance details section (right side) */}
      <Card className="w-full lg:w-3/5 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Attendance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            // Loading skeleton for details
            <div className="space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={`row-${i}`} className="h-12 w-full" />
                ))}
              </div>
            </div>
          ) : selectedDay && selectedDay.attendanceData?.dailyAttendance ? (
            // Selected day details
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-medium text-sm px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                  {selectedDay.date.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
              </div>
              
              <div className="overflow-auto max-h-96">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500">
                      <th className="px-3 py-2 text-left text-xs font-medium rounded-l-md">Subject</th>
                      <th className="px-3 py-2 text-left text-xs font-medium">Faculty</th>
                      <th className="px-3 py-2 text-left text-xs font-medium rounded-r-md">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedDay.attendanceData.dailyAttendance.subjects.map((subject) => (
                      <tr key={subject.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <div className="font-medium text-sm">{subject.subjectName}</div>
                          <div className="text-xs text-gray-500">{subject.subjectCode}</div>
                        </td>
                        <td className="px-3 py-2 text-sm">{subject.facultyName}</td>
                        <td className="px-3 py-2">
                          <Badge className={`text-white ${
                            subject.attendedClasses === subject.totalClasses ? "bg-green-500" : 
                            subject.attendedClasses > 0 ? "bg-yellow-500" : "bg-red-500"
                          }`}>
                            {subject.attendedClasses}/{subject.totalClasses}
                            {' '}
                            ({((subject.attendedClasses / subject.totalClasses) * 100).toFixed(0)}%)
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Summary section */}
              {selectedDay.attendanceData.dailyAttendance.subjects.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <h4 className="text-xs font-medium text-gray-500 mb-2">DAILY SUMMARY</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-2 rounded shadow-sm">
                      <div className="text-xs text-gray-500">Total Classes</div>
                      <div className="text-lg font-medium">{selectedDay.attendanceData.dailyAttendance.subjects.length}</div>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm">
                      <div className="text-xs text-gray-500">Attended</div>
                      <div className="text-lg font-medium text-green-600">
                        {selectedDay.attendanceData.dailyAttendance.subjects.reduce((sum, subject) => sum + subject.attendedClasses, 0)}
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm">
                      <div className="text-xs text-gray-500">Missed</div>
                      <div className="text-lg font-medium text-red-600">
                        {selectedDay.attendanceData.dailyAttendance.subjects.reduce((sum, subject) => sum + (subject.totalClasses - subject.attendedClasses), 0)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : error ? (
            // Error state
            <div className="flex flex-col items-center justify-center h-60 text-center">
              <div className="text-red-500 mb-2 text-sm">{error}</div>
              <p className="text-gray-500 text-sm">Unable to fetch attendance data. Please try again later.</p>
            </div>
          ) : (
            // Instructions when no day is selected
            <div className="flex flex-col items-center justify-center h-60 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-gray-400">Select a date from the calendar to view attendance details.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}