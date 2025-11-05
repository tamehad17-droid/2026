import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Breadcrumb from '../../components/ui/Breadcrumb';
import TaskHeader from './components/TaskHeader';
import TaskDescription from './components/TaskDescription';
import ExternalTaskWidget from './components/ExternalTaskWidget';
import ProofSubmissionForm from './components/ProofSubmissionForm';
import TaskTips from './components/TaskTips';
import RelatedTasks from './components/RelatedTasks';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';



const TaskDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const taskId = searchParams?.get('id') || 'task-001';
  
  const [task, setTask] = useState(null);
  const [showProofForm, setShowProofForm] = useState(false);
  const [isTaskStarted, setIsTaskStarted] = useState(false);
  const [isTaskCompleted, setIsTaskCompleted] = useState(false);
  const [isProofSubmitted, setIsProofSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock task data
  const mockTasks = {
    'task-001': {
      id: 'task-001',
      title: 'Complete Social Media Survey',
      provider: 'MANUAL',
      reward: 2.50,
      difficulty: 'Easy',
      estimatedTime: 12,
      completedCount: 187,
      maxParticipants: 250,
      description: `Join our comprehensive social media usage survey to help brands understand consumer behavior patterns. This survey focuses on how different age groups interact with various social media platforms and their purchasing decisions influenced by social media advertising.\n\nYour responses will contribute to valuable market research that helps improve user experiences across digital platforms. All responses are completely anonymous and will be used solely for research purposes.`,
      requirements: [
        'Must be 18 years or older',
        'Active social media user (at least 2 platforms)',
        'Complete all survey questions honestly',
        'Provide valid email for verification',
        'Submit proof of completion within 24 hours'
      ],
      instructions: [
        'Click the "Start Task" button to begin the survey',
        'Answer all questions honestly and completely',
        'Take a screenshot of the completion confirmation page',
        'Submit the screenshot as proof along with your survey ID',
        'Wait for admin verification (usually 24-48 hours)'
      ],
      notes: [
        'Incomplete surveys will not be approved',
        'Multiple submissions from the same user will be rejected',
        'Survey must be completed in one session',
        'VPN usage may affect survey availability'
      ],
      externalUrl: 'https://survey-platform.com/social-media-2024',
      proofRequirements: 'Screenshot of completion page with survey ID visible'
    },
    'task-002': {
      id: 'task-002',
      title: 'AdGem Offer Completion',
      provider: 'ADGEM',
      reward: 3.75,
      difficulty: 'Medium',
      estimatedTime: 18,
      completedCount: 89,
      maxParticipants: 150,
      description: `Complete a series of high-value offers through the AdGem platform. This task involves signing up for trial services, downloading apps, and completing short surveys. Each completed offer contributes to your total reward.\n\nAdGem is a trusted rewards platform that connects users with legitimate advertising opportunities. All offers are from verified advertisers and provide real value to both users and businesses.`,
      requirements: [
        'Valid email address for offer registrations',
        'Access to mobile device for app downloads',
        'Credit card for trial signups (will not be charged)',
        'Complete at least 5 offers from the available list',
        'Maintain active status for required trial periods'
      ],
      instructions: [
        'Visit the AdGem platform using the provided link',
        'Create your account or log in if you already have one',
        'Browse available offers and select those you want to complete',
        'Follow each offer\'s specific instructions carefully',
        'Track your progress in the AdGem dashboard',
        'Submit your AdGem username as proof of completion'
      ],
      notes: [
        'Some offers may require credit card verification',
        'Trial cancellations must be done according to offer terms',
        'Offer availability varies by geographic location',
        'Complete offers within the specified time limits'
      ],
      externalUrl: 'https://adgem.com/wall/promohive',
      proofRequirements: 'AdGem username and screenshot of completed offers'
    }
  };

  useEffect(() => {
    // Simulate API call to fetch task details
    const fetchTaskDetails = async () => {
      setLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const taskData = mockTasks?.[taskId];
        if (!taskData) {
          navigate('/tasks-list');
          return;
        }
        
        setTask(taskData);
        
        // Check if user has already interacted with this task
        const taskStatus = localStorage.getItem(`task_${taskId}_status`);
        if (taskStatus) {
          const status = JSON.parse(taskStatus);
          setIsTaskStarted(status?.started || false);
          setIsTaskCompleted(status?.completed || false);
          setIsProofSubmitted(status?.proofSubmitted || false);
        }
      } catch (error) {
        console.error('Failed to fetch task details:', error);
        navigate('/tasks-list');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [taskId, navigate]);

  const handleStartTask = () => {
    setIsTaskStarted(true);
    
    // Save status to localStorage
    const status = { started: true, completed: false, proofSubmitted: false };
    localStorage.setItem(`task_${taskId}_status`, JSON.stringify(status));
    
    // For external tasks, this would redirect to the external platform
    if (task?.provider !== 'MANUAL') {
      // External task handling is done in ExternalTaskWidget
      return;
    }
    
    // For manual tasks, show instructions or proof form
    setShowProofForm(true);
  };

  const handleTaskComplete = () => {
    setIsTaskCompleted(true);
    
    // Update status in localStorage
    const currentStatus = JSON.parse(localStorage.getItem(`task_${taskId}_status`) || '{}');
    const newStatus = { ...currentStatus, completed: true };
    localStorage.setItem(`task_${taskId}_status`, JSON.stringify(newStatus));
  };

  const handleProofSubmit = (proofData) => {
    setIsProofSubmitted(true);
    setShowProofForm(false);
    
    // Update status in localStorage
    const currentStatus = JSON.parse(localStorage.getItem(`task_${taskId}_status`) || '{}');
    const newStatus = { ...currentStatus, proofSubmitted: true, proofData };
    localStorage.setItem(`task_${taskId}_status`, JSON.stringify(newStatus));
    
    // Show success message and redirect
    setTimeout(() => {
      navigate('/proofs-management');
    }, 2000);
  };

  const handleCancelProofSubmission = () => {
    setShowProofForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="glass rounded-xl p-6 space-y-4">
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Task Not Found</h1>
          <p className="text-text-secondary mb-4">The requested task could not be found.</p>
          <button 
            onClick={() => navigate('/tasks-list')}
            className="text-primary hover:underline"
          >
            Return to Tasks List
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{task?.title} - Task Details | PromoHive</title>
        <meta name="description" content={`Complete ${task?.title} and earn $${task?.reward?.toFixed(2)}. ${task?.description?.substring(0, 150)}...`} />
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="mb-6">
              <Breadcrumb />
            </div>

            <div className="space-y-6">
              {/* Task Header */}
              <TaskHeader 
                task={task}
                onStartTask={handleStartTask}
                onSubmitProof={() => setShowProofForm(true)}
                isCompleted={isTaskCompleted}
                isSubmitted={isProofSubmitted}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Task Description */}
                  <TaskDescription task={task} />

                  {/* External Task Widget or Proof Form */}
                  {isTaskStarted && !showProofForm && task?.provider !== 'MANUAL' && (
                    <ExternalTaskWidget 
                      task={task} 
                      onTaskComplete={handleTaskComplete}
                    />
                  )}

                  {/* Proof Submission Form */}
                  {showProofForm && (
                    <ProofSubmissionForm 
                      task={task}
                      onSubmit={handleProofSubmit}
                      onCancel={handleCancelProofSubmission}
                    />
                  )}

                  {/* Success Message */}
                  {isProofSubmitted && (
                    <div className="glass rounded-xl p-6 border border-success/20 bg-success/5">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Icon name="CheckCircle" size={32} className="text-success" />
                        </div>
                        <h3 className="text-xl font-semibold text-success mb-2">
                          Proof Submitted Successfully!
                        </h3>
                        <p className="text-text-secondary mb-4">
                          Your proof has been submitted for review. You'll receive a notification 
                          once it's been processed (typically within 24-48 hours).
                        </p>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 justify-center">
                          <Link to="/proofs-management">
                            <Button variant="default" iconName="Eye" iconPosition="left">
                              Track Status
                            </Button>
                          </Link>
                          <Link to="/tasks-list">
                            <Button variant="outline" iconName="Search" iconPosition="left">
                              Browse More Tasks
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Task Tips */}
                  <TaskTips task={task} />

                  {/* Related Tasks */}
                  <RelatedTasks currentTaskId={task?.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskDetails;