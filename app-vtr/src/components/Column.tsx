import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import TaskCard, { Task } from "./TaskCard";

interface ColumnProps {
  title: string;
  tasks: Task[];
  id: string;
  count: number;
}

const Column: React.FC<ColumnProps> = ({ title, tasks, id, count }) => {
  const borderColorMap: Record<string, string> = {
    "en-attente": "#0B368C",
    "en-production": "#0AAABB",
    "cloture": "#F2F2F2",
  };

  const getSubtitle = (id: string) => {
    switch (id) {
      case "en-attente":
        return "En Attente";
      case "en-production":
        return "En Production";
      case "cloture":
        return "Clôturé";
      default:
        return "";
    }
  };

  return (
    <div
      className="w-full max-w-[350px] p-4 rounded-xl border min-h-[400px] flex flex-col shadow-sm bg-white"
      style={{ borderColor: borderColorMap[id] || "#E5E7EB", borderWidth: "1px", borderStyle: "solid" }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-800">{count}</span>
          <span className="text-xs text-gray-500">{getSubtitle(id)}</span>
        </div>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex flex-col gap-3 min-h-[300px] transition-colors duration-200 p-1 rounded ${
              snapshot.isDraggingOver ? "bg-gray-50" : ""
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="mb-2"
                  >
                    <TaskCard task={task} isDragging={snapshot.isDragging} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
