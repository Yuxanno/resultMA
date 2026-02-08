import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';
import api from '../../lib/api';
import { 
  FileText, 
  Phone, 
  User, 
  GraduationCap, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Filter,
  RefreshCw,
  Search
} from 'lucide-react';

interface Application {
  _id: string;
  fullName: string;
  phone: string;
  grade: string;
  status: 'pending' | 'contacted' | 'accepted' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApplicationStats {
  total: number;
  pending: number;
  contacted: number;
  accepted: number;
  rejected: number;
}

export default function ApplicationsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  // Fetch applications
  const { data: applicationsData, isLoading, refetch } = useQuery({
    queryKey: ['applications', selectedStatus],
    queryFn: async () => {
      const params = selectedStatus !== 'all' ? `?status=${selectedStatus}` : '';
      const response = await api.get(`/applications${params}`);
      return response.data;
    },
  });

  // Fetch statistics
  const { data: stats } = useQuery<ApplicationStats>({
    queryKey: ['application-stats'],
    queryFn: async () => {
      const response = await api.get('/applications/stats/summary');
      return response.data;
    },
  });

  // Update application mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status?: string; notes?: string }) => {
      const response = await api.patch(`/applications/${id}`, { status, notes });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-stats'] });
      success('Ariza yangilandi');
      setShowModal(false);
      setSelectedApplication(null);
    },
    onError: () => {
      error('Xatolik yuz berdi');
    },
  });

  // Delete application mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/applications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-stats'] });
      success('Ariza o\'chirildi');
    },
    onError: () => {
      error('Xatolik yuz berdi');
    },
  });

  const handleOpenModal = (application: Application) => {
    setSelectedApplication(application);
    setNotes(application.notes || '');
    setNewStatus(application.status);
    setShowModal(true);
  };

  const handleUpdate = () => {
    if (!selectedApplication) return;
    updateMutation.mutate({
      id: selectedApplication._id,
      status: newStatus,
      notes,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Arizani o\'chirmoqchimisiz?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'info' | 'success' | 'danger'> = {
      pending: 'warning',
      contacted: 'info',
      accepted: 'success',
      rejected: 'danger',
    };

    const labels: Record<string, string> = {
      pending: 'Kutilmoqda',
      contacted: 'Bog\'lanildi',
      accepted: 'Qabul qilindi',
      rejected: 'Rad etildi',
    };

    return <Badge variant={variants[status]} size="sm">{labels[status]}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      pending: <Clock className="w-4 h-4" />,
      contacted: <Phone className="w-4 h-4" />,
      accepted: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
    };
    return icons[status];
  };

  const filteredApplications = applicationsData?.applications?.filter((app: Application) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      app.fullName.toLowerCase().includes(query) ||
      app.phone.includes(query) ||
      app.grade.includes(query)
    );
  }) || [];

  return (
    <div className="space-y-6 pb-8">
      {/* Navbar-style Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-200/50 p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left side - Title and Icon */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Qabul arizalari</h1>
              <p className="text-sm text-gray-600 mt-1">Landing sahifasidan kelgan arizalar</p>
            </div>
          </div>

          {/* Right side - Search and Refresh Button */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Ism, telefon yoki sinf bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-full bg-white border-gray-200/50"
              />
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="default"
              onClick={() => refetch()}
              className="group flex-shrink-0 w-12 h-12 rounded-full p-0"
              title="Yangilash"
            >
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards as Filters - Glassmorphism Style */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Barchasi (All) Card */}
          <button
            onClick={() => setSelectedStatus('all')}
            className={`group text-left p-5 rounded-3xl transition-all duration-300 backdrop-blur-sm border ${
              selectedStatus === 'all'
                ? 'bg-gray-500/20 border-gray-500/30 shadow-lg shadow-gray-500/10 scale-[1.02]'
                : 'bg-white/80 border-gray-200/50 hover:shadow-md hover:scale-[1.01] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-3xl flex items-center justify-center transition-all ${
                selectedStatus === 'all'
                  ? 'bg-gray-500/30 backdrop-blur-sm'
                  : 'bg-gray-50 group-hover:scale-110'
              }`}>
                <FileText className={`w-6 h-6 ${
                  selectedStatus === 'all' ? 'text-gray-700' : 'text-gray-600'
                }`} />
              </div>
              <span className={`text-3xl font-bold ${
                selectedStatus === 'all' ? 'text-gray-700' : 'text-gray-600'
              }`}>{stats.total}</span>
            </div>
            <p className={`text-sm font-medium ${
              selectedStatus === 'all' ? 'text-gray-800' : 'text-gray-600'
            }`}>Barchasi</p>
            <div className={`mt-2 h-1 rounded-full overflow-hidden ${
              selectedStatus === 'all' ? 'bg-gray-500/20' : 'bg-gray-100'
            }`}>
              <div className={`h-full rounded-full ${
                selectedStatus === 'all' ? 'bg-gray-600' : 'bg-gray-500'
              }`} style={{ width: '100%' }}></div>
            </div>
          </button>

          <button
            onClick={() => setSelectedStatus('pending')}
            className={`group text-left p-5 rounded-3xl transition-all duration-300 backdrop-blur-sm border ${
              selectedStatus === 'pending'
                ? 'bg-yellow-500/20 border-yellow-500/30 shadow-lg shadow-yellow-500/10 scale-[1.02]'
                : 'bg-white/80 border-gray-200/50 hover:shadow-md hover:scale-[1.01] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-3xl flex items-center justify-center transition-all ${
                selectedStatus === 'pending'
                  ? 'bg-yellow-500/30 backdrop-blur-sm'
                  : 'bg-yellow-50 group-hover:scale-110'
              }`}>
                <Clock className={`w-6 h-6 ${
                  selectedStatus === 'pending' ? 'text-yellow-700' : 'text-yellow-600'
                }`} />
              </div>
              <span className={`text-3xl font-bold ${
                selectedStatus === 'pending' ? 'text-yellow-700' : 'text-yellow-600'
              }`}>{stats.pending}</span>
            </div>
            <p className={`text-sm font-medium ${
              selectedStatus === 'pending' ? 'text-yellow-800' : 'text-gray-600'
            }`}>Kutilmoqda</p>
            <div className={`mt-2 h-1 rounded-full overflow-hidden ${
              selectedStatus === 'pending' ? 'bg-yellow-500/20' : 'bg-gray-100'
            }`}>
              <div className={`h-full rounded-full ${
                selectedStatus === 'pending' ? 'bg-yellow-600' : 'bg-yellow-500'
              }`} style={{ width: `${(stats.pending / (stats.total || 1)) * 100}%` }}></div>
            </div>
          </button>

          <button
            onClick={() => setSelectedStatus('contacted')}
            className={`group text-left p-5 rounded-3xl transition-all duration-300 backdrop-blur-sm border ${
              selectedStatus === 'contacted'
                ? 'bg-blue-500/20 border-blue-500/30 shadow-lg shadow-blue-500/10 scale-[1.02]'
                : 'bg-white/80 border-gray-200/50 hover:shadow-md hover:scale-[1.01] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-3xl flex items-center justify-center transition-all ${
                selectedStatus === 'contacted'
                  ? 'bg-blue-500/30 backdrop-blur-sm'
                  : 'bg-blue-50 group-hover:scale-110'
              }`}>
                <Phone className={`w-6 h-6 ${
                  selectedStatus === 'contacted' ? 'text-blue-700' : 'text-blue-600'
                }`} />
              </div>
              <span className={`text-3xl font-bold ${
                selectedStatus === 'contacted' ? 'text-blue-700' : 'text-blue-600'
              }`}>{stats.contacted}</span>
            </div>
            <p className={`text-sm font-medium ${
              selectedStatus === 'contacted' ? 'text-blue-800' : 'text-gray-600'
            }`}>Bog'lanildi</p>
            <div className={`mt-2 h-1 rounded-full overflow-hidden ${
              selectedStatus === 'contacted' ? 'bg-blue-500/20' : 'bg-gray-100'
            }`}>
              <div className={`h-full rounded-full ${
                selectedStatus === 'contacted' ? 'bg-blue-600' : 'bg-blue-500'
              }`} style={{ width: `${(stats.contacted / (stats.total || 1)) * 100}%` }}></div>
            </div>
          </button>

          <button
            onClick={() => setSelectedStatus('accepted')}
            className={`group text-left p-5 rounded-3xl transition-all duration-300 backdrop-blur-sm border ${
              selectedStatus === 'accepted'
                ? 'bg-green-500/20 border-green-500/30 shadow-lg shadow-green-500/10 scale-[1.02]'
                : 'bg-white/80 border-gray-200/50 hover:shadow-md hover:scale-[1.01] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-3xl flex items-center justify-center transition-all ${
                selectedStatus === 'accepted'
                  ? 'bg-green-500/30 backdrop-blur-sm'
                  : 'bg-green-50 group-hover:scale-110'
              }`}>
                <CheckCircle className={`w-6 h-6 ${
                  selectedStatus === 'accepted' ? 'text-green-700' : 'text-green-600'
                }`} />
              </div>
              <span className={`text-3xl font-bold ${
                selectedStatus === 'accepted' ? 'text-green-700' : 'text-green-600'
              }`}>{stats.accepted}</span>
            </div>
            <p className={`text-sm font-medium ${
              selectedStatus === 'accepted' ? 'text-green-800' : 'text-gray-600'
            }`}>Qabul qilindi</p>
            <div className={`mt-2 h-1 rounded-full overflow-hidden ${
              selectedStatus === 'accepted' ? 'bg-green-500/20' : 'bg-gray-100'
            }`}>
              <div className={`h-full rounded-full ${
                selectedStatus === 'accepted' ? 'bg-green-600' : 'bg-green-500'
              }`} style={{ width: `${(stats.accepted / (stats.total || 1)) * 100}%` }}></div>
            </div>
          </button>

          <button
            onClick={() => setSelectedStatus('rejected')}
            className={`group text-left p-5 rounded-3xl transition-all duration-300 backdrop-blur-sm border ${
              selectedStatus === 'rejected'
                ? 'bg-red-500/20 border-red-500/30 shadow-lg shadow-red-500/10 scale-[1.02]'
                : 'bg-white/80 border-gray-200/50 hover:shadow-md hover:scale-[1.01] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-3xl flex items-center justify-center transition-all ${
                selectedStatus === 'rejected'
                  ? 'bg-red-500/30 backdrop-blur-sm'
                  : 'bg-red-50 group-hover:scale-110'
              }`}>
                <XCircle className={`w-6 h-6 ${
                  selectedStatus === 'rejected' ? 'text-red-700' : 'text-red-600'
                }`} />
              </div>
              <span className={`text-3xl font-bold ${
                selectedStatus === 'rejected' ? 'text-red-700' : 'text-red-600'
              }`}>{stats.rejected}</span>
            </div>
            <p className={`text-sm font-medium ${
              selectedStatus === 'rejected' ? 'text-red-800' : 'text-gray-600'
            }`}>Rad etildi</p>
            <div className={`mt-2 h-1 rounded-full overflow-hidden ${
              selectedStatus === 'rejected' ? 'bg-red-500/20' : 'bg-gray-100'
            }`}>
              <div className={`h-full rounded-full ${
                selectedStatus === 'rejected' ? 'bg-red-600' : 'bg-red-500'
              }`} style={{ width: `${(stats.rejected / (stats.total || 1)) * 100}%` }}></div>
            </div>
          </button>
        </div>
      )}

      {/* Applications List - Glassmorphism */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                  O'quvchi
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Telefon
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Sinf
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Sana
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 backdrop-blur-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-500 font-medium">Yuklanmoqda...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50/80 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Arizalar topilmadi</h3>
                      <p className="text-gray-500">
                        {searchQuery ? 'Qidiruv bo\'yicha natija yo\'q' : 'Hozircha arizalar mavjud emas'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((application: Application) => (
                  <tr key={application._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-3xl flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {application.fullName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {application.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                        {application.grade}-sinf
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(application.status)}
                        {getStatusBadge(application.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(application.createdAt).toLocaleDateString('uz-UZ', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModal(application)}
                          className="hover:bg-blue-50 hover:text-blue-600 rounded-2xl"
                          title="Ko'rish va tahrirlash"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(application._id)}
                          className="hover:bg-red-50 hover:text-red-600 rounded-2xl"
                          title="O'chirish"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && selectedApplication && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Arizani tahrirlash"
          size="md"
        >
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  O'quvchi
                </label>
                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                  <User className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900">{selectedApplication.fullName}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-900">{selectedApplication.phone}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sinf
              </label>
              <div className="flex items-center p-3 bg-gray-50 rounded-2xl">
                <GraduationCap className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-900">{selectedApplication.grade}-sinf</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="pending">Kutilmoqda</option>
                <option value="contacted">Bog'lanildi</option>
                <option value="accepted">Qabul qilindi</option>
                <option value="rejected">Rad etildi</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Izohlar
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Izoh qoldiring..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Bekor qilish
              </Button>
              <Button
                onClick={handleUpdate}
                loading={updateMutation.isPending}
              >
                Saqlash
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
