import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Users, FileText, BookOpen, TrendingUp, ArrowRight, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

export default function TeacherDashboardPage() {
  const [stats, setStats] = useState({
    groups: 0,
    tests: 0,
    blockTests: 0,
    assignments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [groupsRes, testsRes, blockTestsRes, assignmentsRes] = await Promise.all([
        api.get('/groups'),
        api.get('/tests'),
        api.get('/block-tests'),
        api.get('/assignments')
      ]);

      setStats({
        groups: groupsRes.data.length,
        tests: testsRes.data.length,
        blockTests: blockTestsRes.data.length,
        assignments: assignmentsRes.data.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { 
      title: 'Mening guruhlarim', 
      value: stats.groups, 
      icon: Users, 
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      link: '/teacher/groups',
      description: 'Faol guruhlar'
    },
    { 
      title: 'Testlar', 
      value: stats.tests, 
      icon: FileText, 
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      link: '/teacher/tests',
      description: 'Yaratilgan testlar'
    },
    { 
      title: 'Blok testlar', 
      value: stats.blockTests, 
      icon: BookOpen, 
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      link: '/teacher/block-tests',
      description: 'Kompleks testlar'
    },
    { 
      title: 'Topshiriqlar', 
      value: stats.assignments, 
      icon: CheckCircle2, 
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      link: '/teacher/assignments',
      description: 'Berilgan vazifalar'
    },
  ];

  const quickActions = [
    { title: 'Test yaratish', icon: FileText, link: '/teacher/tests/create', color: 'from-green-500 to-emerald-600' },
    { title: 'Blok test yaratish', icon: BookOpen, link: '/teacher/block-tests/create', color: 'from-purple-500 to-pink-600' },
    { title: 'Javob tekshirish', icon: CheckCircle2, link: '/teacher/scanner', color: 'from-blue-500 to-cyan-600' },
  ];

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in p-3 sm:p-4 lg:p-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-10 sm:h-12 w-48 sm:w-64 bg-slate-200 rounded-xl sm:rounded-2xl mb-2 sm:mb-3"></div>
          <div className="h-5 sm:h-6 w-64 sm:w-96 bg-slate-200 rounded-lg sm:rounded-xl"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 sm:h-36 lg:h-40 bg-slate-200 rounded-2xl sm:rounded-3xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 min-h-screen pb-16 sm:pb-20">
      {/* Welcome Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl sm:rounded-3xl blur-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-200/50 shadow-xl">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-float">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent truncate">
                Xush kelibsiz!
              </h1>
              <p className="text-slate-600 text-sm sm:text-base lg:text-lg mt-0.5 sm:mt-1 line-clamp-1">Bugungi faoliyatingiz va statistika</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link 
              key={stat.title} 
              to={stat.link}
              style={{ animationDelay: `${index * 100}ms` }}
              className="group animate-slide-in"
            >
              <Card className="h-full border-2 border-slate-200/50 hover:border-indigo-300 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-2 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <CardContent className="p-4 sm:p-5 lg:p-6 relative">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${stat.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                    </div>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 mb-1">{stat.title}</p>
                    <p className="text-3xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent mb-1.5 sm:mb-2">
                      {stat.value}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Tez amallar</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.link}
                style={{ animationDelay: `${index * 100}ms` }}
                className="group animate-slide-in"
              >
                <Card className="border-2 border-slate-200/50 hover:border-indigo-300 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <CardContent className="p-4 sm:p-5 lg:p-6 relative">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${action.color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {action.title}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
