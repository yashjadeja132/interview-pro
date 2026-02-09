import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { AlertCircle, X, Plus, Trash2 } from "lucide-react";
import api from "../../Api/axiosInstance";

export default function EditQuestion({ question, onQuestionUpdated }) {
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    positionId: question?.position?._id || "",
    questionText: question?.questionText || "",
    questionImage: null,
    options: question?.options || [
      { optionText: "", optionImage: null, isCorrect: false },
      { optionText: "", optionImage: null, isCorrect: false },
      { optionText: "", optionImage: null, isCorrect: false },
      { optionText: "", optionImage: null, isCorrect: false },
    ],
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [questionImagePreview, setQuestionImagePreview] = useState(question?.questionImage || null);
  const [optionImagePreviews, setOptionImagePreviews] = useState({});

  // Refs for file inputs
  const questionImageRef = useRef(null);
  const optionImageRefs = useRef([]);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const res = await api.get("/position");
        setPositions(res.data.data);
      } catch (err) {
        console.error("Failed to load positions", err);
      }
    };
    fetchPositions();

    // Initialize option image previews
    if (question?.options) {
      const previews = {};
      question.options.forEach((option, index) => {
        if (option.optionImage) {
          previews[index] = option.optionImage;
        }
      });
      setOptionImagePreviews(previews);
    }
  }, [question]);

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;
    if (index !== null) {
      const newOptions = [...form.options];
      newOptions[index] = { ...newOptions[index], optionText: value };
      setForm((prev) => ({ ...prev, options: newOptions }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...form.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setForm((prev) => ({ ...prev, options: newOptions }));
  };

  const handleQuestionImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, questionImage: file }));
      setQuestionImagePreview(URL.createObjectURL(file));
    }
  };

  const handleOptionImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newOptions = [...form.options];
      newOptions[index] = { ...newOptions[index], optionImage: file };
      setForm((prev) => ({ ...prev, options: newOptions }));

      setOptionImagePreviews(prev => ({
        ...prev,
        [index]: URL.createObjectURL(file)
      }));
    }
  };

  const removeQuestionImage = () => {
    setForm((prev) => ({ ...prev, questionImage: null }));
    setQuestionImagePreview(null);
    if (questionImageRef.current) {
      questionImageRef.current.value = "";
    }
  };

  const removeOptionImage = (index) => {
    const newOptions = [...form.options];
    newOptions[index] = { ...newOptions[index], optionImage: null };
    setForm((prev) => ({ ...prev, options: newOptions }));

    setOptionImagePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[index];
      return newPreviews;
    });

    if (optionImageRefs.current[index]) {
      optionImageRefs.current[index].value = "";
    }
  };

  const addOption = () => {
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, { optionText: "", optionImage: null, isCorrect: false }]
    }));
  };

  const removeOption = (index) => {
    if (form.options.length > 2) {
      const newOptions = form.options.filter((_, i) => i !== index);
      setForm((prev) => ({ ...prev, options: newOptions }));

      setOptionImagePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[index];
        // Shift remaining previews
        const shiftedPreviews = {};
        Object.keys(newPreviews).forEach(key => {
          const keyIndex = parseInt(key);
          if (keyIndex > index) {
            shiftedPreviews[keyIndex - 1] = newPreviews[key];
          } else if (keyIndex < index) {
            shiftedPreviews[keyIndex] = newPreviews[key];
          }
        });
        return shiftedPreviews;
      });
    }
  };

  const validateForm = () => {
    let errors = {};
    if (!form.positionId) errors.positionId = "Position is required";
    if (!form.questionText && !form.questionImage && !questionImagePreview) {
      errors.question = "Question text or image is required";
    }

    form.options.forEach((opt, idx) => {
      if (!opt.optionText && !opt.optionImage && !optionImagePreviews[idx]) {
        errors[`option${idx}`] = `Option ${idx + 1} is required`;
      }
    });

    if (!form.options.some((o) => o.isCorrect)) {
      errors.correct = "You must select a correct answer";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateField = (name, value) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      if (value && newErrors[name]) {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  const hasChanges = () => {
    if (!question) return false;

    // Check Position
    if (form.positionId !== (question.position?._id || "")) return true;

    // Check Question Text
    if (form.questionText !== (question.questionText || "")) return true;

    // Check Question Image
    // If a new file is selected, it's a change
    if (form.questionImage instanceof File) return true;
    // If original had an image but preview is gone (removed), it's a change
    // Note: form.questionImage is strictly for NEW file. Removal is tracked via preview state in this implementation or explicitly nulling it.
    // However, removeQuestionImage sets form.questionImage = null. Original question.questionImage is string.
    // Wait, form.questionImage is null initially.
    // If I remove image, form.questionImage is null. Original is string.
    // If I don't touch it, form.questionImage is null. Original is string.
    // So for removal, we need to check if original existed AND preview is gone.
    if (question.questionImage && !questionImagePreview) return true;


    // Check Options
    if (form.options.length !== (question.options?.length || 0)) return true;

    for (let i = 0; i < form.options.length; i++) {
      const current = form.options[i];
      const original = question.options[i];

      // New option added
      if (!original) return true;

      if (current.optionText !== original.optionText) return true;
      if (current.isCorrect !== original.isCorrect) return true;

      // Option Image
      // If current is File -> Changed
      if (current.optionImage instanceof File) return true;

      // If original existed but current is null (removed)
      // Original optionImage is URL string. Current starts as URL string (from init).
      // If removed, current becomes null.
      // If unchanged, current === original (string === string)
      if (current.optionImage !== original.optionImage) return true;
    }

    return false;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("positionId", form.positionId);
      formData.append("questionText", form.questionText);

      // Question image
      if (form.questionImage) {
        formData.append("questionImage", form.questionImage);
      }



      // Send options array as JSON string
      // We need to be careful with sending existing URLs vs nulls vs File objects
      // The backend likely expects file uploads in 'optionImages' array and maps them based on index or something?
      // Or maybe it just updates text/bools and handles images separately if new?
      // Re-reading submit logic: 
      // formData.append("optionImages", opt.optionImage); if it exists.
      // If it is a string (existing URL), it appends string? Multer might ignore strings or treat as text field. 
      // Usually backend needs to know if image is REMOVED.
      // Current implementation:
      /*
        // Option images
        form.options.forEach((opt) => {
            if (opt.optionImage) {
            formData.append("optionImages", opt.optionImage);
            }
        });
      */
      // If opt.optionImage is a URL string, it appends it.
      // If it is null, it skips.
      // If it is File, it appends.

      // Let's stick to existing logic for submission to avoid breaking backend, 
      // but wrap it to ensure we don't send strings as files if that was the intent.
      // However, the original code blindly appended `opt.optionImage` if truthy.
      // If it was a URL string, it appended it.
      // If it was a File, it appended it.

      form.options.forEach((opt) => {
        if (opt.optionImage) {
          formData.append("optionImages", opt.optionImage);
        }
      });

      formData.append("options", JSON.stringify(form.options));

      // Send request
      const res = await api.put(`/question/${question._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200) {
        toast.success("Question updated successfully");
        onQuestionUpdated();
      } else {
        toast.warning("Something went wrong");
      }
    } catch (err) {
      console.error("Failed to update question:", err);
      toast.error("Failed to update question");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <CardContent className="space-y-6">
          {/* Position Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Position</Label>
            <Select
              value={form.positionId || ""}
              onValueChange={(value) => {
                setForm((prev) => ({ ...prev, positionId: value }));
                validateField("positionId", value);
              }}
            >
              <SelectTrigger className={fieldErrors.positionId ? "border-red-500" : ""}>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos._id} value={pos._id}>
                    {pos.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.positionId && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.positionId}
              </p>
            )}
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Question Text</Label>
            <Input
              name="questionText"
              value={form.questionText}
              onChange={(e) => {
                handleChange(e);
                validateField("question", e.target.value);
              }}
              placeholder="Enter your question here..."
              className={fieldErrors.question ? "border-red-500" : ""}
            />
            {fieldErrors.question && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.question}
              </p>
            )}
          </div>

          {/* Question Image */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Question Image (Optional)</Label>
            <Input
              type="file"
              accept="image/*"
              ref={questionImageRef}
              onChange={handleQuestionImageChange}
            />
            {questionImagePreview && (
              <div className="relative inline-block">
                <img
                  src={questionImagePreview}
                  alt="preview"
                  className="w-48 h-32 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={removeQuestionImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Answer Options</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Option
              </Button>
            </div>

            {form.options.map((option, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Option {index + 1}</Label>
                      {form.options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <Input
                      value={option.optionText}
                      onChange={(e) => handleOptionChange(index, "optionText", e.target.value)}
                      placeholder={`Enter option ${index + 1} text...`}
                      className={fieldErrors[`option${index}`] ? "border-red-500" : ""}
                    />

                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Option Image (Optional)</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        ref={(el) => (optionImageRefs.current[index] = el)}
                        onChange={(e) => handleOptionImageChange(e, index)}
                      />
                      {optionImagePreviews[index] && (
                        <div className="relative inline-block">
                          <img
                            src={optionImagePreviews[index]}
                            alt={`option ${index + 1} preview`}
                            className="w-32 h-24 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeOptionImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <RadioGroup
                      value={option.isCorrect ? "true" : "false"}
                      onValueChange={(value) => handleOptionChange(index, "isCorrect", value === "true")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id={`correct-${index}`} />
                        <Label htmlFor={`correct-${index}`} className="text-sm">
                          This is the correct answer
                        </Label>
                      </div>
                    </RadioGroup>

                    {fieldErrors[`option${index}`] && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {fieldErrors[`option${index}`]}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {fieldErrors.correct && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.correct}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onQuestionUpdated()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !hasChanges()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Updating..." : "Update Question"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  );
}
