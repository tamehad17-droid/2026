import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import TaskFilterBar from './components/TaskFilterBar';
import TaskModal from './components/TaskModal';
import TaskCard from './components/TaskCard';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const TasksManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await adminService.getTasks();
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await adminService.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      toast.success('Task created successfully!');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task. Please try again.');
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const updatedTask = await adminService.updateTask(taskId, updates);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      toast.success('Task updated successfully!');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await adminService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task. Please try again.');
    }
  };

  const handleModalSubmit = async (formData) => {
    if (selectedTask) {
      await handleUpdateTask(selectedTask.id, formData);
    } else {
      await handleCreateTask(formData);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = !filters.status || task.status === filters.status;
    const matchesCategory = !filters.category || task.category === filters.category;
    const matchesSearch = !filters.search || 
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.description.toLowerCase().includes(filters.search.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Tasks Management - PromoHive Admin</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Tasks Management</h1>
            <p className="text-text-secondary">
              Create and manage tasks for users to complete and earn rewards
            </p>
          </div>

          <TaskFilterBar
            filters={filters}
            setFilters={setFilters}
            onCreateTask={() => {
              setSelectedTask(null);
              setIsModalOpen(true);
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => {
                  setSelectedTask(task);
                  setIsModalOpen(true);
                }}
                onDelete={() => handleDeleteTask(task.id)}
              />
            ))}

            {filteredTasks.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-text-secondary">
                  {Object.values(filters).some(v => v)
                    ? 'No tasks match your filters. Try adjusting them.'
                    : 'No tasks found. Create your first task to get started!'}
                </p>
              </div>
            )}
          </div>

          <TaskModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            task={selectedTask}
            onSubmit={handleModalSubmit}
          />
        </div>
      </div>
    </>
  );
};

export default TasksManagement;