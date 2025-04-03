"use client";
import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { 
  Sun, Moon, BookOpen, UserCheck, Calendar, Clock, AlertCircle, 
  CheckCircle, XCircle, ChevronDown, BarChart3, ArrowUpRight, 
  Award, CalendarClock, TrendingUp, BookOpenCheck, BookX, Flame
} from "lucide-react";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Define TypeScript interfaces for type safety
interface Subject {
  id: string;
  slNo: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  presentTotal: string;
  attendancePercentage: string;
  attendedClasses: number;
  totalClasses: number;
  isAbove75: boolean;
  classesNeeded: number;
  classesCanSkip: number;
}

interface UserInfo {
  name: string;
  email: string;
  image: string | null;
  department: string | null;
  semester: string | null;
  registrationNumber: string | null;
  course: string | null;
  batch: string | null;
  branch: string | null;
  lastSeen: Date;
}

interface OverallMetrics {
  totalAttended: number;
  totalClasses: number;
  overallPercentage: number;
  subjectsAbove75Percent: number;
  subjectsBelow75Percent: number;
}

interface SubjectMetric {
  id: string;
  subjectCode: string;
  subjectName: string;
  subjectProfessor: string;
  attendedClasses: number;
  totalClasses: number;
  attendancePercentage: number;
  isAbove75: boolean;
  classesNeeded: number;
  classesCanSkip: number;
}

interface TrendPoint {
  date: string;
  percentage: number;
  attended: number;
  total: number;
}

interface UserStats {
  loginStreak: number;
  loginDays: number;
  honorScore: number;
  activeStatus: boolean;
}

interface AttendanceData {
  id: string;
  userId: string;
  date: string;
  subjects: Subject[];
  user: UserInfo;
  overallMetrics: OverallMetrics;
  subjectMetrics: SubjectMetric[];
  attendanceTrend: TrendPoint[];
  userStats: UserStats;
  lastUpdated: string;
}

export default function AttendanceDashboard() {
  const { theme, setTheme } = useTheme();
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState("");
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const [chartType, setChartType] = useState<"doughnut" | "bar" | "line">("doughnut");
  const [viewMode, setViewMode] = useState<"overview" | "detailed" | "trends">("overview");
  const [filterPeriod, setFilterPeriod] = useState<"week" | "month" | "semester">("month");



  // Calculate if it's dark mode for chart styling
  const isDarkTheme = theme === 'dark';

  // Load attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/attendance/current`);
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await res.json();
        setAttendanceData(data);
        if (data.subjects && data.subjects.length > 0) {
          setActiveSubject(data.subjects[0].id);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load attendance data");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // Helper function to calculate classes needed to reach target

  // Get attendance status based on percentage
  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 90) return { color: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30", message: "Excellent" };
    if (percentage >= 75) return { color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30", message: "Good" };
    if (percentage >= 60) return { color: "text-yellow-600 dark:text-yellow-400", bgColor: "bg-yellow-100 dark:bg-yellow-900/30", message: "Average" };
    return { color: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30", message: "At Risk" };
  };

  // Format date nicely
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Prepare trend data based on filter period
  const filteredTrendData = useMemo(() => {
    if (!attendanceData?.attendanceTrend) return [];
    
    const now = new Date();
    const filterDate = new Date();
    
    if (filterPeriod === "week") {
      filterDate.setDate(now.getDate() - 7);
    } else if (filterPeriod === "month") {
      filterDate.setMonth(now.getMonth() - 1);
    } else {
      filterDate.setMonth(now.getMonth() - 6); // Semester (approx. 6 months)
    }
    
    return attendanceData.attendanceTrend
      .filter(item => new Date(item.date) >= filterDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [attendanceData?.attendanceTrend, filterPeriod]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading your attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg shadow max-w-md dark:shadow-gray-800">
          <div className="flex items-center text-red-600 dark:text-red-400 mb-4">
            <AlertCircle size={24} className="mr-2" />
            <h2 className="text-xl font-bold">Error</h2>
          </div>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!attendanceData) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg shadow max-w-md dark:shadow-gray-800">
          <div className="flex items-center text-yellow-600 dark:text-yellow-400 mb-4">
            <AlertCircle size={24} className="mr-2" />
            <h2 className="text-xl font-bold">No Data Available</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            No attendance data is available for your account. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  // Get active subject details
  const activeSubjectData = attendanceData.subjects.find(
    (subject) => subject.id === activeSubject
  );

  // Prepare chart data
  const overallChartData = {
    labels: ["Attended", "Missed"],
    datasets: [
      {
        data: [
          attendanceData.overallMetrics.totalAttended,
          attendanceData.overallMetrics.totalClasses - attendanceData.overallMetrics.totalAttended,
        ],
        backgroundColor: ["#4ade80", "#f87171"],
        borderColor: ["#22c55e", "#ef4444"],
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  };

  // Bar chart data for subject comparison
  const subjectComparisonData: ChartData<'bar', number[], string> = {
    labels: attendanceData.subjects.map(subj => subj.subjectCode),
    datasets: [
      {
        label: 'Attendance %',
        data: attendanceData.subjects.map(subj => parseFloat(subj.attendancePercentage)),
        backgroundColor: attendanceData.subjects.map(subj => {
          const percentage = parseFloat(subj.attendancePercentage);
          if (percentage >= 90) return isDarkTheme ? 'rgba(74, 222, 128, 0.8)' : 'rgba(22, 163, 74, 0.7)';
          if (percentage >= 75) return isDarkTheme ? 'rgba(96, 165, 250, 0.8)' : 'rgba(37, 99, 235, 0.7)';
          if (percentage >= 60) return isDarkTheme ? 'rgba(250, 204, 21, 0.8)' : 'rgba(202, 138, 4, 0.7)';
          return isDarkTheme ? 'rgba(248, 113, 113, 0.8)' : 'rgba(220, 38, 38, 0.7)';
        }),
        borderWidth: 1,
      },
      
    ],
  };

  // Line chart for attendance trends
  const attendanceTrendData = {
    labels: filteredTrendData.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Attendance %',
        data: filteredTrendData.map(item => item.percentage),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3b82f6',
      },
      {
        label: 'Target (75%)',
        data: Array(filteredTrendData.length).fill(75),
        borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      }
    ],
  };

  // Get the subjects to display (either all or just the ones at risk)
  const displayedSubjects = showAllSubjects 
    ? attendanceData.subjects 
    : attendanceData.subjects.filter(s => !s.isAbove75);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">Attendance Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {attendanceData.user.name} • {attendanceData.user.branch || 'No Department'} • {attendanceData.user.batch ? `Semester ${attendanceData.user.batch}` : 'No Semester'} 
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                <button 
                  onClick={() => setViewMode("overview")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    viewMode === "overview" 
                      ? "bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow" 
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setViewMode("detailed")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    viewMode === "detailed" 
                      ? "bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow" 
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  Detailed
                </button>
                <button 
                  onClick={() => setViewMode("trends")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    viewMode === "trends" 
                      ? "bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow" 
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  Trends
                </button>
              </div>
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>

          {/* Last updated banner */}
          <div className="mt-4 flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 py-2">
            <div className="flex items-center">
              <CalendarClock className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-sm text-blue-600 dark:text-blue-400">
                Last Updated: {formatDate(attendanceData.lastUpdated)}
              </span>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Refresh
            </button>
          </div>
        </header>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-4 flex items-center">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Classes</p>
              <p className="text-xl font-bold dark:text-white">{attendanceData.overallMetrics.totalClasses}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-4 flex items-center">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
              <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Attended</p>
              <p className="text-xl font-bold dark:text-white">{attendanceData.overallMetrics.totalAttended}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-4 flex items-center">
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Missed</p>
              <p className="text-xl font-bold dark:text-white">{attendanceData.overallMetrics.totalClasses - attendanceData.overallMetrics.totalAttended}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-4 flex items-center">
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
              <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Subjects</p>
              <p className="text-xl font-bold dark:text-white">{attendanceData.subjects.length}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-4 flex items-center">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
              <BookOpenCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Above 75%</p>
              <p className="text-xl font-bold dark:text-white">{attendanceData.overallMetrics.subjectsAbove75Percent}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-4 flex items-center">
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
              <BookX className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Below 75%</p>
              <p className="text-xl font-bold dark:text-white">{attendanceData.overallMetrics.subjectsBelow75Percent}</p>
            </div>
          </div>
        </div>

        {/* User Stats Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-8 overflow-hidden">
          <div className="p-6 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-white mb-1">Your Attendance Streak</h3>
              <p className="text-blue-100">Keep up the good work to maintain your academic performance!</p>
            </div>
            <div className="flex space-x-6">
              <div className="text-center">
                <div className="flex items-center justify-center h-14 w-14 rounded-full bg-white/20 mx-auto mb-2">
                  <Flame className="h-7 w-7 text-orange-300" />
                </div>
                <p className="text-xl font-bold text-white">{attendanceData.userStats.loginStreak}</p>
                <p className="text-sm text-blue-100">Current Streak</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center h-14 w-14 rounded-full bg-white/20 mx-auto mb-2">
                  <Calendar className="h-7 w-7 text-blue-100" />
                </div>
                <p className="text-xl font-bold text-white">{attendanceData.userStats.loginDays}</p>
                <p className="text-sm text-blue-100">Total Days</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center h-14 w-14 rounded-full bg-white/20 mx-auto mb-2">
                  <Award className="h-7 w-7 text-yellow-300" />
                </div>
                <p className="text-xl font-bold text-white">{attendanceData.userStats.honorScore}</p>
                <p className="text-sm text-blue-100">Honor Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Overall Attendance */}
            <div className="col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Overall Attendance</h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setChartType("doughnut")}
                      className={`p-1.5 rounded ${chartType === 'doughnut' 
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      <span className="sr-only">Doughnut Chart</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                    </button>
                    <button 
                      onClick={() => setChartType("bar")}
                      className={`p-1.5 rounded ${chartType === 'bar' 
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      <BarChart3 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-center mb-6">
                  <div style={{ width: '100%', height: chartType === 'doughnut' ? '180px' : '220px' }}>
                    {chartType === 'doughnut' ? (
                      <Doughnut 
                        data={overallChartData} 
                        options={{
                          cutout: '70%',
                          plugins: {
                            legend: {
                              display: false
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const label = context.label || '';
                                  const value = context.raw as number;
                                  const total = attendanceData.overallMetrics.totalClasses;
                                  const percentage = Math.round((value / total) * 100);
                                  return `${label}: ${value} (${percentage}%)`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    ) : (
                      <Bar 
                        data={subjectComparisonData}
                        options={{
                          indexAxis: 'y',
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            x: {
                              grid: {
                                color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                              },
                              ticks: {
                                color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                              }
                            },
                            y: {
                              grid: {
                                display: false
                              },
                              ticks: {
                                color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                              }
                            }
                          },
                          plugins: {
                            legend: {
                              display: true,
                              labels: {
                                color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                              }
                            },
                            tooltip: {
                              backgroundColor: isDarkTheme ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                              titleColor: isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                              bodyColor: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                              borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                              borderWidth: 1
                            }
                          },
                        }}
                      />
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className={`text-4xl font-bold ${
                    getAttendanceStatus(attendanceData.overallMetrics.overallPercentage).color
                  }`}>
                    {attendanceData.overallMetrics.overallPercentage.toFixed(1)}%
                  </div>
                  <p className={`text-sm font-medium mt-1 ${
                    getAttendanceStatus(attendanceData.overallMetrics.overallPercentage).color
                  }`}>
                    {getAttendanceStatus(attendanceData.overallMetrics.overallPercentage).message}
                  </p>
                </div>
                
                <div className="mt-6 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Attended</span>
                  </div>
                  <span className="text-sm font-medium dark:text-gray-300">
                    {attendanceData.overallMetrics.totalAttended} Classes ({Math.round((attendanceData.overallMetrics.totalAttended / attendanceData.overallMetrics.totalClasses) * 100)}%)
                  </span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Missed</span>
                  </div>
                  <span className="text-sm font-medium dark:text-gray-300">
                    {attendanceData.overallMetrics.totalClasses - attendanceData.overallMetrics.totalAttended} Classes ({Math.round(((attendanceData.overallMetrics.totalClasses - attendanceData.overallMetrics.totalAttended) / attendanceData.overallMetrics.totalClasses) * 100)}%)
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Attendance Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Above 75% (Safe)</p>
                      <p className="text-lg font-bold dark:text-white">{attendanceData.overallMetrics.subjectsAbove75Percent} Subjects</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Below 75% (At Risk)</p>
                      <p className="text-lg font-bold dark:text-white">{attendanceData.overallMetrics.subjectsBelow75Percent} Subjects</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Current Semester Status</p>
                      <p className="text-lg font-bold dark:text-white">
                        {attendanceData.overallMetrics.overallPercentage >= 75 ? "On Track" : "Needs Improvement"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Subject List */}
            <div className="col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Subject Attendance</h3>
                  <button 
                    onClick={() => setShowAllSubjects(!showAllSubjects)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                  >
                    {showAllSubjects ? "Show At Risk Only" : "Show All Subjects"}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {displayedSubjects.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
                      <h4 className="text-lg font-medium dark:text-white">All Good!</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Great job! All subjects are above 75% attendance.
                      </p>
                    </div>
                  ) : (
                    displayedSubjects.map((subject) => {
                      const percentage = parseFloat(subject.attendancePercentage);
                      const status = getAttendanceStatus(percentage);
                      
                      return (
                        <div 
                          key={subject.id}
                          className={`p-4 rounded-lg ${status.bgColor} hover:bg-opacity-80 dark:hover:bg-opacity-40 transition cursor-pointer`}
                          onClick={() => {
                            setActiveSubject(subject.id);
                            setViewMode("detailed");
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center space-x-1.5 mb-1">
                                <h4 className="font-medium text-gray-900 dark:text-white">{subject.subjectName}</h4>
                                <span className="text-xs bg-gray-200 dark:bg-gray-700 rounded px-1.5 py-0.5 text-gray-700 dark:text-gray-300">
                                  {subject.subjectCode}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Prof. {subject.facultyName}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${status.color}`}>
                                {percentage.toFixed(1)}%
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {subject.attendedClasses}/{subject.totalClasses} Classes
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  percentage >= 90 ? 'bg-green-500' : 
                                  percentage >= 75 ? 'bg-blue-500' : 
                                  percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(100, percentage)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {!subject.isAbove75 && (
                            <div className="mt-3 flex items-center text-xs text-red-600 dark:text-red-400">
                              <AlertCircle className="h-3.5 w-3.5 mr-1" />
                              <span>Need to attend next {subject.classesNeeded} classes to reach 75%</span>
                            </div>
                          )}
                          
                          {subject.isAbove75 && subject.classesCanSkip > 0 && (
                            <div className="mt-3 flex items-center text-xs text-green-600 dark:text-green-400">
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              <span>Can skip up to {subject.classesCanSkip} classes while staying above 75%</span>
                            </div>
                          )}
                          
                          <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 flex justify-end">
                            <span className="flex items-center">
                              View Details
                              <ArrowUpRight className="ml-1 h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {viewMode === "detailed" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Subject Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Subject List</h3>
              <div className="space-y-2">
                {attendanceData.subjects.map((subject) => {
                  const percentage = parseFloat(subject.attendancePercentage);
                  const isActive = subject.id === activeSubject;
                  
                  return (
                    <button 
                      key={subject.id}
                      onClick={() => setActiveSubject(subject.id)}
                      className={`w-full flex justify-between items-center p-3 rounded-lg transition ${
                        isActive 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <div 
                          className={`h-2.5 w-2.5 rounded-full mr-2 ${
                            percentage >= 75 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        ></div>
                        <span className={`font-medium ${isActive ? '' : 'text-gray-700 dark:text-gray-300'}`}>
                          {subject.subjectCode}
                        </span>
                      </div>
                      <span className={`text-sm ${isActive ? '' : 'text-gray-600 dark:text-gray-400'}`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Right Column - Subject Details */}
            <div className="col-span-2">
              {activeSubjectData ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{activeSubjectData.subjectName}</h2>
                      <p className="text-gray-600 dark:text-gray-400">Code: {activeSubjectData.subjectCode} • Prof. {activeSubjectData.facultyName}</p>
                    </div>
                    <div 
                      className={`px-3 py-1 rounded-full ${
                        activeSubjectData.isAbove75 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {activeSubjectData.isAbove75 ? 'Above 75%' : 'Below 75%'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Attended Classes</div>
                      <div className="text-2xl font-bold text-gray-800 dark:text-white">{activeSubjectData.attendedClasses}</div>
                    </div>
                    
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Classes</div>
                      <div className="text-2xl font-bold text-gray-800 dark:text-white">{activeSubjectData.totalClasses}</div>
                    </div>
                    
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Attendance</div>
                      <div className={`text-2xl font-bold ${
                        getAttendanceStatus(parseFloat(activeSubjectData.attendancePercentage)).color
                      }`}>
                        {parseFloat(activeSubjectData.attendancePercentage).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress to 75% Requirement</span>
                      <span className={`text-sm font-medium ${
                        parseFloat(activeSubjectData.attendancePercentage) >= 75 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {parseFloat(activeSubjectData.attendancePercentage).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          parseFloat(activeSubjectData.attendancePercentage) >= 90 ? 'bg-green-500' : 
                          parseFloat(activeSubjectData.attendancePercentage) >= 75 ? 'bg-blue-500' : 
                          parseFloat(activeSubjectData.attendancePercentage) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, parseFloat(activeSubjectData.attendancePercentage))}%` }}
                      ></div>
                    </div>
                    <div className="relative mt-1">
                      <div 
                        className="absolute h-3 border-l border-dashed border-gray-400 dark:border-gray-500"
                        style={{ left: '75%', top: '0' }}
                      ></div>
                      <div 
                        className="absolute text-xs text-gray-500 dark:text-gray-400"
                        style={{ left: 'calc(75% - 12px)', top: '4px' }}
                      >
                        75%
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Attendance Analysis */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                      <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
                        Attendance Analysis
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Classes Attended</span>
                          <span className="text-sm font-medium dark:text-white">{activeSubjectData.attendedClasses} of {activeSubjectData.totalClasses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Classes Missed</span>
                          <span className="text-sm font-medium dark:text-white">{activeSubjectData.totalClasses - activeSubjectData.attendedClasses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Current Status</span>
                          <span className={`text-sm font-medium ${
                            activeSubjectData.isAbove75 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {activeSubjectData.isAbove75 ? 'Good Standing' : 'Warning'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Required */}
                    <div className={`p-4 rounded-lg ${
                      activeSubjectData.isAbove75 
                        ? 'bg-green-50 dark:bg-green-900/20' 
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      <h4 className={`text-lg font-medium mb-3 ${
                        activeSubjectData.isAbove75 
                          ? 'text-green-800 dark:text-green-300' 
                          : 'text-red-800 dark:text-red-300'
                      }`}>
                        {activeSubjectData.isAbove75 ? 'Good News' : 'Action Required'}
                      </h4>
                      
                      {activeSubjectData.isAbove75 ? (
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                            You are doing well in this subject! Your attendance is above the required 75%.
                          </p>
                          {activeSubjectData.classesCanSkip > 0 && (
                            <div className="flex items-center mt-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <p className="text-sm text-green-600 dark:text-green-400">
                                You can skip up to <strong>{activeSubjectData.classesCanSkip} classes</strong> while maintaining at least 75% attendance.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                            Your attendance is below the required 75%. You need to improve your attendance to avoid academic penalties.
                          </p>
                          <div className="flex items-center mt-3">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                            <p className="text-sm text-red-600 dark:text-red-400">
                              You need to attend the next <strong>{activeSubjectData.classesNeeded} classes</strong> consecutively to reach 75%.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                      Tips to Improve
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-2 mt-0.5 text-xs">1</div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Set reminders for class timings to ensure you donot miss any classes.</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-2 mt-0.5 text-xs">2</div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">If you must miss a class, inform your professor in advance with a valid reason.</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-2 mt-0.5 text-xs">3</div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Track your attendance regularly using this dashboard to stay informed.</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-2 mt-0.5 text-xs">4</div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Reach out to your advisor if youare facing consistent difficulties attending classes.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-6 flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No Subject Selected</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                      Please select a subject from the list to view detailed attendance information.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {viewMode === "trends" && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 sm:mb-0">Attendance Trends</h3>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button 
                    onClick={() => setFilterPeriod("week")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      filterPeriod === "week" 
                        ? "bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow" 
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    Week
                  </button>
                  <button 
                    onClick={() => setFilterPeriod("month")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      filterPeriod === "month" 
                        ? "bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow" 
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    Month
                  </button>
                  <button 
                    onClick={() => setFilterPeriod("semester")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      filterPeriod === "semester" 
                        ? "bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow" 
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    Semester
                  </button>
                </div>
              </div>
              
              <div className="h-72 mb-8">
                {filteredTrendData.length > 0 ? (
                  <Line 
                    data={attendanceTrendData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          min: 0,
                          max: 100,
                          grid: {
                            color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                          },
                          ticks: {
                            color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                            callback: function(value) {
                              return value + '%';
                            }
                          }
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: true,
                          labels: {
                            color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                          }
                        },
                        tooltip: {
                          backgroundColor: isDarkTheme ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          titleColor: isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                          bodyColor: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                          borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                          borderWidth: 1,
                          callbacks: {
                            label: function(context) {
                              let label = context.dataset.label || '';
                              if (label) {
                                label += ': ';
                              }
                              if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(1) + '%';
                              }
                              return label;
                            }
                          }
                        }
                      },
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No trend data available for the selected period</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Trend Analysis</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {filteredTrendData.length > 1 ? (
                      filteredTrendData[filteredTrendData.length - 1].percentage > 
                      filteredTrendData[0].percentage ? (
                        "Your attendance is improving over time. Keep it up!"
                      ) : filteredTrendData[filteredTrendData.length - 1].percentage < 
                      filteredTrendData[0].percentage ? (
                        "Your attendance is declining. Try to attend more classes."
                      ) : (
                        "Your attendance has been consistent over this period."
                      )
                    ) : (
                      "Not enough data to analyze trends for the selected period."
                    )}
                  </p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Attendance Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-purple-600 dark:text-purple-400">Average</span>
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        {filteredTrendData.length > 0 
                          ? (filteredTrendData.reduce((sum, item) => sum + item.percentage, 0) / filteredTrendData.length).toFixed(1) + '%'
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-purple-600 dark:text-purple-400">Highest</span>
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        {filteredTrendData.length > 0 
                          ? Math.max(...filteredTrendData.map(item => item.percentage)).toFixed(1) + '%'
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-purple-600 dark:text-purple-400">Lowest</span>
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        {filteredTrendData.length > 0 
                          ? Math.min(...filteredTrendData.map(item => item.percentage)).toFixed(1) + '%'
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">Recommendation</h4>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    {attendanceData.overallMetrics.overallPercentage >= 90 ? (
                      "Excellent attendance! You're well above the requirement."
                    ) : attendanceData.overallMetrics.overallPercentage >= 75 ? (
                      "Good job maintaining attendance above 75%. Stay consistent."
                    ) : attendanceData.overallMetrics.overallPercentage >= 65 ? (
                      "You're close to the minimum requirement. Attend all upcoming classes."
                    ) : (
                      "Your attendance needs significant improvement. Don't miss any more classes."
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Subject-wise Trends</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Subject
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Start %
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Current %
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Change
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {attendanceData.subjects.map((subject) => {
                      // Simulated start percentage (for demo)
                      const startPercentage = parseFloat(subject.attendancePercentage) - (Math.random() * 10 - 5);
                      const currentPercentage = parseFloat(subject.attendancePercentage);
                      const percentageChange = currentPercentage - startPercentage;
                      const isPositive = percentageChange >= 0;
                      
                      return (
                        <tr key={subject.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition"
                          onClick={() => {
                            setActiveSubject(subject.id);
                            setViewMode("detailed");
                          }}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{subject.subjectCode}</div>
                              <div className="ml-2 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">{subject.subjectName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 dark:text-gray-300">{startPercentage.toFixed(1)}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${
                              currentPercentage >= 75 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {currentPercentage.toFixed(1)}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex items-center text-sm ${
                              isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {isPositive ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M12 7a1 1 0 01-1 1H9a1 1 0 01-1-1V6a1 1 0 011-1h2a1 1 0 011 1v1zm-1 4a1 1 0 00-1 1v1a1 1 0 001 1h2a1 1 0 001-1v-1a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                                  <path d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M12 13a1 1 0 01-1 1H9a1 1 0 01-1-1v-1a1 1 0 011-1h2a1 1 0 011 1v1zm-1-4a1 1 0 00-1 1v1a1 1 0 001 1h2a1 1 0 001-1v-1a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                                  <path d="M14.707 7.707a1 1 0 00-1.414 0L11 10V3a1 1 0 10-2 0v7l-2.293-2.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" />
                                </svg>
                              )}
                              {Math.abs(percentageChange).toFixed(1)}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              currentPercentage >= 90
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : currentPercentage >= 75
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                  : currentPercentage >= 60
                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                            }`}>
                              {currentPercentage >= 90
                                ? 'Excellent'
                                : currentPercentage >= 75
                                  ? 'Good'
                                  : currentPercentage >= 60
                                    ? 'Average'
                                    : 'At Risk'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Student Attendance System. All rights reserved.</p>
          <p className="mt-1">Last login: {new Date(attendanceData.user.lastSeen).toLocaleString()}</p>
        </footer>
      </div>
    </div>
  );
}