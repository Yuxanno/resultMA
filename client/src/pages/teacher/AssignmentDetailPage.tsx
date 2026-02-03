import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/hooks/useToast';
import MathText from '@/components/MathText';
import { 
  ArrowLeft, 
  ClipboardList,
  Calendar,
  Users,
  FileText,
  Save,
  CheckCircle2,
  TrendingUp,
  Award,
  BookOpen,
  Edit2
} from 'lucide-react';

const assignmentTypeLabels: Record<string, string> = {
  yozma_ish: 'Yozma ish',
  diktant: 'Diktant',
  ogzaki: 'Og\'zaki',
  savol_javob: 'Savol-javob',
  yopiq_test: 'Yopiq test'
};

const assignmentTypeColors: Record<string, { bg: string, text: string, border: string }> = {
  yozma_ish: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  diktant: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  ogzaki: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  savol_javob: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  yopiq_test: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
};

export default function AssignmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [grades, setGrades] = useState<Record<string, { percentage: number; notes: string }>>({});

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/assignments/${id}`);
      setAssignment(data.assignment);
      setSubmissions(data.submissions);
      
      const initialGrades: Record<string, { percentage: number; notes: string }> = {};
      data.submissions.forEach((sub: any) => {
        initialGrades[sub._id] = {
          percentage: sub.percentage || 0,
          notes: sub.notes || ''
        };
      });
      setGrades(initialGrades);
    } catch (err) {
      console.error('Error fetching assignment:', err);
      error('Topshiriqni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (submissionId: string, field: 'percentage' | 'notes', value: string | number) => {
    setGrades(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value
      }
    }));
  };

  const handleSaveGrade = async (submissionId: string) => {
    const grade = grades[submissionId];
    
    if (grade.percentage < 0 || grade.percentage > 100) {
      error('Foiz 0 dan 100 gacha bo\'lishi kerak');
      return;
    }

    try {
      await api.post(`/assignments/${id}/grade/${submissionId}`, {
        percentage: grade.percentage,
        notes: grade.notes
      });
      success('Baho saqlandi!');
      fetchAssignment();
    } catch (err: any) {
      console.error('Error saving grade:', err);
      error(err.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="animate-pulse">
          <div className="h-12 w-64 bg-slate-200 rounded-2xl mb-3"></div>
          <div className="h-6 w-96 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <Card className="border-2 border-slate-200/50">
        <CardContent className="py-16 text-center">
          <ClipboardList className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl font-bold text-slate-900">Topshiriq topilmadi</p>
        </CardContent>
      </Card>
    );
  }

  const gradedCount = submissions.filter(s => s.percentage !== undefined && s.percentage !== null).length;
  const averagePercentage = gradedCount > 0
    ? submissions.reduce((sum, s) => sum + (s.percentage || 0), 0) / gradedCount
    : 0;

  const typeColor = assignmentTypeColors[assignment.type] || assignmentTypeColors.yozma_ish;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/teacher/assignments')}
            className="border-2 hover:border-orange-500"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Orqaga
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate(`/teacher/assignments/edit/${id}`)}
            className="border-2 hover:border-blue-500 hover:text-blue-600"
          >
            <Edit2 className="w-5 h-5 mr-2" />
            Tahrirlash
          </Button>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 text-white shadow-2xl shadow-orange-500/30">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 animate-float">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-3">{assignment.title}</h1>
              <div className="flex flex-wrap gap-3">
                <div className={`px-4 py-2 ${typeColor.bg} ${typeColor.text} rounded-xl font-semibold`}>
                  {assignmentTypeLabels[assignment.type]}
                </div>
                {assignment.groupId && (
                  <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">{assignment.groupId.name}</span>
                  </div>
                )}
                {assignment.dueDate && (
                  <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-semibold">
                      {new Date(assignment.dueDate).toLocaleDateString('uz-UZ', {
                        day: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-slate-200/50 hover:border-blue-300 transition-all hover:shadow-xl hover:shadow-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-semibold uppercase">Jami o'quvchilar</p>
                <p className="text-4xl font-bold text-slate-900">{submissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-200/50 hover:border-green-300 transition-all hover:shadow-xl hover:shadow-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-semibold uppercase">Baholangan</p>
                <p className="text-4xl font-bold text-green-600">{gradedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-200/50 hover:border-purple-300 transition-all hover:shadow-xl hover:shadow-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-semibold uppercase">O'rtacha ball</p>
                <p className="text-4xl font-bold text-purple-600">{averagePercentage.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Details */}
      {(assignment.description || assignment.fileUrl || (assignment.questions && assignment.questions.length > 0)) && (
        <Card className="border-2 border-slate-200/50">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-orange-600" />
              Topshiriq tafsilotlari
            </h2>

            {assignment.description && (
              <div className="mb-6 p-6 bg-slate-50 rounded-2xl">
                <p className="text-sm text-slate-600 font-semibold uppercase mb-2">Tavsif</p>
                <p className="text-slate-900 text-lg">{assignment.description}</p>
              </div>
            )}

            {assignment.fileUrl && (
              <div className="mb-6">
                <a 
                  href={assignment.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-semibold">Faylni ko'rish</span>
                </a>
              </div>
            )}

            {assignment.questions && assignment.questions.length > 0 && (
              <div>
                <p className="text-sm text-slate-600 font-semibold uppercase mb-4">
                  Savollar ({assignment.questions.length})
                </p>
                <div className="space-y-4">
                  {assignment.questions.map((q: any, idx: number) => (
                    <div key={idx} className="border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-orange-300 transition-colors">
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 border-b-2 border-slate-200">
                        <p className="font-bold text-slate-900 text-lg">
                          {idx + 1}. <MathText text={q.text} />
                        </p>
                      </div>
                      {q.variants && q.variants.length > 0 && (
                        <div className="p-4 space-y-2">
                          {q.variants.map((v: any, vIdx: number) => {
                            const isCorrect = v.letter === q.correctAnswer;
                            return (
                              <div 
                                key={vIdx} 
                                className={`p-4 rounded-xl border-2 transition-all ${
                                  isCorrect 
                                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' 
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${
                                    isCorrect ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-700'
                                  }`}>
                                    {v.letter}
                                  </div>
                                  <span className={`flex-1 ${isCorrect ? 'text-green-900 font-semibold' : 'text-slate-700'}`}>
                                    <MathText text={v.text} />
                                  </span>
                                  {isCorrect && (
                                    <div className="flex items-center gap-1 text-green-600 font-bold">
                                      <span className="text-xl">✓</span>
                                      <span className="text-sm">To'g'ri</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Students List */}
      <Card className="border-2 border-slate-200/50">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Award className="w-6 h-6 text-orange-600" />
            O'quvchilar ro'yxati
          </h2>
          
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">O'quvchilar yo'q</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission, index) => (
                <div 
                  key={submission._id}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="border-2 border-slate-200 rounded-2xl p-6 hover:border-orange-300 transition-all animate-slide-in"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Student Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-lg">
                            {submission.studentId?.firstName} {submission.studentId?.lastName}
                          </p>
                          {submission.gradedAt && (
                            <p className="text-xs text-slate-500">
                              Baholangan: {new Date(submission.gradedAt).toLocaleDateString('uz-UZ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Grading Section */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="flex-1 min-w-[120px]">
                        <label className="text-xs text-slate-600 font-semibold uppercase mb-1 block">Ball (0-100%)</label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={grades[submission._id]?.percentage || 0}
                          onChange={(e) => handleGradeChange(submission._id, 'percentage', parseInt(e.target.value) || 0)}
                          className="text-center text-lg font-bold border-2"
                        />
                      </div>

                      <div className="flex-1 min-w-[200px]">
                        <label className="text-xs text-slate-600 font-semibold uppercase mb-1 block">Izoh</label>
                        <Input
                          type="text"
                          value={grades[submission._id]?.notes || ''}
                          onChange={(e) => handleGradeChange(submission._id, 'notes', e.target.value)}
                          placeholder="Izoh yozing..."
                          className="border-2"
                        />
                      </div>

                      <div className="self-end">
                        <Button
                          onClick={() => handleSaveGrade(submission._id)}
                          className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Saqlash
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
