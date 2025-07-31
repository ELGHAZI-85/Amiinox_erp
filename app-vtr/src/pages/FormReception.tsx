import React, { useState } from 'react';
import { SwitchButtonProps } from '../utils/data-tasks';
import { FormReceptionData } from '../utils/data-tasks'; // ou le bon chemin

const cardStyle = {
  backgroundColor: 'white',
  padding: '1.5rem',
  borderRadius: '0.75rem',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
};

const sectionTitleStyle = {
  fontSize: '1.125rem',
  fontWeight: 600,
  marginBottom: '1rem',
  color: '#1f2937',
};

const inputStyle = {
  border: '1px solid #d1d5db',
  borderRadius: '0.5rem',
  padding: '0.5rem 0.75rem',
  outline: 'none',
  width: '100%',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#374151',
  marginBottom: '0.25rem',
};

const fileItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#f9fafb',
  padding: '0.5rem',
  borderRadius: '0.5rem',
};

const removeBtnStyle = {
  color: '#ef4444',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
};

const placeholders = {
  nom: 'Nom *',
  demandeur: 'Demandeur *',
  zone: 'Zone',
  contact: 'Contact *',
};

type PlaceholderKey = keyof typeof placeholders;
const clientFields: PlaceholderKey[] = ['nom', 'demandeur', 'zone', 'contact'];

const SwitchButton: React.FC<SwitchButtonProps> = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
    <span>{label}</span>
    <div
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </div>
  </label>
);

const FormReception = () => {
  const [urgent, setUrgent] = useState(false);
  const [delaiRetour, setDelaiRetour] = useState(false);
  const [formData, setFormData] = useState<FormReceptionData>({
    nom: '',
    demandeur: '',
    zone: '',
    contact: '',
    affaire: '',
    designation: '',
    quantite: 1,
    reference: '',
    bonSortie: null,
    devis: null,
    dea: '',
    piecesJointes: [],
    dateRetour: '',
    commentaires: '',
    state: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    setFormData(prev => ({ ...prev, [fieldName]: file }));
  };

  const handleMultipleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      piecesJointes: [...prev.piecesJointes, ...files],
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      piecesJointes: prev.piecesJointes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const filesToUpload = [];

      if (formData.bonSortie) {
        filesToUpload.push({ file: formData.bonSortie, s3Key: `bons/${formData.bonSortie.name}` });
      }

      if (formData.devis) {
        filesToUpload.push({ file: formData.devis, s3Key: `devis/${formData.devis.name}` });
      }

      formData.piecesJointes.forEach((file, i) => {
        filesToUpload.push({ file, s3Key: `pieces/${Date.now()}_${i}_${file.name}` });
      });

      const uploadResults = [];
      for (const { file, s3Key } of filesToUpload) {
        const buffer = await file.arrayBuffer();
        const result = await window.electron?.ipcRenderer?.invoke('upload-to-s3', {
          s3Key,
          buffer: Array.from(new Uint8Array(buffer)),
          mimeType: file.type,
        });

        if (!result.success) {
          alert(`Échec de l'envoi du fichier ${file.name} : ${result.error}`);
          return;
        }

        uploadResults.push(result);
      }

      const cleanFormData = {
        nom: formData.nom,
        demandeur: formData.demandeur,
        zone: formData.zone,
        contact: formData.contact,
        affaire: formData.affaire,
        designation: formData.designation,
        quantite: formData.quantite,
        reference: formData.reference,
        dea: formData.dea,
        urgent: urgent,
        delai_retour: delaiRetour,
        date_retour: formData.dateRetour,
        commentaires: formData.commentaires,
        state: 0,
      };

      const uploadedUrls = uploadResults.map(file => file.url);
      const dbResult = await window.electron?.ipcRenderer?.invoke('save-command-to-dynamo', {
        formData: cleanFormData,
        uploadedUrls,
      });

      if (dbResult.success) {
        alert('Demande soumise avec succès!');
        setFormData({
          nom: '',
          demandeur: '',
          zone: '',
          contact: '',
          affaire: '',
          designation: '',
          quantite: 1,
          reference: '',
          bonSortie: null,
          devis: null,
          dea: '',
          piecesJointes: [],
          dateRetour: '',
          commentaires: '',
          state: 0,
        });
        setUrgent(false);
        setDelaiRetour(false);
      } else {
        alert(`Échec de l'enregistrement : ${dbResult.error}`);
      }
    }  catch (error: unknown) {
      if (error instanceof Error) {
        alert(`Erreur de soumission : ${error.message}`);
      } else {
        alert('Erreur de soumission inconnue.');
      }
    }

  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2.5rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', color: '#2563eb', marginBottom: '2.5rem' }}>
        Réception
      </h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
          {/* Partie gauche */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Client */}
            <div style={cardStyle}>
              <h2 style={sectionTitleStyle}>Client</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {clientFields.map((name) => (
                <input
                  key={name}
                  name={name}
                  placeholder={placeholders[name]}
                  onChange={handleChange}
                  required={['nom', 'demandeur', 'contact'].includes(name)}
                  style={inputStyle}
                />
              ))}
                <input
                  name="affaire"
                  placeholder="Affaire suivie par *"
                  onChange={handleChange}
                  required
                  style={{ ...inputStyle, gridColumn: 'span 2' }}
                />
              </div>
            </div>

            {/* Pièces jointes */}
            <div style={cardStyle}>
              <h2 style={sectionTitleStyle}>Pièces jointes</h2>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mp3,.wav,.ogg"
                onChange={handleMultipleFileChange}
                style={inputStyle}
              />
              <p style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '0.5rem' }}>
                Formats acceptés: Images, PDF, Documents, Vidéos, Audio
              </p>
              {formData.piecesJointes.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Fichiers sélectionnés:</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '6rem', overflowY: 'auto' }}>
                    {formData.piecesJointes.map((file, index) => (
                      <div key={index} style={fileItemStyle}>
                        <span style={{ fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {file.name}
                        </span>
                        <button type="button" onClick={() => removeFile(index)} style={removeBtnStyle}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Commentaires */}
            <div style={cardStyle}>
              <h2 style={sectionTitleStyle}>Commentaires</h2>
              <textarea
                name="commentaires"
                placeholder="Commentaires additionnels..."
                onChange={handleChange}
                style={{ ...inputStyle, height: '4rem', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Partie droite */}
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Commande</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea
                name="designation"
                placeholder="Désignation *"
                onChange={handleChange}
                required
                style={{ ...inputStyle, height: '5rem', resize: 'vertical' }}
              />
              <div>
                <label style={labelStyle}>Quantité *</label>
                <input
                  type="number"
                  name="quantite"
                  value={formData.quantite}
                  onChange={handleChange}
                  min="1"
                  required
                  style={{ ...inputStyle, width: '6rem', textAlign: 'center' }}
                />
              </div>
              <input name="reference" placeholder="Référence" onChange={handleChange} style={inputStyle} />
              <div>
                <label style={labelStyle}>Bon de Sortie</label>
                <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'bonSortie')} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Devis</label>
                <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'devis')} style={inputStyle} />
              </div>
              <input name="dea" placeholder="DEA (Identifiant)" onChange={handleChange} style={inputStyle} />
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <SwitchButton checked={urgent} onChange={() => setUrgent(!urgent)} label="Urgent" />
                <SwitchButton checked={delaiRetour} onChange={() => setDelaiRetour(!delaiRetour)} label="Délai de Prise de Cotes" />
              </div>
              {delaiRetour && (
                <div>
                  <label style={labelStyle}>Date de retour</label>
                  <input type="date" name="dateRetour" value={formData.dateRetour} onChange={handleChange} style={inputStyle} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <button
            type="submit"
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              fontWeight: 500,
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
          >
            Soumettre
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormReception;
