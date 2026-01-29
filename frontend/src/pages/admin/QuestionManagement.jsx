import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Edit2
} from "lucide-react";
import api from "../../Api/axiosInstance";
import CreateQuestion from "./CreateQuestion";
import EditQuestion from "./EditQuestion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function QuestionManagement() {
  const [positions, setPositions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState("");
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  // Fetch positions on component mount
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const res = await api.get("/position");
        setPositions(res.data.data);
      } catch (err) {
        console.error("Failed to load positions", err);
        toast.error("Failed to load positions");
      }
    };
    fetchPositions();
  }, []);

  // Fetch questions when position changes
  useEffect(() => {
    if (selectedPosition) {
      fetchQuestionsByPosition(selectedPosition);
    } else {
      setQuestions([]);
      setFilteredQuestions([]);
    }
  }, [selectedPosition]);

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

  const fetchQuestionsByPosition = async (positionId) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/question/position/${positionId}`);
      setQuestions(res.data);
      setFilteredQuestions(res.data);
    } catch (err) {
      console.error("Failed to load questions", err);
      toast.error("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
      try {
        await api.delete(`/question/${questionId}`);
        toast.success("Question deleted successfully");
        if (selectedPosition) {
          fetchQuestionsByPosition(selectedPosition);
        }
      } catch (err) {
        console.error("Failed to delete question", err);
        toast.error("Failed to delete question");
      }
    }
  };

  const handleEditQuestion = (question) => {
    setSelectedQuestion(question);
    setShowEditDialog(true);
  };

  const handleViewQuestion = (question) => {
    setSelectedQuestion(question);
    setShowViewDialog(true);
  };

  const handleQuestionCreated = () => {
    setShowCreateDialog(false);
    if (selectedPosition) {
      fetchQuestionsByPosition(selectedPosition);
    }
  };

  const handleQuestionUpdated = () => {
    setShowEditDialog(false);
    if (selectedPosition) {
      fetchQuestionsByPosition(selectedPosition);
    }
  };

  const getCorrectOption = (options) => {
    return options.find(opt => opt.isCorrect);
  };

  const renderQuestionCard = (question) => (
    <Card key={question._id} className="group border border-gray-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-900">
      <CardContent className="p-6">
        {/* Header with badges and actions */}
        {/* <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                {question.position?.name || "No Position"}
              </Badge>
              {question.questionImage && (
                <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                  <ImageIcon className="w-3 h-3 mr-1" />
                  Has Image
                </Badge>
              )}
              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 dark:bg-slate-800 dark:text-gray-400 dark:border-slate-700">
                {question.options?.length || 0} options
              </Badge>
            </div>
          </div>
          <div className="flex gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewQuestion(question)}
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 dark:text-gray-300 dark:hover:bg-slate-800"
              title="View Question"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditQuestion(question)}
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 dark:text-gray-300 dark:hover:bg-slate-800"
              title="Edit Question"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteQuestion(question._id)}
              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              title="Delete Question"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div> */}

        {/* Question Content */}
        <div className="mb-4">
          {question.questionImage ? (
            <div className="mb-3">
              <img
                src={question.questionImage}
                alt="Question"
                className="w-full h-40 object-contain rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="w-full h-40 bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm" style={{ display: 'none' }}>
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                  <p>Image not available</p>
                </div>
              </div>
            </div>
          ) : null}

         <h1 className="text-base font-semibold text-gray-900 dark:text-white mb-3 leading-relaxed border border-slate-300 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-gray-900 shadow-sm">
                   {question.questionText || "No question text provided"}
            </h1>

        </div>

        {/* Options */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Answer Options:</h4>
          <div className="space-y-2">
            {question.options?.slice(0, 3).map((option, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${option.isCorrect
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : 'bg-gray-50 border-gray-200 dark:bg-slate-800 dark:border-slate-700'
                  }`}
              >
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${option.isCorrect ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'
                  }`}></div>
                <span className="flex-1 text-gray-800 dark:text-gray-200">
                  {option.optionText || "No option text"}
                </span>
                {option.isCorrect && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex-shrink-0">
                    Correct
                  </Badge>
                )}
              </div>
            ))}
            {question.options?.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                +{question.options.length - 3} more options
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Question Management</h1>
          <p className="text-slate-600">Organize and manage questions by position for your interviews</p>
        </div>

        {/* Select Position & Search */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-3">
              Select Position
            </Label>
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="h-11 border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Choose a position to view questions" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                {positions.map((pos) => (
                  <SelectItem key={pos._id} value={pos._id} className="dark:text-gray-200 dark:focus:bg-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {pos.name}
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
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Question</TableHead>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Position</TableHead>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Difficulty</TableHead>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Options</TableHead>
                  <TableHead className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow key={question._id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                    <TableCell className="px-6 py-4 text-slate-900">{question.questionText}</TableCell>
                    <TableCell className="px-6 py-4 text-slate-600">{question.position?.name}</TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge variant="outline" className={`text-xs ${getDifficultyBadgeClass(question.difficulty)}`}>
                        {question.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-slate-600">{question.options?.length} Options</TableCell>
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
          </div>
        </div>

        {/* Add Question Button */}
        <div className="mt-8 flex justify-end">
          <Button onClick={() => setShowCreateDialog(true)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2">
            + Add Question
          </Button>
        </div>
      </div>

      {/* View Question Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold dark:text-white">Question Details</DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-6">
              {/* Position Badge */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Position:</Label>
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

      {/* Edit Question Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Edit Question</DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <EditQuestion
              question={selectedQuestion}
              onQuestionUpdated={handleQuestionUpdated}
            />
          )}
        </DialogContent>
      </Dialog>

      <Toaster />
    </>
  );
}

function getDifficultyBadgeClass(difficulty) {
  switch (difficulty) {
    case 'Easy':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Hard':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}
