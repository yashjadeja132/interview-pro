import React, { useState } from 'react';
import { Save, FileText, Repeat, CheckCircle, AlertOctagon } from 'lucide-react';

export default function InterviewRules({ settings, onUpdate, loading }) {
    const [formData, setFormData] = useState({
        allowResumeUpload: settings.allowResumeUpload || false,
        allowReattempt: settings.allowReattempt || false,
        autoSubmitOnTimeEnd: settings.autoSubmitOnTimeEnd !== undefined ? settings.autoSubmitOnTimeEnd : true,
        negativeMarking: settings.negativeMarking || false,
    });

    const handleChange = (e) => {
        const { name, checked } = e.target;
        setFormData({
            ...formData,
            [name]: checked,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate({ section: 'interviewRules', data: formData });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Allow Resume Upload</p>
                            <p className="text-sm text-gray-500">Candidates must upload resume before starting</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="allowResumeUpload"
                            checked={formData.allowResumeUpload}
                            onChange={handleChange}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                            <Repeat size={24} />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Allow Reattempt</p>
                            <p className="text-sm text-gray-500">Allow candidates to retake the test if failed</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="allowReattempt"
                            checked={formData.allowReattempt}
                            onChange={handleChange}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Auto Submit on Time End</p>
                            <p className="text-sm text-gray-500">Automatically submit test when timer reaches zero</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="autoSubmitOnTimeEnd"
                            checked={formData.autoSubmitOnTimeEnd}
                            onChange={handleChange}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                            <AlertOctagon size={24} />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Negative Marking</p>
                            <p className="text-sm text-gray-500">Deduct points for incorrect answers</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="negativeMarking"
                            checked={formData.negativeMarking}
                            onChange={handleChange}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}
