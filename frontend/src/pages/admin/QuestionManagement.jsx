import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Image as ImageIcon,
  FileText,
  Filter,
  CheckCircle,
  XCircle,
  Edit2,
  AlertTriangle
} from "lucide-react";
import api from "../../Api/axiosInstance";
import QuestionModal from "./components/QuestionModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function QuestionManagement() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch positions on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/subject");
        setSubjects(res.data.data);
      } catch (err) {
        console.error("Failed to load positions", err);
        toast.error("Failed to load positions");
      }
    };
    fetchSubjects();
  }, []);

  // Fetch questions when position changes
  useEffect(() => {
    if (selectedSubject) {
      fetchQuestionsBySubject(selectedSubject);
    } else {
      setQuestions([]);
      setFilteredQuestions([]);
    }
  }, [selectedSubject]);

  // Filter questions based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredQuestions(questions);
    } else {
      const filtered = questions.filter(q =>
        q.questionText?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredQuestions(filtered);
    }
  }, [searchTerm, questions]);

  const fetchQuestionsBySubject = async (subjectId) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/question/subject/${subjectId}`);
      console.log(res.data);
      setQuestions(res.data);
      setFilteredQuestions(res.data);
    } catch (err) {
      console.error("Failed to load questions", err);
      toast.error("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = (questionId) => {
    setDeleteId(questionId);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/question/${deleteId}`);
      toast.success("Question deleted successfully");
      setDeleteId(null);
      if (selectedSubject) {
        fetchQuestionsBySubject(selectedSubject);
      }
    } catch (err) {
      console.error("Failed to delete question", err);
      toast.error("Failed to delete question");
    }
  };

  const handleEditQuestion = (question) => {
    setSelectedQuestion(question);
    setShowQuestionModal(true);
  };

  const handleViewQuestion = (question) => {
    setSelectedQuestion(question);
    setShowViewDialog(true);
  };

  const handleQuestionSuccess = () => {
    setShowQuestionModal(false);
    setSelectedQuestion(null);
    if (selectedSubject) {
      fetchQuestionsBySubject(selectedSubject);
    }
  };


  return (
    <>
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Question Management</h1>
          <div className="flex justify-between gap-5">
            <p className="text-slate-600 dark:text-slate-400">Organize and manage questions by subject for your interviews</p>
            <Button
              onClick={() => {
                setSelectedQuestion(null);
                setShowQuestionModal(true);
              }}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2"
            >
              + Add Question
            </Button>
          </div>
        </div>

        {/* Select Position & Search */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-3">
              Select Subject
            </Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="h-11 border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Choose a subject to view questions" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                {subjects.map((subject) => (
                  <SelectItem key={subject._id} value={subject._id} className="dark:text-gray-200 dark:focus:bg-slate-700">
                    <div className="flex items-center gap-2">
                      {subject.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-3">
              Search Questions
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <Input
                placeholder="Search questions by text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-10 text-center text-slate-500 dark:text-slate-400">
                Loading questions...
              </div>
            ) : filteredQuestions.length > 0 ? (
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <TableRow>
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">#</TableHead>
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Question</TableHead>
                    <TableHead className="px-6 py-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredQuestions.map((question, index) => (
                    <TableRow
                      key={question._id}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <TableCell className="px-6 py-4 text-slate-900 dark:text-slate-100">{index + 1}</TableCell>
                      <TableCell className="px-6 py-4 text-slate-900 dark:text-slate-100">{question.questionText}</TableCell>
                      <TableCell className="px-6 py-4 flex justify-center gap-2">
                        <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50" onClick={() => handleViewQuestion(question)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-amber-600 hover:bg-amber-50" onClick={() => handleEditQuestion(question)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteQuestion(question._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center text-slate-600 dark:text-slate-400">
                {selectedSubject
                  ? "No questions found for this subject."
                  : "Please select a subject to view questions."}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Question Modal (Add/Edit) */}
      <QuestionModal
        isOpen={showQuestionModal}
        onClose={() => {
          setShowQuestionModal(false);
          setSelectedQuestion(null);
        }}
        initialData={selectedQuestion}
        defaultSubjectId={selectedSubject}
        subjects={subjects}
        onSuccess={handleQuestionSuccess}
      />

      {/* View Question Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold dark:text-white">Question Details</DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-6">
              {/* Subject Badge */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Subject:</Label>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                  {selectedQuestion.position?.name}
                </Badge>
              </div>

              {/* Question Content */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Question:</Label>
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                  {selectedQuestion.questionImage && (
                    <div className="mb-4">
                      <img
                        src={selectedQuestion.questionImage}
                        alt="Question"
                        className="w-full max-h-64 object-contain rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="w-full h-32 bg-gray-100 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm" style={{ display: 'none' }}>
                        <div className="text-center">
                          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                          <p>Image not available</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-gray-900 dark:text-white leading-relaxed">
                    {selectedQuestion.questionText || "No question text provided"}
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Answer Options:</Label>
                <div className="space-y-3">
                  {selectedQuestion.options?.map((option, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${option.isCorrect
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                        : 'bg-gray-50 border-gray-200 dark:bg-slate-800 dark:border-slate-700'
                        }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {option.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        )}
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          Option {index + 1}
                        </span>
                        {option.isCorrect && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            Correct Answer
                          </Badge>
                        )}
                      </div>
                      <div className="ml-8">
                        {option.optionImage ? (
                          <div className="space-y-2">
                            <img
                              src={option.optionImage}
                              alt={`Option ${index + 1}`}
                              className="max-w-full h-auto rounded border border-gray-200 dark:border-slate-600"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div className="w-full h-24 bg-gray-100 dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm" style={{ display: 'none' }}>
                              <div className="text-center">
                                <ImageIcon className="w-6 h-6 mx-auto mb-1 text-gray-400 dark:text-gray-500" />
                                <p className="text-xs">Image not available</p>
                              </div>
                            </div>
                            {option.optionText && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{option.optionText}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {option.optionText || "No option text provided"}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle className="text-xl font-semibold dark:text-white">Confirm Delete</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4 mt-4 text-slate-600 dark:text-slate-300">
            <p>Are you sure you want to delete this question? This action cannot be undone.</p>
          </div>
          <DialogFooter className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="dark:bg-slate-800 dark:text-white dark:border-slate-700">Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete Question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </>
  );
}

