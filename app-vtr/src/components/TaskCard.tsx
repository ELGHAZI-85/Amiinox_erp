import React, { useState } from "react";

export interface Task {
  id: string;
  title: string;
  description: string;
  labels: string[];
  assignee: string;
  assigneeAvatar?: string; // New optional avatar URL
  dueDate: string;
  priority: "low" | "medium" | "high";
  notes: string;
  urls?: string[];
}

interface TaskCardProps {
  task: Task;
  isDragging: boolean;
}

const priorityColors = {
  high: "#ef4444",
  medium: "#3b82f6",
  low: "#22c55e",
  default: "#6b7280",
};

const getPriorityColor = (priority: string) =>
  priorityColors[priority as keyof typeof priorityColors] || priorityColors.default;

const getLabelIcon = (label: string) => {
  switch (label.toLowerCase()) {
    case "folder":
      return "📁";
    case "file":
      return "📄";
    case "ticket":
      return "🎫";
    default:
      return "🏷️";
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [descOpen, setDescOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const urls = task.urls || [];

  const getMediaType = (url: string): "image" | "video" | "pdf" | "other" => {
    const extension = url.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(extension || "")) {
      return "image";
    }
    if (["mp4", "mov", "avi", "mkv", "webm"].includes(extension || "")) {
      return "video";
    }
    if (extension === "pdf") {
      return "pdf";
    }
    return "other";
  };

  const renderMediaPreview = (url: string) => {
    const mediaType = getMediaType(url);

    switch (mediaType) {
      case "image":
        return (
          <img
            src={url}
            alt="Preview"
            style={{
              width: "100%",
              maxHeight: "180px",
              objectFit: "cover",
              borderRadius: "12px",
              display: imageLoading ? "none" : "block",
            }}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        );

      case "video":
        return (
          <video
            controls
            style={{ width: "100%", maxHeight: "180px", borderRadius: "12px" }}
          >
            <source src={url} />
            Your browser does not support the video tag.
          </video>
        );

      default:
        return (
          <div
            style={{
              height: 180,
              borderRadius: "12px",
              backgroundColor: "#f3f4f6",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              color: "#6b7280",
              fontSize: 14,
            }}
            onClick={() => window.open(url, "_blank")}
          >
            📎 Cliquer pour voir le fichier
          </div>
        );
    }
  };

  const toggleDesc = () => setDescOpen(!descOpen);

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % urls.length);
    setImageLoading(true);
    setImageError(false);
  };
  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + urls.length) % urls.length);
    setImageLoading(true);
    setImageError(false);
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        boxShadow: isDragging
          ? "0 10px 25px rgba(0,0,0,0.3)"
          : "0 1px 6px rgba(0,0,0,0.1)",
        cursor: "move",
        maxWidth: 350,
        userSelect: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
          alignItems: "center",
        }}
      >
        <h3
          style={{
            fontSize: 16,
            margin: 0,
            fontWeight: "600",
            color: "#1f2937",
            flex: 1,
          }}
        >
          {task.title || "Titre manquant"}
        </h3>
        <div
          style={{
            backgroundColor: getPriorityColor(task.priority),
            color: "white",
            borderRadius: 12,
            padding: "4px 12px",
            fontWeight: "600",
            fontSize: 12,
            whiteSpace: "nowrap",
            marginLeft: 12,
            userSelect: "none",
          }}
          title={`Priorité: ${task.priority}`}
        >
          {task.priority.toUpperCase()}
        </div>
      </div>

      {/* Assignee with avatar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
        title={`Assigné à: ${task.assignee || "Non assigné"}`}
      >
        {task.assigneeAvatar ? (
          <img
            src={task.assigneeAvatar}
            alt={task.assignee}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #3b82f6",
            }}
          />
        ) : (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#9ca3af",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "700",
              fontSize: 14,
              userSelect: "none",
            }}
          >
            {task.assignee?.charAt(0).toUpperCase() || "?"}
          </div>
        )}
        <span style={{ fontSize: 14, color: "#4b5563" }}>
          {task.assignee || "Non assigné"}
        </span>
      </div>

      {/* Media carousel */}
      {urls.length > 0 && (
        <div style={{ position: "relative", marginBottom: 12 }}>
          {renderMediaPreview(urls[currentMediaIndex])}

          {urls.length > 1 && (
            <>
              <button
                onClick={prevMedia}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 8,
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(0,0,0,0.4)",
                  border: "none",
                  borderRadius: "50%",
                  color: "white",
                  width: 28,
                  height: 28,
                  cursor: "pointer",
                }}
                aria-label="Précédent"
              >
                ‹
              </button>
              <button
                onClick={nextMedia}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: 8,
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(0,0,0,0.4)",
                  border: "none",
                  borderRadius: "50%",
                  color: "white",
                  width: 28,
                  height: 28,
                  cursor: "pointer",
                }}
                aria-label="Suivant"
              >
                ›
              </button>
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "rgba(0,0,0,0.4)",
                  borderRadius: 12,
                  padding: "2px 8px",
                  fontSize: 12,
                  color: "white",
                  userSelect: "none",
                }}
              >
                {currentMediaIndex + 1} / {urls.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* Description collapsible */}
      <div
        style={{
          fontSize: 14,
          color: "#374151",
          marginBottom: 8,
          maxHeight: descOpen ? "none" : 60,
          overflow: "hidden",
          position: "relative",
          transition: "max-height 0.3s ease",
        }}
      >
        {task.description || "Aucune description"}

        {!descOpen && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: 24,
              background:
                "linear-gradient(transparent, white 90%)",
            }}
          />
        )}
      </div>
      <button
        onClick={toggleDesc}
        style={{
          background: "none",
          border: "none",
          color: "#3b82f6",
          cursor: "pointer",
          fontSize: 14,
          padding: 0,
          marginBottom: 12,
          userSelect: "none",
        }}
        aria-expanded={descOpen}
      >
        {descOpen ? "Voir moins" : "Lire la suite"}
      </button>

      {/* Labels */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {task.labels.filter(Boolean).map((label, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "#6b7280",
              backgroundColor: "#f3f4f6",
              borderRadius: 12,
              padding: "4px 12px",
              userSelect: "none",
            }}
          >
            <span>{getLabelIcon(label)}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div
        style={{
          fontSize: 13,
          color: "#6b7280",
          fontStyle: "italic",
          marginBottom: 8,
        }}
      >
        <strong>Notes:</strong> {task.notes || "Aucune note"}
      </div>

      {/* Due date */}
      <div
        style={{
          fontSize: 12,
          color: "#9ca3af",
          display: "flex",
          justifyContent: "flex-end",
        }}
        title={`Date d'échéance: ${task.dueDate}`}
      >
        🕒 {task.dueDate || "Aucune date"}
      </div>
    </div>
  );
};

export default TaskCard;