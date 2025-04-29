import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TemplateSelector = ({ selectedTemplate, onSelectTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState('');
  
  // Fetch available templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get('/api/templates');
        setTemplates(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);
  
  // Fetch template preview when a template is selected
  useEffect(() => {
    if (!selectedTemplate) {
      setPreviewHtml('');
      return;
    }
    
    const fetchTemplatePreview = async () => {
      try {
        const response = await axios.get(`/api/templates/${selectedTemplate}`);
        setPreviewHtml(response.data.content);
      } catch (error) {
        console.error('Error fetching template preview:', error);
        setPreviewHtml('<p>Error loading template preview</p>');
      }
    };
    
    fetchTemplatePreview();
  }, [selectedTemplate]);
  
  return (
    <div className="template-selector">
      <div className="form-group mb-3">
        <label htmlFor="template" className="form-label">Email Template</label>
        <select 
          className="form-select"
          id="template"
          name="template"
          value={selectedTemplate || ''}
          onChange={(e) => onSelectTemplate(e.target.value)}
          disabled={loading}
          required
        >
          <option value="">Select a template...</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        {loading && <small className="text-muted">Loading templates...</small>}
      </div>
      
      {previewHtml && (
        <div className="template-preview mt-3">
          <h5>Template Preview:</h5>
          <div 
            className="border p-3 bg-light" 
            style={{ maxHeight: '300px', overflow: 'auto' }}
          >
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;