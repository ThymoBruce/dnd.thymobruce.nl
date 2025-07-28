import React, { useState } from 'react';
import { useUserTemplates } from '../hooks/useUserTemplates';
import { useCampaigns } from '../hooks/useCampaigns';
import { Plus, FileText, Trash2, Edit, Copy, Globe, Lock } from 'lucide-react';

const Templates = () => {
  const { templates, userContent, addTemplate, addUserContent, updateUserContent, deleteTemplate, deleteUserContent, loading, error } = useUserTemplates();
  const { campaigns } = useCampaigns();
  const [activeTab, setActiveTab] = useState<'templates' | 'content'>('templates');
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [isCreatingContent, setIsCreatingContent] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    is_public: false,
    fields: [{ name: '', type: 'text', required: false, description: '' }]
  });
  const [contentForm, setContentForm] = useState({
    template_id: '',
    title: '',
    campaign_id: '',
    is_private: true,
    content_data: {}
  });

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'number', label: 'Number' },
    { value: 'select', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'date', label: 'Date' }
  ];

  const handleAddField = () => {
    setTemplateForm(prev => ({
      ...prev,
      fields: [...prev.fields, { name: '', type: 'text', required: false, description: '' }]
    }));
  };

  const handleRemoveField = (index: number) => {
    setTemplateForm(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const handleFieldChange = (index: number, field: string, value: any) => {
    setTemplateForm(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => i === index ? { ...f, [field]: value } : f)
    }));
  };

  const handleTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const templateData = {
      name: templateForm.name,
      description: templateForm.description,
      is_public: templateForm.is_public,
      template_schema: {
        fields: templateForm.fields.filter(f => f.name.trim())
      }
    };
    addTemplate(templateData)
      .then(() => {
        setTemplateForm({
          name: '', description: '', is_public: false,
          fields: [{ name: '', type: 'text', required: false, description: '' }]
        });
        setIsCreatingTemplate(false);
      })
      .catch(err => console.error('Failed to create template:', err));
  };

  const handleContentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUserContent(contentForm)
      .then(() => {
        setContentForm({
          template_id: '', title: '', campaign_id: '', is_private: true, content_data: {}
        });
        setIsCreatingContent(false);
        setSelectedTemplate(null);
      })
      .catch(err => console.error('Failed to create content:', err));
  };

  const handleContentFieldChange = (fieldName: string, value: any) => {
    setContentForm(prev => ({
      ...prev,
      content_data: { ...prev.content_data, [fieldName]: value }
    }));
  };

  const renderContentField = (field: any) => {
    const value = contentForm.content_data[field.name] || '';

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleContentFieldChange(field.name, e.target.value)}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            required={field.required}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleContentFieldChange(field.name, parseInt(e.target.value) || 0)}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handleContentFieldChange(field.name, e.target.checked)}
            className="rounded"
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleContentFieldChange(field.name, e.target.value)}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleContentFieldChange(field.name, e.target.value)}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
        <p className="text-red-400">Error loading templates: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-blue-400" />
          <h1 className="text-3xl font-bold">Custom Templates</h1>
        </div>
        <div className="flex space-x-3">
          {activeTab === 'templates' ? (
            <button
              onClick={() => setIsCreatingTemplate(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Create Template</span>
            </button>
          ) : (
            <button
              onClick={() => setIsCreatingContent(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Create Content</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-2 px-4 rounded-lg transition-colors duration-200 ${
            activeTab === 'templates'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-2 px-4 rounded-lg transition-colors duration-200 ${
            activeTab === 'content'
              ? 'bg-green-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Content ({userContent.length})
        </button>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <>
          {/* Create Template Form */}
          {isCreatingTemplate && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Create New Template</h3>
              <form onSubmit={handleTemplateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Magic Item, Guild, Deity"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="is_public"
                      checked={templateForm.is_public}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, is_public: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="is_public" className="text-slate-300">Make template public</label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Describe what this template is for..."
                  />
                </div>
                
                {/* Fields */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-slate-300">
                      Template Fields
                    </label>
                    <button
                      type="button"
                      onClick={handleAddField}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                    >
                      Add Field
                    </button>
                  </div>
                  <div className="space-y-3">
                    {templateForm.fields.map((field, index) => (
                      <div key={index} className="bg-slate-700 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Field Name</label>
                            <input
                              type="text"
                              value={field.name}
                              onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                              className="w-full bg-slate-600 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Field name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Type</label>
                            <select
                              value={field.type}
                              onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                              className="w-full bg-slate-600 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              {fieldTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center space-x-2 pt-4">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                              className="rounded"
                            />
                            <label className="text-xs text-slate-300">Required</label>
                          </div>
                          <div className="flex items-center justify-end pt-4">
                            <button
                              type="button"
                              onClick={() => handleRemoveField(index)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="mt-2">
                          <label className="block text-xs text-slate-400 mb-1">Description</label>
                          <input
                            type="text"
                            value={field.description}
                            onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                            className="w-full bg-slate-600 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Optional field description"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Create Template
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingTemplate(false)}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Templates List */}
          {templates.length === 0 && !isCreatingTemplate ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-xl text-slate-300 mb-2">No templates yet</p>
              <p className="text-slate-400 mb-6">Create custom templates for your world-building needs</p>
              <button
                onClick={() => setIsCreatingTemplate(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Create First Template
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <div key={template.id} className="bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition-colors duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{template.name}</h3>
                      <p className="text-slate-400 text-sm mb-3">{template.description}</p>
                      <div className="flex items-center space-x-2 mb-3">
                        {template.is_public ? (
                          <Globe className="h-4 w-4 text-green-400" />
                        ) : (
                          <Lock className="h-4 w-4 text-slate-400" />
                        )}
                        <span className="text-xs text-slate-400">
                          {template.template_schema.fields?.length || 0} fields
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTemplate(template);
                          setIsCreatingContent(true);
                          setContentForm(prev => ({ ...prev, template_id: template.id }));
                        }}
                        className="text-slate-400 hover:text-green-400 transition-colors duration-200"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="text-slate-400 hover:text-red-400 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {template.template_schema.fields?.slice(0, 3).map((field: any, index: number) => (
                      <div key={index} className="bg-slate-700 rounded px-2 py-1">
                        <span className="text-slate-300 text-sm">{field.name}</span>
                        <span className="text-slate-400 text-xs ml-2">({field.type})</span>
                        {field.required && <span className="text-red-400 text-xs ml-1">*</span>}
                      </div>
                    ))}
                    {template.template_schema.fields?.length > 3 && (
                      <div className="text-slate-400 text-xs">
                        +{template.template_schema.fields.length - 3} more fields
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <>
          {/* Create Content Form */}
          {isCreatingContent && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">
                Create Content {selectedTemplate && `from "${selectedTemplate.name}"`}
              </h3>
              <form onSubmit={handleContentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Template
                    </label>
                    <select
                      value={contentForm.template_id}
                      onChange={(e) => {
                        const template = templates.find(t => t.id === e.target.value);
                        setSelectedTemplate(template);
                        setContentForm(prev => ({ ...prev, template_id: e.target.value, content_data: {} }));
                      }}
                      className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Select template...</option>
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={contentForm.title}
                      onChange={(e) => setContentForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Campaign (optional)
                    </label>
                    <select
                      value={contentForm.campaign_id}
                      onChange={(e) => setContentForm(prev => ({ ...prev, campaign_id: e.target.value }))}
                      className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">General Content</option>
                      {campaigns.map(campaign => (
                        <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="content_is_private"
                      checked={!contentForm.is_private}
                      onChange={(e) => setContentForm(prev => ({ ...prev, is_private: !e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="content_is_private" className="text-slate-300">Make public</label>
                  </div>
                </div>

                {/* Dynamic Fields */}
                {selectedTemplate && selectedTemplate.template_schema.fields && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Template Fields</h4>
                    {selectedTemplate.template_schema.fields.map((field: any, index: number) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          {field.name}
                          {field.required && <span className="text-red-400 ml-1">*</span>}
                        </label>
                        {field.description && (
                          <p className="text-slate-400 text-xs mb-2">{field.description}</p>
                        )}
                        {renderContentField(field)}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={!selectedTemplate}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Create Content
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingContent(false);
                      setSelectedTemplate(null);
                      setContentForm({
                        template_id: '', title: '', campaign_id: '', is_private: true, content_data: {}
                      });
                    }}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Content List */}
          {userContent.length === 0 && !isCreatingContent ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-xl text-slate-300 mb-2">No content yet</p>
              <p className="text-slate-400 mb-6">Create content using your custom templates</p>
              <button
                onClick={() => setIsCreatingContent(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Create First Content
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userContent.map(content => {
                const template = templates.find(t => t.id === content.template_id);
                return (
                  <div key={content.id} className="bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition-colors duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{content.title}</h3>
                        <p className="text-slate-400 text-sm mb-2">
                          Template: {template?.name || 'Unknown'}
                        </p>
                        <div className="flex items-center space-x-2">
                          {content.is_private ? (
                            <Lock className="h-4 w-4 text-slate-400" />
                          ) : (
                            <Globe className="h-4 w-4 text-green-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => deleteUserContent(content.id)}
                          className="text-slate-400 hover:text-red-400 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {Object.entries(content.content_data).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="bg-slate-700 rounded px-2 py-1">
                          <span className="text-slate-400 text-xs">{key}:</span>
                          <span className="text-slate-300 text-sm ml-2">
                            {typeof value === 'string' ? value.substring(0, 50) : String(value)}
                            {typeof value === 'string' && value.length > 50 && '...'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Templates;