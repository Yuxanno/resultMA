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

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
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

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Qabul arizalari</h1>
              <p className="text-sm text-gray-500">Landing sahifasidan kelgan arizalar</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-40"
            >
              <option value="all">Barchasi</option>
              <option value="pending">Kutilmoqda</option>
              <option value="contacted">Bog'lanildi</option>
              <option value="accepted">Qabul qilindi</option>
              <option value="rejected">Rad etildi</option>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="p-2"
              title="Yangilash"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kutilmoqda</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bog'lanildi</p>
                <p className="text-2xl font-bold text-blue-600">{stats.contacted}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Qabul qilindi</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rad etildi</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Applications List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  O'quvchi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sinf
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sana
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : applicationsData?.applications?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Arizalar topilmadi
                  </td>
                </tr>
              ) : (
                applicationsData?.applications
                  ?.filter((app: Application) => {
                    if (!searchQuery) return true;
                    const query = searchQuery.toLowerCase();
                    return (
                      app.fullName.toLowerCase().includes(query) ||
                      app.phone.includes(query) ||
                      app.grade.includes(query)
                    );
                  })
                  ?.map((application: Application) => (
                  <tr key={application._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
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
                      <div className="flex items-center text-sm text-gray-900">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal(application)}
                          className="p-2"
                          title="Ko'rish"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(application._id)}
                          className="text-red-600 hover:text-red-700 p-2"
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
      </Card>

      {/* Edit Modal */}
      {showModal && selectedApplication && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Arizani tahrirlash"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                O'quvchi
              </label>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium">{selectedApplication.fullName}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm">{selectedApplication.phone}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sinf
              </label>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <GraduationCap className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm">{selectedApplication.grade}-sinf</span>
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

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Bekor qilish
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
