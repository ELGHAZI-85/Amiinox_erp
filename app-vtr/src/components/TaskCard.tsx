import React, { useState } from "react";
import { ColumnType } from "../utils/data-tasks"; 

export interface Task {
  id: string;
  affaire_suivie: string;
  nom: string;
  demandeur: string;
  zone: string;
  contact: string;
  designation: string;
  quantite: string;
  reference: string;
  dateRetour: string;
  priority: "low" | "medium" | "high";
  notes: string;
  urls?: string[];
  state: boolean;
}

interface TaskCardProps {
  task: Task;
  isDragging: boolean;
  columnId: ColumnType;
}

// const priorityColors = {
//   high: "#ef4444",
//   medium: "#3b82f6",
//   low: "#22c55e",
//   default: "#6b7280",
// };

const getMediaType = (url: string): "image" | "video" | "pdf" | "other" => {
  const ext = url.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) return "image";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return "video";
  if (ext === "pdf") return "pdf";
  return "other";
};

const getMediaIcon = (type: string) => {
  switch (type) {
    case "pdf": return "📄";
    case "video": return "🎥";
    case "image": return "🖼️";
    default: return "📎";
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, columnId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const urls = task.urls || [];

  const getStatusClass = (id: string) => {
    switch (id) {
      case "en-attente": return "status-attente";
      case "en-production": return "status-production";
      case "cloture": return "status-cloture";
      default: return "";
    }
  };

  return (
    <>
      <div className="production-card" draggable="true">
        <div className={`status-indicator ${getStatusClass(columnId)}`}></div>
        <div className="card-top">
          <div>
            <div className="card-title">{task.designation || "Designation Manquante"}</div>
            <div className="card-ref">{task.reference}</div>
          </div>
          <div className="priority-badge priority-high">{task.priority}</div>
        </div>

        <div className="card-client flex items-center gap-2">
          {task.nom === "copag" ? (
            <img
              src="/logos/copag_log.png"
              alt="Copag Logo"
              className="w-5 h-5 object-contain"
            />
          ) : (
            <span className="text-lg">🏢</span>
          )}
          <div className="client-name">{task.nom}</div>
        </div>

        <div className="card-details">
          <div className="detail-row">
            <span className="detail-label">Zone</span>
            <span className="detail-value">{task.zone}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Quantité</span>
            <span className="quantity-value">{task.quantite}</span>
          </div>
        </div>

        <div className="card-footer">
          <div className="date-info">📅 {task.dateRetour}</div>

          {urls.length > 0 && (
            <div
              className="attachments-info"
              onClick={() => setIsModalOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "#f9fafb",
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
                marginBottom: 12,
              }}
            >
              {urls.some(url => getMediaType(url) === "pdf") && <div className="attachment-icon pdf" >📄</div>}
              {urls.some(url => getMediaType(url) === "video") && <div className="attachment-icon video">🎥</div>}
              {urls.some(url => getMediaType(url) === "image") && <div className="attachment-icon image">🖼️</div>}
              <div style={{ marginLeft: "auto", fontSize: 12, color: "#6b7280" }}>
                +{urls.length}
              </div>
            </div>
          )}

          <div className="user-assigned">
            <div className="user-avatar">AT</div>
            <span>{task.affaire_suivie}</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="attachments-modal"
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              width: "80%",
              maxHeight: "80%",
              overflowY: "auto",
              padding: 20,
              position: "relative"
            }}
          >
            <div className="modal-header" style={{ display: "flex", justifyContent: "space-between" }}>
              <h3>📎 Pièces jointes - {task.reference}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer"
                }}
              >
                ×
              </button>
            </div>

            <div className="attachments-list" style={{ marginTop: 20 }}>
              {urls.map((url, index) => {
                const type = getMediaType(url);
                return (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 12,
                      gap: 12,
                      borderBottom: "1px solid #e2e8f0",
                      paddingBottom: 8
                    }}
                  >
                    <div style={{ fontSize: 20 }}>{getMediaIcon(type)}</div>
                    <div style={{ flex: 1 }}>{url.split("/").pop()}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => window.open(url, "_blank")}>👁️ Voir</button>
                      <a href={url} download target="_blank" rel="noreferrer">⬇️ Télécharger</a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskCard;
