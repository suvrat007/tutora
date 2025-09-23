import React, { useState } from 'react';
import GeminiFile from './GeminiFile';

const QuestionPaperMaker = () => {
    // State variables for form inputs
    const [grade, setGrade] = useState('');
    const [board, setBoard] = useState('');
    const [subject, setSubject] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [marks, setMarks] = useState('');
    const [duration, setDuration] = useState('');
    const [customizations, setCustomizations] = useState('');

    // State for UI and application flow
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [viewMode, setViewMode] = useState('questions');

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setShowResults(false);
        setMessage('Generating your question paper. This may take a moment...');
        setIsError(false);
        setShowModal(true);

        const payload = {
            grade,
            board,
            subject,
            difficulty,
            marks,
            duration,
            customizations: customizations || 'None specified. Please create a mix of question types.'
        };

        try {
            const generatedQuestions = await GeminiFile.generateQuestionPaper(payload);
            setQuestions(generatedQuestions);
            setViewMode('questions');
            setShowResults(true);
            setShowModal(false);
        } catch (error) {
            setMessage('Failed to generate paper. Please try again later.');
            setIsError(true);
            console.log(error)
        } finally {
            setIsLoading(false);
        }
    };

    // Render questions or answers
    const renderPaperContent = () => {
        if (viewMode === 'questions') {
            return questions.map((q, index) => (
                <div key={index} className="mb-4">
                    <p className="font-bold text-lg text-[#D4A373]">Q{index + 1}. {q.question}</p>
                    {q.options && q.options.length > 0 && (
                        <ul className="list-disc list-inside mt-2 text-sm text-[#C3B4A9]">
                            {q.options.map((option, optIndex) => (
                                <li key={optIndex}>{option}</li>
                            ))}
                        </ul>
                    )}
                </div>
            ));
        } else {
            return questions.map((q, index) => (
                <div key={index} className="mb-4">
                    <p className="font-bold text-lg text-[#D4A373]">A{index + 1}.</p>
                    <p className="mt-1 text-[#C3B4A9]">{q.answer}</p>
                </div>
            ));
        }
    };

    // Handle download
    const handleDownload = () => {
        const paperTitle = "Question Paper";
        const questionsText = questions.map((q, index) => {
            let text = `Q${index + 1}. ${q.question}\n`;
            if (q.options && q.options.length > 0) {
                text += q.options.map(opt => `    - ${opt}`).join('\n') + '\n';
            }
            return text;
        }).join('\n\n');

        const answersText = questions.map((q, index) => {
            return `A${index + 1}. ${q.answer}`;
        }).join('\n\n');

        const fullText = `# ${paperTitle}\n\n## Questions\n\n${questionsText}\n\n---\n\n## Answers\n\n${answersText}`;

        const blob = new Blob([fullText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'question_paper.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-[#2F241C] flex items-center justify-center p-4 min-h-screen font-inter">
            <div className="bg-[#403228] rounded-xl shadow-lg p-6 w-full max-w-6xl md:flex md:space-x-8">
                {/* Form Container */}
                <div className="md:w-1/2 p-4">
                    <h1 className="text-3xl font-bold text-[#EFEFEF] mb-2">Question Paper Creator</h1>
                    <p className="text-[#C3B4A9] mb-6">Enter your specifications to generate a custom question paper.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="grade" className="block text-[#C3B4A9] mb-1">Grade</label>
                            <input
                                type="text"
                                id="grade"
                                className="w-full rounded-md p-2 bg-[#554433] border border-[#6A5B4F] text-[#EFEFEF] focus:outline-none focus:ring-2 focus:ring-[#D4A373]"
                                placeholder="e.g., 10th Grade"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="board" className="block text-[#C3B4A9] mb-1">Board</label>
                            <input
                                type="text"
                                id="board"
                                className="w-full rounded-md p-2 bg-[#554433] border border-[#6A5B4F] text-[#EFEFEF] focus:outline-none focus:ring-2 focus:ring-[#D4A373]"
                                placeholder="e.g., CBSE"
                                value={board}
                                onChange={(e) => setBoard(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-[#C3B4A9] mb-1">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                className="w-full rounded-md p-2 bg-[#554433] border border-[#6A5B4F] text-[#EFEFEF] focus:outline-none focus:ring-2 focus:ring-[#D4A373]"
                                placeholder="e.g., Science"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="difficulty" className="block text-[#C3B4A9] mb-1">Difficulty</label>
                            <select
                                id="difficulty"
                                className="w-full rounded-md p-2 bg-[#554433] border border-[#6A5B4F] text-[#EFEFEF] focus:outline-none focus:ring-2 focus:ring-[#D4A373]"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                required
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="marks" className="block text-[#C3B4A9] mb-1">Total Marks</label>
                            <input
                                type="number"
                                id="marks"
                                className="w-full rounded-md p-2 bg-[#554433] border border-[#6A5B4F] text-[#EFEFEF] focus:outline-none focus:ring-2 focus:ring-[#D4A373]"
                                placeholder="e.g., 50"
                                value={marks}
                                onChange={(e) => setMarks(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="duration" className="block text-[#C3B4A9] mb-1">Duration</label>
                            <input
                                type="text"
                                id="duration"
                                className="w-full rounded-md p-2 bg-[#554433] border border-[#6A5B4F] text-[#EFEFEF] focus:outline-none focus:ring-2 focus:ring-[#D4A373]"
                                placeholder="e.g., 2 hours"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="customizations" className="block text-[#C3B4A9] mb-1">Customizations / References</label>
                            <textarea
                                id="customizations"
                                className="w-full rounded-md p-2 bg-[#554433] border border-[#6A5B4F] h-32 resize-none text-[#EFEFEF] focus:outline-none focus:ring-2 focus:ring-[#D4A373]"
                                placeholder="e.g., 10 MCQs, 5 short answer questions, based on CBSE sample paper style, etc."
                                value={customizations}
                                onChange={(e) => setCustomizations(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <button
                                type="submit"
                                className="bg-[#6A5B4F] text-[#EFEFEF] rounded-full py-3 px-8 text-lg font-semibold shadow-md hover:scale-105 transition-transform duration-200"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Generating...' : 'Generate Paper'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results Display Container */}
                <div id="resultsContainer" className={`md:w-1/2 p-4 pt-8 md:pt-4 border-t md:border-t-0 md:border-l border-[#6A5B4F] mt-8 md:mt-0 flex flex-col justify-between ${showResults ? '' : 'hidden'}`}>
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-[#EFEFEF]">Generated Question Paper</h2>
                            <div className="space-x-2">
                                <button
                                    onClick={() => setViewMode('questions')}
                                    className="bg-[#6A5B4F] text-[#EFEFEF] rounded-full py-1 px-4 text-sm font-semibold"
                                >
                                    Questions
                                </button>
                                <button
                                    onClick={() => setViewMode('answers')}
                                    className="bg-[#6A5B4F] text-[#EFEFEF] rounded-full py-1 px-4 text-sm font-semibold"
                                >
                                    Answers
                                </button>
                            </div>
                        </div>

                        <div id="questionPaper" className="bg-[#554433] rounded-lg p-4 h-96 overflow-y-auto">
                            {renderPaperContent()}
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={handleDownload}
                            className="bg-[#6A5B4F] text-[#EFEFEF] rounded-full py-3 px-8 text-lg font-semibold w-full shadow-md hover:scale-105 transition-transform duration-200"
                        >
                            Download
                        </button>
                    </div>
                </div>

                {/* Message/Loading Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-[#2F241C] bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-[#403228] rounded-lg p-6 shadow-xl max-w-md w-full">
                            <div className={`text-center ${isError ? 'text-red-400' : 'text-[#EFEFEF]'}`}>{message}</div>
                            {!isLoading && (
                                <div className="flex justify-center mt-4">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="bg-[#6A5B4F] text-[#EFEFEF] rounded-full py-2 px-6 font-semibold"
                                    >
                                        OK
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionPaperMaker;