import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import TaskCard, { Task } from "./TaskCard";
import { ColumnType } from "../utils/data-tasks"; 

interface ColumnProps {
  title: string;
  tasks: Task[];
  id: ColumnType; 
  count: number;
}

const Column: React.FC<ColumnProps> = ({ title, tasks, id, count }) => {

  // const getSubtitle = (id: string) => {
  //   switch (id) {
  //     case "en-attente":
  //       return "En Attente";
  //     case "en-production":
  //       return "En Production";
  //     case "cloture":
  //       return "Clôturé";
  //     default:
  //       return "";
  //   }
  // };

  return (
    <div className="kanban-column">
      <div className="column-header">
        <div className="column-title">
          {title}
        </div>
        <div className={`column-count ${id}`}>
              <span>{count}</span>
        </div>
      </div>

    <div className="cards-container" >
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
                  >
                    <TaskCard task={task} isDragging={snapshot.isDragging} columnId={id} />
                    {/* <TaskCard task={task} isDragging={snapshot.isDragging} /> */}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
    </div>
  );
};

export default Column;
