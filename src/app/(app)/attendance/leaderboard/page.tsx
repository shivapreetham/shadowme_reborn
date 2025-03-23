"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { 
  Search, Filter, Trophy, Medal, Award, 
  User, Calendar, BookOpen, Percent, ArrowUp, 
  ArrowDown, RefreshCw, Download, Share2, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

// Type definitions
interface Subject {
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

interface UserData {
  id: string;
  username: string;
  email?: string;
  batch?: string | null;
  branch?: string | null;
  avatar?: string | null;
  course?: string | null;
  lastSeen: Date;
  overallPercentage: number;
  overallAttendedClasses: number;
  overallTotalClasses: number;
  subjects: Subject[];
  rank: number;
}

interface ApiResponse {
  users: UserData[];
  metadata: {
    total: number;
    batches: string[];
    branches: string[];
    subjects: string[];
  };
}

export default function LeaderboardPage() {
  // State management
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  const [leaderboardData, setLeaderboardData] = useState<ApiResponse | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [highlightedUser, setHighlightedUser] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'ascending' | 'descending'}>({
    key: 'rank',
    direction: 'ascending'
  });
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserData | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch leaderboard data
  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (selectedBatch) params.append('batch', selectedBatch);
      if (selectedBranch) params.append('branch', selectedBranch);
      if (selectedSubject) params.append('subject', selectedSubject);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/api/attendance/leaderboard${queryString}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
      
      const data: ApiResponse = await response.json();
      setLeaderboardData(data);
      
      // Find current user's ID to highlight
      if (userEmail && data.users.length > 0) {
        const currentUser = data.users.find(user => 
          user.email?.toLowerCase() === userEmail.toLowerCase()
        );
        
        if (currentUser) {
          setHighlightedUser(currentUser.id);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      setError("Failed to load leaderboard data");
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLeaderboardData();
  }, [selectedBatch, selectedBranch, selectedSubject]);

  // Apply subject filter and sorting
  useEffect(() => {
    if (!leaderboardData) return;
    
    let filtered = [...leaderboardData.users];
    
    // Apply subject filter if one is selected
    if (selectedSubject) {
      filtered = filtered
        .map(user => {
          const subjectData = user.subjects.find(
            s => s.subjectCode === selectedSubject
          );
          
          if (subjectData) {
            return {
              ...user,
              filteredPercentage: subjectData.attendancePercentage,
              filteredAttended: subjectData.attendedClasses,
              filteredTotal: subjectData.totalClasses
            };
          }
          return null;
        })
        .filter(Boolean) as UserData[];
    }
    
    // Apply search filter if a query exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.batch?.toLowerCase().includes(query) ||
        user.branch?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof UserData];
      let bValue: any = b[sortConfig.key as keyof UserData];
      
      // Handle special case for subject-specific percentages
      if (sortConfig.key === 'percentage') {
        if (selectedSubject) {
          aValue = a.subjects.find(s => s.subjectCode === selectedSubject)?.attendancePercentage || 0;
          bValue = b.subjects.find(s => s.subjectCode === selectedSubject)?.attendancePercentage || 0;
        } else {
          aValue = a.overallPercentage;
          bValue = b.overallPercentage;
        }
      }
      
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
    
    setFilteredUsers(filtered);
  }, [leaderboardData, selectedSubject, searchQuery, sortConfig]);

  // Sort handlers
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!filteredUsers.length) return;
    
    setIsExporting(true);
    
    try {
      const heading = selectedSubject 
        ? `Rank,Username,Batch,Branch,${selectedSubject} Attendance %,Attended,Total Classes\n`
        : 'Rank,Username,Batch,Branch,Overall Attendance %,Attended,Total Classes\n';
      
      const csvContent = filteredUsers.map(user => {
        const subjectData = selectedSubject 
          ? user.subjects.find(s => s.subjectCode === selectedSubject)
          : null;
        
        const percentage = subjectData 
          ? subjectData.attendancePercentage 
          : user.overallPercentage;
        
        const attended = subjectData 
          ? subjectData.attendedClasses 
          : user.overallAttendedClasses;
        
        const total = subjectData 
          ? subjectData.totalClasses 
          : user.overallTotalClasses;
        
        return `${user.rank},"${user.username}","${user.batch || ''}","${user.branch || ''}",${percentage},${attended},${total}`;
      }).join('\n');
      
      const csv = heading + csvContent;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-leaderboard${selectedSubject ? `-${selectedSubject}` : ''}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Leaderboard exported successfully!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export leaderboard');
    } finally {
      setIsExporting(false);
    }
  };

  // User detail modal handlers
  const handleUserDetailModal = (user: UserData | null) => {
    setSelectedUserDetails(user);
  };

  // Memoized statistics
  const stats = useMemo(() => {
    if (!leaderboardData) return null;
    
    const total = filteredUsers.length;
    const averageAttendance = filteredUsers.reduce((sum, user) => 
      sum + (selectedSubject 
        ? (user.subjects.find(s => s.subjectCode === selectedSubject)?.attendancePercentage || 0)
        : user.overallPercentage), 0) / (total || 1);
    
    const above75Count = filteredUsers.filter(user => 
      (selectedSubject 
        ? (user.subjects.find(s => s.subjectCode === selectedSubject)?.attendancePercentage || 0) >= 75
        : user.overallPercentage >= 75)).length;
    
    return {
      total,
      averageAttendance: averageAttendance.toFixed(2),
      above75Percent: ((above75Count / total) * 100).toFixed(2),
      above75Count
    };
  }, [filteredUsers, selectedSubject]);

  // Determine if current user is in the top performers
  const isCurrentUserTopPerformer = useMemo(() => {
    if (!highlightedUser || !filteredUsers.length) return false;
    const userRank = filteredUsers.find(user => user.id === highlightedUser)?.rank || 0;
    return userRank <= 3;
  }, [highlightedUser, filteredUsers]);

  // Get medal type based on rank
  const getMedalType = (rank: number) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with title and stats */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Trophy className="mr-2" /> Attendance Leaderboard
          </h1>
          
          <p className="opacity-80 mb-4">
            Track your attendance performance and see how you rank among your peers
          </p>
          
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-sm uppercase tracking-wider opacity-80">Total Students</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-sm uppercase tracking-wider opacity-80">Average Attendance</p>
                <p className="text-2xl font-bold">{stats.averageAttendance}%</p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-sm uppercase tracking-wider opacity-80">Students Above 75%</p>
                <p className="text-2xl font-bold">{stats.above75Count} ({stats.above75Percent}%)</p>
              </div>
              
              {isCurrentUserTopPerformer && (
                <div className="bg-amber-500/30 border border-amber-400/50 rounded-lg p-4 backdrop-blur-sm flex items-center">
                  <Award className="mr-3" size={32} />
                  <div>
                    <p className="uppercase tracking-wider font-bold">Congratulations!</p>
                    <p className="opacity-90">You are among the top performers!</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Filters and controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div className="flex items-center mb-4 md:mb-0 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <input 
                  type="text"
                  placeholder="Search by name, batch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
              
              <button 
                className="ml-2 p-2 rounded-lg border hover:bg-gray-50 transition-colors"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} className={showFilters ? "text-blue-600" : "text-gray-600"} />
              </button>
              
              <button 
                className="ml-2 p-2 rounded-lg border hover:bg-gray-50 transition-colors"
                onClick={fetchLeaderboardData}
                disabled={loading}
              >
                <RefreshCw size={20} className={`text-gray-600 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
            
            <div className="flex space-x-2 w-full md:w-auto justify-end">
              <button
                onClick={exportToCSV}
                disabled={isExporting || filteredUsers.length === 0}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
                  filteredUsers.length === 0 
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                    : "bg-green-600 hover:bg-green-700 text-white"
                } transition-colors`}
              >
                <Download size={16} />
                <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
              </button>
              
              <button
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Attendance Leaderboard',
                      text: 'Check out our class attendance leaderboard!',
                      url: window.location.href,
                    })
                    .then(() => toast.success('Shared successfully!'))
                    .catch((error) => console.log('Error sharing', error));
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                  }
                }}
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
            </div>
          </div>
          
          {/* Expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Overall Performance</option>
                      {leaderboardData?.metadata.subjects.map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                    <select
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Batches</option>
                      {leaderboardData?.metadata.batches.map((batch) => (
                        <option key={batch} value={batch}>{batch}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Branches</option>
                      {leaderboardData?.metadata.branches.map((branch) => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedSubject("");
                      setSelectedBatch("");
                      setSelectedBranch("");
                      setSearchQuery("");
                      setSortConfig({ key: 'rank', direction: 'ascending' });
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Reset Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Leaderboard table */}
        {!loading && filteredUsers.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-4 font-semibold text-gray-600 cursor-pointer" onClick={() => requestSort('rank')}>
                      <div className="flex items-center">
                        <span>Rank</span>
                        {sortConfig.key === 'rank' && (
                          sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th className="p-4 font-semibold text-gray-600 cursor-pointer" onClick={() => requestSort('username')}>
                      <div className="flex items-center">
                        <span>Student</span>
                        {sortConfig.key === 'username' && (
                          sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th className="p-4 font-semibold text-gray-600">Batch / Branch</th>
                    <th className="p-4 font-semibold text-gray-600 cursor-pointer" onClick={() => requestSort('percentage')}>
                      <div className="flex items-center">
                        <span>{selectedSubject ? `${selectedSubject}` : 'Overall'} %</span>
                        {sortConfig.key === 'percentage' && (
                          sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th className="p-4 font-semibold text-gray-600">Attended / Total</th>
                    <th className="p-4 font-semibold text-gray-600 text-center">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const isHighlighted = user.id === highlightedUser;
                    const medal = getMedalType(user.rank);
                    const subjectData = selectedSubject 
                      ? user.subjects.find(s => s.subjectCode === selectedSubject)
                      : null;
                    
                    const percentage = subjectData 
                      ? subjectData.attendancePercentage 
                      : user.overallPercentage;
                    
                    const attended = subjectData 
                      ? subjectData.attendedClasses 
                      : user.overallAttendedClasses;
                    
                    const total = subjectData 
                      ? subjectData.totalClasses 
                      : user.overallTotalClasses;
                    
                    const attendanceStatus = percentage >= 75 
                      ? "text-green-500" 
                      : percentage >= 65 
                        ? "text-amber-500" 
                        : "text-red-500";
                        
                    return (
                      <motion.tr 
                        key={user.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`border-t ${isHighlighted ? "bg-blue-50" : ""} hover:bg-gray-50 transition-colors`}
                      >
                        <td className="p-4">
                          <div className="flex items-center">
                            {medal === 'gold' && (
                              <div className="mr-2 bg-amber-400 text-white p-1 rounded-full">
                                <Trophy size={16} />
                              </div>
                            )}
                            {medal === 'silver' && (
                              <div className="mr-2 bg-gray-300 text-white p-1 rounded-full">
                                <Medal size={16} />
                              </div>
                            )}
                            {medal === 'bronze' && (
                              <div className="mr-2 bg-amber-700 text-white p-1 rounded-full">
                                <Medal size={16} />
                              </div>
                            )}
                            <span className={medal ? "font-bold" : ""}>{user.rank}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3 overflow-hidden">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                              ) : (
                                <User size={16} className="text-gray-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{user.username}</p>
                              {isHighlighted && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">You</span>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-600">
                            <div>{user.batch || '-'}</div>
                            <div>{user.branch || '-'}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className={`font-bold text-lg ${attendanceStatus}`}>
                            {percentage.toFixed(1)}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${
                                percentage >= 75 
                                  ? "bg-green-500" 
                                  : percentage >= 65 
                                    ? "bg-amber-500" 
                                    : "bg-red-500"
                              }`}
                              style={{ width: `${Math.min(100, percentage)}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <span className="font-medium">{attended}</span>
                            <span className="text-gray-500"> / {total}</span>
                          </div>
                          
                          {subjectData && (
                            <div className="mt-1 text-xs">
                              {subjectData.isAbove75 ? (
                                <span className="text-green-500">
                                  Can skip {subjectData.classesCanSkip} more
                                </span>
                              ) : (
                                <span className="text-red-500">
                                  Need {subjectData.classesNeeded} more
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleUserDetailModal(user)}
                            className="p-2 text-blue-600 hover:text-blue-800 transition-colors rounded-full hover:bg-blue-50"
                          >
                            <Info size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Empty state */}
        {!loading && filteredUsers.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-50 rounded-full">
                <Search size={32} className="text-blue-500" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? `No students match your search for "${searchQuery}"`
                : "No students match your current filters"}
            </p>
            <button
              onClick={() => {
                setSelectedSubject("");
                setSelectedBatch("");
                setSelectedBranch("");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
        
        {/* User detail modal */}
        {selectedUserDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Student Details</h2>
                  <button 
                    onClick={() => handleUserDetailModal(null)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
                        {selectedUserDetails.avatar ? (
                          <img src={selectedUserDetails.avatar} alt={selectedUserDetails.username} className="w-full h-full object-cover" />
                        ) : (
                          <User size={36} className="text-gray-500" />
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-center">{selectedUserDetails.username}</h3>
                      <p className="text-gray-600 mb-2">{selectedUserDetails.email || '-'}</p>
                      
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {selectedUserDetails.batch && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            <Calendar className="inline-block mr-1" size={14} /> {selectedUserDetails.batch}
                          </span>
                        )}
                        
                        {selectedUserDetails.branch && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                            <BookOpen className="inline-block mr-1" size={14} /> {selectedUserDetails.branch}
                          </span>
                        )}
                        
                        {selectedUserDetails.course && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {selectedUserDetails.course}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Overall Rank</span>
                        <span className="font-bold">{selectedUserDetails.rank}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Overall Attendance</span>
                        <span className={`font-bold ${
                          selectedUserDetails.overallPercentage >= 75 
                            ? "text-green-600" 
                            : selectedUserDetails.overallPercentage >= 65 
                              ? "text-amber-600" 
                              : "text-red-600"
                        }`}>
                          {selectedUserDetails.overallPercentage.toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Classes</span>
                        <span className="font-medium">
                          {selectedUserDetails.overallAttendedClasses} / {selectedUserDetails.overallTotalClasses}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3">
                    <h4 className="font-medium mb-3 flex items-center">
                      <BookOpen className="mr-2" size={18} /> Subject Attendance
                    </h4>
                    
                    <div className="space-y-4">
                      {selectedUserDetails.subjects.map((subject) => (
                        <div key={subject.id} className="bg-gray-50 p-4 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-medium">{subject.subjectName}</h5>
                              <p className="text-sm text-gray-600">{subject.subjectCode}</p>
                            </div>
                            <div className={`text-lg font-bold ${
                              subject.attendancePercentage >= 75 
                                ? "text-green-600" 
                                : subject.attendancePercentage >= 65 
                                  ? "text-amber-600" 
                                  : "text-red-600"
                            }`}>
                              {subject.attendancePercentage.toFixed(1)}%
                            </div>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                subject.attendancePercentage >= 75 
                                  ? "bg-green-500" 
                                  : subject.attendancePercentage >= 65 
                                    ? "bg-amber-500" 
                                    : "bg-red-500"
                              }`}
                              style={{ width: `${Math.min(100, subject.attendancePercentage)}%` }}
                            ></div>
                          </div>
                          
                          <div className="mt-2 flex flex-wrap gap-2">
                            <div className="text-sm">
                              <span className="text-gray-600">Attended:</span> 
                              <span className="font-medium ml-1">{subject.attendedClasses} / {subject.totalClasses}</span>
                            </div>
                            
                            <div className="text-sm ml-auto">
                              {subject.isAbove75 ? (
                                <span className="text-green-600">
                                  <Percent className="inline-block mr-1" size={14} />
                                  Can skip {subject.classesCanSkip} more
                                </span>
                              ) : (
                                <span className="text-red-600">
                                  <Percent className="inline-block mr-1" size={14} />
                                  Need {subject.classesNeeded} more
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Professor:</span> {subject.subjectProfessor}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t bg-gray-50 flex justify-end">
                <button
                  onClick={() => handleUserDetailModal(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg mr-2 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}