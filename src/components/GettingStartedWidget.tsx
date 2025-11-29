import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Check, ChevronRight, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GettingStartedWidget() {
    const { user } = useAppStore();
    const [progress, setProgress] = useState(0);
    const [tasks, setTasks] = useState([
        { id: 'account', label: 'Create Account', completed: true, link: '#' },
        { id: 'profile', label: 'Complete User Profile', completed: user.onboardingComplete, link: '/settings' },
        { id: 'menu', label: 'Configure Service Menu', completed: user.onboardingComplete, link: '/service-menu' },
        { id: 'payments', label: 'Set up Payments', completed: user.onboardingComplete, link: '/settings' }
    ]);

    useEffect(() => {
        // In a real app, we'd fetch the actual status of these tasks from Firestore
        // For now, we'll simulate it based on local state and some assumptions
        const newTasks = [...tasks];
        newTasks[1].completed = user.onboardingComplete;
        newTasks[2].completed = user.onboardingComplete;
        newTasks[3].completed = user.onboardingComplete;

        // Calculate progress
        const completedCount = newTasks.filter(t => t.completed).length;
        setProgress(Math.round((completedCount / newTasks.length) * 100));
        setTasks(newTasks);
    }, [user.onboardingComplete]);

    if (progress === 100) return null; // Hide when done

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="font-bold text-charcoal text-lg flex items-center">
                        <Trophy className="text-yellow-500 mr-2" size={20} />
                        Getting Started
                    </h3>
                    <p className="text-gray-500 text-sm">Complete these steps to unlock your Pro Badge.</p>
                </div>
                <span className="font-bold text-pink-500">{progress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                <div
                    className="bg-pink-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Checklist */}
            <div className="space-y-3">
                {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between group">
                        <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${task.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-300'}`}>
                                <Check size={14} />
                            </div>
                            <span className={`${task.completed ? 'text-gray-400 line-through' : 'text-charcoal font-medium'}`}>
                                {task.label}
                            </span>
                        </div>
                        {!task.completed && (
                            <Link to={task.link} className="text-sm text-pink-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                Go <ChevronRight size={14} />
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
