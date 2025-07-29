import React, { useState, useEffect } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import type { DropResult } from "react-beautiful-dnd";
import Column from "../components/Column";
import type { Task } from "../components/TaskCard";
import '../assets/css/dashboard.css'

export default function Dashboard() {
  const [enAttente, setEnAttente] = useState<Task[]>([]);
  const [enProduction, setEnProduction] = useState<Task[]>([]);
  const [cloture, setCloture] = useState<Task[]>([]);

  type ColumnId = "en-attente" | "en-production" | "cloture";

  const mapItemToTask = (item: any): Task => ({
    id: item.request_id,
    affaire_suivie: item.affaire,
    nom: item.nom,
    demandeur: item.demandeur,
    zone: item.zone,
    contact: item.contact,
    designation: item.designation,
    quantite: item.quantite,
    reference: item.reference,
    dateRetour: item.date_retour || "Aucune date",
    priority: item.urgent ? "high" : "medium",
    notes: item.commentaires || "",
    urls: item.urls || [],
    state: item.state
  });


  useEffect(() => {
    async function fetchTasks() {
      const items = await window.electron.ipcRenderer.invoke("get-commands-from-dynamo");

      if (items.error) {
        console.error("Erreur lors du chargement des tâches :", items.message);
        return;
      }

      const attente: Task[] = [];
      const production: Task[] = [];
      const clotureList: Task[] = [];

      items.forEach((item: any) => {
        const task = mapItemToTask(item);
        switch (item.state) {
          case 0:
          case "0":
            attente.push(task);
            break;
          case 1:
          case "1":
            production.push(task);
            break;
          case 2:
          case "2":
            clotureList.push(task);
            break;
          default:
            attente.push(task);
        }
      });

      setEnAttente(attente);
      setEnProduction(production);
      setCloture(clotureList);
    }

    fetchTasks();
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const columnMap: Record<ColumnId, {
      tasks: Task[];
      setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    }> = {
      "en-attente": { tasks: enAttente, setTasks: setEnAttente },
      "en-production": { tasks: enProduction, setTasks: setEnProduction },
      "cloture": { tasks: cloture, setTasks: setCloture },
    };

    const sourceId = source.droppableId as ColumnId;
    const destId = destination.droppableId as ColumnId;

    const sourceData = columnMap[sourceId];
    const destinationData = columnMap[destId];

    const taskToMove = sourceData.tasks[source.index];

    if (sourceId === destId) {
      const updated = [...sourceData.tasks];
      updated.splice(source.index, 1);
      updated.splice(destination.index, 0, taskToMove);
      sourceData.setTasks(updated);
    } else {
      const sourceUpdated = [...sourceData.tasks];
      sourceUpdated.splice(source.index, 1);
      sourceData.setTasks(sourceUpdated);

      const destinationUpdated = [...destinationData.tasks];
      destinationUpdated.splice(destination.index, 0, taskToMove);
      destinationData.setTasks(destinationUpdated);

      // Optional: Call backend to persist new state here
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div>
      <div className = "header">
        <h1>🏭 Gestion de Production - AMIIN Inox</h1>
      </div>

      <div className="kanban-board">
          <Column title="⏳ EN ATTENTE" tasks={enAttente} id="en-attente" count={enAttente.length} />
          <Column title="🔧 EN PRODUCTION" tasks={enProduction} id="en-production" count={enProduction.length} />
          <Column title="✅ CLÔTURE" tasks={cloture} id="cloture" count={cloture.length} />
      </div>

      </div>
    </DragDropContext>
  );
}
