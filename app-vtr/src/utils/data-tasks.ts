export type Status = 'todo' | 'in-progress' | 'done'
export type Priority = 'low' | 'medium' | 'high'
export type Task = {
  title: string,
  id: string,
  status: Status,
  priority: Priority,
  points?: number
}

export const statuses: Status[] = ['todo', 'in-progress', 'done']
export const priorities: Priority[] = ['low', 'medium', 'high']
export type ColumnType = "en-attente" | "en-production" | "cloture";
export type SwitchButtonProps = {
  checked: boolean;
  onChange: () => void;
  label: string;
};

export type FormReceptionData = {
  nom: string;
  demandeur: string;
  zone: string;
  contact: string;
  affaire: string;
  designation: string;
  quantite: number;
  reference: string;
  bonSortie: File | null;
  devis: File | null;
  dea: string;
  piecesJointes: File[];
  dateRetour: string;
  commentaires: string;
  state: number;
};
