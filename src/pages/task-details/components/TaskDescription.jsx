import React from 'react';
import Icon from '../../../components/AppIcon';

const TaskDescription = ({ task }) => {
  return (
    <div className="glass rounded-xl p-6 border border-border">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="FileText" size={20} className="text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Task Description</h2>
      </div>
      <div className="prose prose-invert max-w-none">
        <p className="text-text-secondary leading-relaxed mb-6">
          {task?.description}
        </p>

        {/* Task Requirements */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center space-x-2">
            <Icon name="CheckSquare" size={18} className="text-primary" />
            <span>Requirements</span>
          </h3>
          <ul className="space-y-2">
            {task?.requirements?.map((requirement, index) => (
              <li key={index} className="flex items-start space-x-3">
                <Icon name="Check" size={16} className="text-success mt-0.5 flex-shrink-0" />
                <span className="text-text-secondary">{requirement}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Task Instructions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center space-x-2">
            <Icon name="List" size={18} className="text-primary" />
            <span>Step-by-Step Instructions</span>
          </h3>
          <ol className="space-y-3">
            {task?.instructions?.map((instruction, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">{index + 1}</span>
                </div>
                <span className="text-text-secondary">{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Important Notes */}
        {task?.notes && task?.notes?.length > 0 && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="AlertTriangle" size={18} className="text-warning" />
              <h4 className="font-semibold text-warning">Important Notes</h4>
            </div>
            <ul className="space-y-1">
              {task?.notes?.map((note, index) => (
                <li key={index} className="text-sm text-warning/80 flex items-start space-x-2">
                  <span className="mt-1.5 w-1 h-1 bg-warning/60 rounded-full flex-shrink-0" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDescription;