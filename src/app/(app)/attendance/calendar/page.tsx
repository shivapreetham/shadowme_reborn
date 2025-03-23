"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

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
        
        const response = await fetch(`/api/attendance?year=${year}&month=${month}`);
        
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
    if (!attendanceData) return;
    
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
          attendanceData: mapAttendanceDataToDate(date),
        });
      }
      
      // Add days of the current month
      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(year, month, i);
        days.push({
          date,
          isCurrentMonth: true,
          attendanceData: mapAttendanceDataToDate(date),
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
            attendanceData: mapAttendanceDataToDate(date),
          });
        }
      }
      
      return days;
    };
    
    // Map attendance data to a specific date
    const mapAttendanceDataToDate = (date: Date) => {
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

  // Get week days header
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Render loading state
  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Attendance Calendar</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-60">
          <div className="text-center">Loading attendance data...</div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Attendance Calendar</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-60">
          <div className="text-center text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Attendance Calendar</CardTitle>
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="font-medium min-w-[140px] text-center">
            {formatDate(currentDate)}
          </div>
          <button
            onClick={goToNextMonth}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar legend */}
        <div className="flex justify-end gap-4 mb-2 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Full Attendance</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Partial Attendance</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Absent</span>
          </div>
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week days header */}
          {weekDays.map((day) => (
            <div key={day} className="font-medium text-center py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const attendanceStatus = getAttendanceStatus(day);
            if(! day.attendanceData?.dailyAttendance )return null
            const hasClasses = day.attendanceData?.dailyAttendance?.subjects.length > 0;
            const isSelected = selectedDay?.date.toDateString() === day.date.toDateString();
            
            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={`aspect-square p-1 relative flex flex-col items-center justify-start rounded-md
                        ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                        ${isSelected ? 'bg-blue-100 ring-1 ring-blue-400' : 'hover:bg-gray-100'}
                      `}
                      onClick={() => handleDayClick(day)}
                    >
                      <span className="text-sm font-medium mb-1">
                        {day.date.getDate()}
                      </span>
                      
                      {/* Attendance indicator */}
                      {hasClasses && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          <div 
                            className={`w-2 h-2 rounded-full
                              ${attendanceStatus === 'full' ? 'bg-green-500' : ''}
                              ${attendanceStatus === 'partial' ? 'bg-yellow-500' : ''}
                              ${attendanceStatus === 'absent' ? 'bg-red-500' : ''}
                            `}
                          />
                        </div>
                      )}
                      
                      {/* Class count indicator */}
                      {hasClasses && (
                        <span className="text-xs">
                          {day.attendanceData?.dailyAttendance?.subjects.length} class(es)
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent hidden={!hasClasses}>
                    <div className="p-1 max-w-xs">
                      <p className="font-medium">{day.date.toLocaleDateString()}</p>
                      <ul className="text-xs mt-1">
                        {day.attendanceData?.dailyAttendance?.subjects.map((subject) => (
                          <li key={subject.id} className="flex items-center gap-1 mb-1">
                            <Badge className={
                              subject.attendedClasses === subject.totalClasses ? "bg-green-500" : 
                              subject.attendedClasses > 0 ? "bg-yellow-500" : "bg-red-500"
                            }>
                              {subject.attendedClasses}/{subject.totalClasses}
                            </Badge>
                            {subject.subjectName} ({subject.subjectCode})
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
        
        {/* Selected day details */}
        {selectedDay && selectedDay.attendanceData?.dailyAttendance && (
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-lg">
                {selectedDay.date.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              <Info className="h-4 w-4 text-blue-500" />
            </div>
            
            <div className="overflow-auto max-h-60">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Subject</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Faculty</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDay.attendanceData.dailyAttendance.subjects.map((subject) => (
                    <tr key={subject.id} className="border-t">
                      <td className="px-4 py-2">
                        <div className="font-medium">{subject.subjectName}</div>
                        <div className="text-sm text-gray-500">{subject.subjectCode}</div>
                      </td>
                      <td className="px-4 py-2 text-sm">{subject.facultyName}</td>
                      <td className="px-4 py-2">
                        <Badge className={
                          subject.attendedClasses === subject.totalClasses ? "bg-green-500" : 
                          subject.attendedClasses > 0 ? "bg-yellow-500" : "bg-red-500"
                        }>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}