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
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-2xl mx-auto p-4 space-y-3">
          {/* Header Skeleton */}
          <div className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
              <div className="flex-1">
                <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 w-12 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Welcome Header - Simple */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900">
                Xush kelibsiz!
              </h1>
              <p className="text-sm text-gray-500">Bugungi faoliyatingiz va statistika</p>
            </div>
          </div>
        </div>

        {/* Stats Cards - Clean & Simple */}
        <div className="space-y-3">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link 
                key={stat.title} 
                to={stat.link}
                className="block"
              >
                <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    {/* Icon - Simple solid color */}
                    <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-0.5">
                        {stat.title}
                      </h3>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500">{stat.description}</p>
                    </div>
                    
                    {/* Arrow - Simple */}
                    <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions - Clean */}
        <div className="pt-2">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Tez amallar</h2>
          </div>
          
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  to={action.link}
                  className="block"
                >
                  <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-gray-900">
                          {action.title}
                        </p>
                      </div>
                      
                      {/* Arrow */}
                      <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
