import React, { useState } from 'react';

const FormReception = () => {
  const [urgent, setUrgent] = useState(false);
  const [delaiRetour, setDelaiRetour] = useState(false);
  const [formData, setFormData] = useState({
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
    state : 0
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const file = e.target.files?.[0];
    setFormData(prev => ({ ...prev, [fieldName]: file }));
  };

  const handleMultipleFileChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const files = Array.from(e.target.files || []);
      setFormData(prev => ({
        ...prev,
        piecesJointes: [...prev.piecesJointes, ...files],
      }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      piecesJointes: prev.piecesJointes.filter((_, i) => i !== index)
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // Collect all files
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

    // Upload files to S3
    const uploadResults = [];
    for (const { file, s3Key } of filesToUpload) {
      const buffer = await file.arrayBuffer();
      const result = await window.electron?.ipcRenderer?.invoke('upload-to-s3', {
        s3Key,
        buffer: Array.from(new Uint8Array(buffer)),
        mimeType: file.type,
      });
      
      if (result.success) {
        uploadResults.push(result);
        console.log(" uploaded ")
      } else {
        console.error('File upload failed:', result.error);
        alert(`Failed to upload ${file.name}: ${result.error}`);
        return; // Stop if any file upload fails
      }
    }
    
    console.log('Upload Results:', uploadResults);

    // Prepare form data for DynamoDB (exclude File objects)
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
      state: 0
    };
    const uploadedUrls = uploadResults.map(file => file.url); // extract just the URLs
    const dbResult = await window.electron?.ipcRenderer?.invoke('save-command-to-dynamo', {
        formData: cleanFormData,
        uploadedUrls, // send only the URLs
    });

    
    if (dbResult.success) {
      alert('Request submitted successfully!');
      // Reset form if needed
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
      console.error('DynamoDB save failed:', dbResult.error);
      alert(`Failed to save to database: ${dbResult.error}`);
    }

  } catch (error) {
    console.error('Form submission error:', error);
    alert(`Submission failed: ${error.message}`);
  } 
};
  const SwitchButton = ({ checked, onChange, label }) => (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium">{label}</span>
      <div 
        className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
        onClick={onChange}
      >
        <span 
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </div>
      {/* <span className="text-sm text-gray-600">{checked ? 'ON' : 'OFF'}</span> */}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-3xl font-bold text-center text-blue-800 mb-10">Réception</h1>
      
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          {/* Colonne gauche */}
          <div className="space-y-6">
            {/* Client Section */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">Client</h2>
              <div className="grid grid-cols-2 gap-3">
                <input 
                  name="nom" 
                  placeholder="Nom *" 
                  className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  onChange={handleChange} 
                  required 
                />
                <input 
                  name="demandeur" 
                  placeholder="Demandeur *" 
                  className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  onChange={handleChange} 
                  required 
                />
                <input 
                  name="zone" 
                  placeholder="Zone" 
                  className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  onChange={handleChange} 
                />
                <input 
                  name="contact" 
                  placeholder="Contact *" 
                  className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  onChange={handleChange} 
                  required 
                />
                <input 
                  name="affaire" 
                  placeholder="Affaire suivie par *" 
                  className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2" 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            {/* Pièces jointes */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">Pièces jointes</h2>
              <input 
                type="file" 
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mp3,.wav,.ogg"
                onChange={handleMultipleFileChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <p className="text-sm text-gray-600 mt-2">
                Formats acceptés: Images, PDF, Documents, Vidéos, Audio
              </p>
              {formData.piecesJointes.length > 0 && (
                <div className="mt-3">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Fichiers sélectionnés:</h3>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {formData.piecesJointes.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <button 
                          type="button" 
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Commentaires */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">Commentaires</h2>
              <textarea 
                name="commentaires" 
                placeholder="Commentaires additionnels..." 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-vertical" 
                onChange={handleChange} 
              />
            </div>
          </div>

          {/* Commande Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Commande</h2>
            <div className="space-y-4">
              {/* Désignation */}
              <div>
                {/* <label className="block text-sm font-medium text-gray-700 mb-1">Désignation *</label> */}
                <textarea 
                  name="designation" 
                  placeholder="Désignation *" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-vertical" 
                  onChange={handleChange} 
                  required 
                />
              </div>

              {/* Quantité */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité *</label>
  <div className="flex items-center space-x-2">
    <input 
      type="number" 
      name="quantite" 
      value={formData.quantite}
      onChange={handleChange}
      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-20 text-center" 
      min="1"
      required 
    />
  </div>
</div>

              {/* Référence */}
              <input 
                name="reference" 
                placeholder="Référence" 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                onChange={handleChange} 
              />

              {/* Bon de Sortie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bon de Sortie</label>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'bonSortie')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                {formData.bonSortie && (
                  <p className="text-sm text-gray-600 mt-1">Fichier sélectionné: {formData.bonSortie.name}</p>
                )}
              </div>

              {/* Devis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Devis</label>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'devis')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                {formData.devis && (
                  <p className="text-sm text-gray-600 mt-1">Fichier sélectionné: {formData.devis.name}</p>
                )}
              </div>

              {/* DEA */}
              <input 
                name="dea" 
                placeholder="DEA (Identifiant)" 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                onChange={handleChange} 
              />

              {/* Options */}

                <div className="flex flex-wrap gap-6 items-center">
                  <SwitchButton 
                    checked={urgent} 
                    onChange={() => setUrgent(!urgent)}
                    label="Urgent"
                  />
                  
                  <SwitchButton 
                    checked={delaiRetour} 
                    onChange={() => setDelaiRetour(!delaiRetour)}
                    label="Délai de Prise de Cotes"
                  />
                </div>

{delaiRetour && (
  <div className="mt-3 pl-4 border-l-4 border-blue-500">
    <label className="block text-sm font-medium text-gray-700 mb-1">Date de retour</label>
    <input 
      type="date" 
      name="dateRetour"
      value={formData.dateRetour}
      onChange={handleChange}
      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
    />
  </div>
)}


            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-6 mt-8">
          <button 
            type="submit" 
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            Soumettre
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormReception;