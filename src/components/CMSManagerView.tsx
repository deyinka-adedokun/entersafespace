import React, { useState, useEffect } from 'react';
import { 
  CMSContent, 
  CMSContentType, 
  CMSWorkflowStatus 
} from '../types';
import { 
  FileText, 
  Plus, 
  Edit3, 
  CheckCircle, 
  Send, 
  Globe, 
  Eye, 
  Search, 
  Code, 
  Share2, 
  Sparkles,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  BookOpen,
  Award,
  Lock,
  Megaphone,
  Home,
  Bot
} from 'lucide-react';
import { useToast } from './ui/ToastContext';

export const CMSManagerView: React.FC = () => {
  const { showToast } = useToast();
  const [contents, setContents] = useState<CMSContent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Editor Modal state
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingContent, setEditingContent] = useState<Partial<CMSContent> | null>(null);

  // Inspector Modal state (renders canonical page + head tags + JSON-LD)
  const [inspectorItem, setInspectorItem] = useState<CMSContent | null>(null);

  // LLM / Machine Discoverability Tab active state
  const [activeSubTab, setActiveSubTab] = useState<'CONTENTS' | 'CANONICAL_ROUTES' | 'LLM_DISCOVERABILITY'>('CONTENTS');

  // Load CMS items
  const fetchContents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/cms/contents');
      const json = await res.json();
      if (json.success) {
        setContents(json.data.contents || []);
      }
    } catch (err) {
      console.error('Failed to load CMS contents', err);
      showToast('Error loading CMS contents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  // Filtered contents
  const filteredContents = contents.filter(item => {
    const matchesType = selectedType === 'ALL' || item.type === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  // Handle Workflow State Change
  const handleWorkflowTransition = async (id: string, targetStatus: CMSWorkflowStatus) => {
    try {
      const res = await fetch(`/api/v1/cms/contents/${id}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetStatus })
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Workflow status updated to ${targetStatus}`, 'success');
        fetchContents();
      } else {
        showToast(json.error?.message || 'Workflow transition failed', 'error');
      }
    } catch (err) {
      showToast('Failed to update workflow state', 'error');
    }
  };

  // Save or Create Content
  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContent?.title || !editingContent?.type || !editingContent?.content) {
      showToast('Title, type, and content body are required.', 'error');
      return;
    }

    try {
      const isNew = !editingContent.id;
      const url = isNew ? '/api/v1/cms/contents' : `/api/v1/cms/contents/${editingContent.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingContent)
      });
      const json = await res.json();

      if (json.success) {
        showToast(isNew ? 'New content created in DRAFT state' : 'Content updated successfully', 'success');
        setIsEditorOpen(false);
        setEditingContent(null);
        fetchContents();
      } else {
        showToast(json.error?.message || 'Save failed', 'error');
      }
    } catch (err) {
      showToast('Network error saving content', 'error');
    }
  };

  // Helper: Auto-generate Structured Data Schema
  const handleGenerateStructuredData = () => {
    if (!editingContent) return;
    const type = editingContent.type || 'HOMEPAGE';
    const title = editingContent.title || 'Safespace Page';
    const summary = editingContent.summary || '';

    let schema: object = {};

    switch (type) {
      case 'FAQ':
        schema = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": title,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": summary || "Safespace provides human emotional listening and peer companionship."
              }
            }
          ]
        };
        break;
      case 'ARTICLE':
        schema = {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": title,
          "description": summary,
          "author": {
            "@type": "Organization",
            "name": "Safespace Editorial"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Safespace",
            "logo": {
              "@type": "ImageObject",
              "url": "https://safespace.ng/icon.png"
            }
          }
        };
        break;
      case 'SAFETY_RESOURCE':
      case 'RESOURCE':
        schema = {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": title,
          "serviceType": "Non-clinical Emotional Support & Resources",
          "provider": {
            "@type": "Organization",
            "name": "Safespace"
          }
        };
        break;
      case 'HOMEPAGE':
      default:
        schema = {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Safespace",
          "url": "https://safespace.ng",
          "description": summary || "On-demand human emotional support marketplace in Nigeria.",
          "sameAs": ["https://twitter.com/safespaceng"]
        };
        break;
    }

    setEditingContent(prev => ({
      ...prev,
      structured_data: JSON.stringify(schema, null, 2)
    }));
    showToast('Structured data JSON-LD generated!', 'success');
  };

  // Get Content Type Icon & Badge
  const getTypeBadge = (type: CMSContentType) => {
    switch (type) {
      case 'HOMEPAGE':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200"><Home className="w-3 h-3" /> Homepage</span>;
      case 'FAQ':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200"><HelpCircle className="w-3 h-3" /> FAQ</span>;
      case 'ARTICLE':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F3F1EC] text-[#123B5D] border border-[#123B5D]/20"><BookOpen className="w-3 h-3" /> Article</span>;
      case 'RESOURCE':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200"><FileText className="w-3 h-3" /> Resource</span>;
      case 'SAFETY_RESOURCE':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200"><ShieldAlert className="w-3 h-3" /> Safety</span>;
      case 'PROVIDER_TRAINING':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200"><Award className="w-3 h-3" /> Training</span>;
      case 'LEGAL_PAGE':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F3F1EC] text-[#17212B] border border-[#E3E2DE]"><Lock className="w-3 h-3" /> Legal</span>;
      case 'ANNOUNCEMENT':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200"><Megaphone className="w-3 h-3" /> Announcement</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F3F1EC] text-[#59636B]">{type}</span>;
    }
  };

  // Get Workflow Status Badge
  const getStatusBadge = (status: CMSWorkflowStatus) => {
    switch (status) {
      case 'DRAFT':
        return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F3F1EC] text-[#59636B] border border-[#E3E2DE]">DRAFT</span>;
      case 'REVIEW':
        return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">IN REVIEW</span>;
      case 'APPROVED':
        return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">APPROVED</span>;
      case 'PUBLISHED':
        return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#123B5D]/10 text-[#123B5D] border border-[#123B5D]/20">PUBLISHED</span>;
      case 'ARCHIVED':
        return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E3E2DE] text-[#59636B] line-through">ARCHIVED</span>;
      default:
        return <span className="text-xs font-medium">{status}</span>;
    }
  };

  // Canonical Routes List
  const CANONICAL_ROUTES = [
    { route: '/safespace', label: 'Safespace Overview', type: 'HOMEPAGE', schema: 'Organization' },
    { route: '/how-it-works', label: 'How It Works & FAQ', type: 'FAQ', schema: 'FAQPage' },
    { route: '/emotional-support', label: 'Emotional Support', type: 'ARTICLE', schema: 'Article' },
    { route: '/listening-support', label: 'Listening Support', type: 'SERVICE', schema: 'Service' },
    { route: '/pricing', label: 'Pricing & Packages', type: 'HOMEPAGE', schema: 'Service' },
    { route: '/safety', label: 'Safety & Safeguarding', type: 'SAFETY_RESOURCE', schema: 'WebPage' },
    { route: '/privacy', label: 'Privacy Policy', type: 'LEGAL_PAGE', schema: 'WebPage' },
    { route: '/about', label: 'About Safespace', type: 'HOMEPAGE', schema: 'Organization' },
    { route: '/for-listeners', label: 'For Listeners & Training', type: 'PROVIDER_TRAINING', schema: 'WebPage' },
    { route: '/gift-a-conversation', label: 'Gift a Conversation', type: 'ANNOUNCEMENT', schema: 'Service' },
    { route: '/professional-support', label: 'Professional Escalation', type: 'SAFETY_RESOURCE', schema: 'Service' },
    { route: '/resources', label: 'Wellness Resources', type: 'RESOURCE', schema: 'Service' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header & Sub-Tabs */}
      <div className="bg-white p-6 rounded-2xl border border-[#E3E2DE]/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <Globe className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-[#17212B]">Content Management & SEO Hub</h2>
            </div>
            <p className="text-sm text-[#59636B] mt-1">
              Manage multi-type CMS content, editorial workflow, canonical SEO tags, JSON-LD schemas, and machine discoverability.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingContent({
                title: '',
                type: 'ARTICLE',
                status: 'DRAFT',
                content: '',
                summary: '',
                robots_directive: 'index, follow'
              });
              setIsEditorOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 text-white font-medium hover:bg-purple-800 transition-colors shadow-sm self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Create CMS Content
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[#F3F1EC] overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('CONTENTS')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              activeSubTab === 'CONTENTS'
                ? 'bg-purple-100 text-purple-900 font-semibold'
                : 'text-[#59636B] hover:bg-[#FAF9F6]'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            CMS Contents ({contents.length})
          </button>

          <button
            onClick={() => setActiveSubTab('CANONICAL_ROUTES')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              activeSubTab === 'CANONICAL_ROUTES'
                ? 'bg-purple-100 text-purple-900 font-semibold'
                : 'text-[#59636B] hover:bg-[#FAF9F6]'
            }`}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            Public Canonical Routes ({CANONICAL_ROUTES.length})
          </button>

          <button
            onClick={() => setActiveSubTab('LLM_DISCOVERABILITY')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              activeSubTab === 'LLM_DISCOVERABILITY'
                ? 'bg-purple-100 text-purple-900 font-semibold'
                : 'text-[#59636B] hover:bg-[#FAF9F6]'
            }`}
          >
            <Bot className="w-4 h-4 inline mr-2" />
            LLM Discoverability (/llms.txt)
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: CMS CONTENTS LIST */}
      {activeSubTab === 'CONTENTS' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E3E2DE]/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#59636B]" />
              <input
                type="text"
                placeholder="Search title, slug, summary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E3E2DE] text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#E3E2DE] text-xs font-medium text-[#59636B] bg-[#FAF9F6]"
              >
                <option value="ALL">All Content Types</option>
                <option value="HOMEPAGE">Homepage</option>
                <option value="FAQ">FAQ</option>
                <option value="ARTICLE">Article</option>
                <option value="RESOURCE">Resource</option>
                <option value="SAFETY_RESOURCE">Safety Resource</option>
                <option value="PROVIDER_TRAINING">Provider Training</option>
                <option value="LEGAL_PAGE">Legal Page</option>
                <option value="ANNOUNCEMENT">Announcement</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#E3E2DE] text-xs font-medium text-[#59636B] bg-[#FAF9F6]"
              >
                <option value="ALL">All Workflow States</option>
                <option value="DRAFT">DRAFT</option>
                <option value="REVIEW">REVIEW</option>
                <option value="APPROVED">APPROVED</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          {/* List Table */}
          <div className="bg-white rounded-2xl border border-[#E3E2DE]/80 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-[#59636B] text-sm">Loading CMS database...</div>
            ) : filteredContents.length === 0 ? (
              <div className="p-12 text-center text-[#59636B]">
                <FileText className="w-10 h-10 mx-auto text-[#E3E2DE] mb-2" />
                <p className="font-medium text-[#17212B]">No CMS contents match your filter.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F3F1EC]">
                {filteredContents.map(item => (
                  <div key={item.id} className="p-5 hover:bg-[#FAF9F6] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getTypeBadge(item.type)}
                        {getStatusBadge(item.status)}
                        <span className="text-xs text-[#59636B] font-mono">/{item.slug}</span>
                      </div>

                      <h3 className="font-semibold text-[#17212B] text-base">{item.title}</h3>
                      <p className="text-xs text-[#59636B] line-clamp-2">{item.summary}</p>

                      <div className="flex items-center gap-4 text-[11px] text-[#59636B]">
                        <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
                        {item.authorName && <span>Author: {item.authorName}</span>}
                        {item.robots_directive && (
                          <span className="font-mono bg-[#F3F1EC] px-1.5 py-0.5 rounded text-[#59636B]">
                            robots: {item.robots_directive}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
                      <button
                        onClick={() => setInspectorItem(item)}
                        className="px-3 py-1.5 rounded-lg border border-[#E3E2DE] bg-white text-xs font-medium text-[#59636B] hover:bg-[#FAF9F6] flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#59636B]" />
                        Preview Head & SEO
                      </button>

                      <button
                        onClick={() => {
                          setEditingContent(item);
                          setIsEditorOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-xs font-medium text-purple-700 hover:bg-purple-100 flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>

                      {/* Workflow state quick actions */}
                      <div className="flex items-center gap-1 bg-[#F3F1EC] p-1 rounded-lg">
                        {item.status === 'DRAFT' && (
                          <button
                            onClick={() => handleWorkflowTransition(item.id, 'REVIEW')}
                            className="px-2 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 rounded"
                            title="Submit for editorial review"
                          >
                            Submit Review
                          </button>
                        )}

                        {item.status === 'REVIEW' && (
                          <button
                            onClick={() => handleWorkflowTransition(item.id, 'APPROVED')}
                            className="px-2 py-1 text-[11px] font-semibold text-blue-800 hover:bg-blue-100 rounded"
                            title="Approve content"
                          >
                            Approve
                          </button>
                        )}

                        {item.status === 'APPROVED' && (
                          <button
                            onClick={() => handleWorkflowTransition(item.id, 'PUBLISHED')}
                            className="px-2 py-1 text-[11px] font-semibold text-[#123B5D] hover:bg-[#123B5D]/10 rounded"
                            title="Publish content publicly"
                          >
                            Publish Live
                          </button>
                        )}

                        {item.status === 'PUBLISHED' && (
                          <button
                            onClick={() => handleWorkflowTransition(item.id, 'ARCHIVED')}
                            className="px-2 py-1 text-[11px] font-semibold text-[#59636B] hover:bg-[#E3E2DE] rounded"
                            title="Archive content"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PUBLIC CANONICAL ROUTES EXPLORER */}
      {activeSubTab === 'CANONICAL_ROUTES' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E3E2DE]/80 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-[#17212B] text-lg">Public Canonical Routes</h3>
            <p className="text-xs text-[#59636B]">
              Verified public routes configured for sitemap inclusion, canonical tags, and structured data schemas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {CANONICAL_ROUTES.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-[#E3E2DE] bg-[#FAF9F6] space-y-2 hover:border-purple-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {item.route}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#E3E2DE] text-[#59636B]">
                    Schema: {item.schema}
                  </span>
                </div>
                
                <h4 className="font-semibold text-[#17212B] text-sm">{item.label}</h4>
                <p className="text-xs text-[#59636B]">Canonical: <code className="text-[#59636B]">https://safespace.ng{item.route}</code></p>
                
                <div className="pt-2 flex items-center justify-between border-t border-[#E3E2DE]/60 text-xs">
                  <span className="text-[#123B5D] font-medium">robots: index, follow</span>
                  <a
                    href={item.route}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-purple-700 font-medium hover:underline"
                  >
                    Visit <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LLM & MACHINE DISCOVERABILITY */}
      {activeSubTab === 'LLM_DISCOVERABILITY' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E3E2DE]/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#17212B] text-lg flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-700" />
                  Machine-Readable Discovery Endpoint (/llms.txt)
                </h3>
                <p className="text-xs text-[#59636B]">
                  Transparent, factual platform summary formatted for AI search engines and crawler agents without unverified claims.
                </p>
              </div>

              <a
                href="/llms.txt"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-xs font-semibold text-purple-800 hover:bg-purple-100 flex items-center gap-1.5"
              >
                View Live /llms.txt <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <pre className="p-4 rounded-xl bg-[#17212B] text-[#F3F1EC] text-xs font-mono overflow-x-auto leading-relaxed border border-[#17212B] max-h-80">
{`# SAFESPACE
Tagline: On-demand Human Emotional Listening & Companionship Marketplace
Category: Human Emotional Support Platform
Primary Market: Nigeria & Africa
Canonical Website: https://safespace.ng

## What Safespace Is
Safespace is a Progressive Web Application (PWA) facilitating on-demand, one-to-one human emotional listening and companionship. Support Seekers connect privately with verified peer Listeners without clinical barriers or judgment.

## What Safespace Does NOT Provide
Safespace does NOT provide medical diagnosis, psychotherapy, psychiatric treatment, emergency medical care, or clinical crisis intervention. Safespace is a non-clinical human listening marketplace.`}
            </pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* robots.txt inspector */}
            <div className="bg-white p-6 rounded-2xl border border-[#E3E2DE]/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#17212B] text-base">robots.txt</h4>
                <a href="/robots.txt" target="_blank" rel="noreferrer" className="text-xs font-medium text-purple-700 hover:underline flex items-center gap-1">
                  View <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-[#59636B]">Controls search engine indexation and points to sitemap.xml.</p>
              <pre className="p-3 bg-[#FAF9F6] rounded-xl text-xs font-mono border border-[#E3E2DE] text-[#17212B]">
{`User-agent: *
Allow: /
Allow: /safespace
Allow: /how-it-works
Allow: /pricing
Disallow: /api/
Disallow: /admin/
Sitemap: https://safespace.ng/sitemap.xml`}
              </pre>
            </div>

            {/* sitemap.xml inspector */}
            <div className="bg-white p-6 rounded-2xl border border-[#E3E2DE]/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#17212B] text-base">sitemap.xml</h4>
                <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="text-xs font-medium text-purple-700 hover:underline flex items-center gap-1">
                  View XML <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-[#59636B]">Dynamically generated XML listing canonical URLs & published CMS articles.</p>
              <pre className="p-3 bg-[#FAF9F6] rounded-xl text-xs font-mono border border-[#E3E2DE] text-[#17212B]">
{`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://safespace.ng/safespace</loc></url>
  <url><loc>https://safespace.ng/how-it-works</loc></url>
</urlset>`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* EDITOR MODAL */}
      {isEditorOpen && editingContent && (
        <div className="fixed inset-0 z-50 bg-[#17212B]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-[#E3E2DE] my-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E3E2DE] flex items-center justify-between bg-[#FAF9F6]">
              <h3 className="font-bold text-[#17212B] text-lg">
                {editingContent.id ? 'Edit CMS Content & SEO' : 'Create New CMS Content'}
              </h3>
              <button
                onClick={() => {
                  setIsEditorOpen(false);
                  setEditingContent(null);
                }}
                className="text-[#59636B] hover:text-[#59636B] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContent} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Primary Content Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900">1. Basic Content Details</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#59636B] mb-1">Content Title *</label>
                    <input
                      type="text"
                      required
                      value={editingContent.title || ''}
                      onChange={(e) => setEditingContent(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Active Listening Foundations"
                      className="w-full px-3 py-2 rounded-xl border border-[#E3E2DE] text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#59636B] mb-1">Content Type *</label>
                    <select
                      value={editingContent.type || 'ARTICLE'}
                      onChange={(e) => setEditingContent(prev => ({ ...prev, type: e.target.value as CMSContentType }))}
                      className="w-full px-3 py-2 rounded-xl border border-[#E3E2DE] text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                    >
                      <option value="HOMEPAGE">Homepage</option>
                      <option value="FAQ">FAQ</option>
                      <option value="ARTICLE">Article</option>
                      <option value="RESOURCE">Resource</option>
                      <option value="SAFETY_RESOURCE">Safety Resource</option>
                      <option value="PROVIDER_TRAINING">Provider Training</option>
                      <option value="LEGAL_PAGE">Legal Page</option>
                      <option value="ANNOUNCEMENT">Announcement</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#59636B] mb-1">URL Slug</label>
                    <input
                      type="text"
                      value={editingContent.slug || ''}
                      onChange={(e) => setEditingContent(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="auto-generated-if-empty"
                      className="w-full px-3 py-2 rounded-xl border border-[#E3E2DE] text-sm font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#59636B] mb-1">Workflow State</label>
                    <select
                      value={editingContent.status || 'DRAFT'}
                      onChange={(e) => setEditingContent(prev => ({ ...prev, status: e.target.value as CMSWorkflowStatus }))}
                      className="w-full px-3 py-2 rounded-xl border border-[#E3E2DE] text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-semibold"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="REVIEW">REVIEW</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#59636B] mb-1">Short Summary / Abstract</label>
                  <textarea
                    rows={2}
                    value={editingContent.summary || ''}
                    onChange={(e) => setEditingContent(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Brief description used in cards and search summaries..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E3E2DE] text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#59636B] mb-1">Main Body Content (Markdown supported) *</label>
                  <textarea
                    rows={6}
                    required
                    value={editingContent.content || ''}
                    onChange={(e) => setEditingContent(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="# Article Heading&#10;&#10;Write main content here..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E3E2DE] text-sm font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* SEO Fields Section */}
              <div className="space-y-4 pt-4 border-t border-[#E3E2DE]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900">2. SEO & Head Meta Tag Settings</h4>
                  <button
                    type="button"
                    onClick={handleGenerateStructuredData}
                    className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 text-xs font-semibold hover:bg-purple-200 flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Auto-Generate Schema
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#59636B] mb-1">seo_title</label>
                    <input
                      type="text"
                      value={editingContent.seo_title || ''}
                      onChange={(e) => setEditingContent(prev => ({ ...prev, seo_title: e.target.value }))}
                      placeholder="Title for search engine results..."
                      className="w-full px-3 py-2 rounded-xl border border-[#E3E2DE] text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#59636B] mb-1">canonical_url</label>
                    <input
                      type="text"
                      value={editingContent.canonical_url || ''}
                      onChange={(e) => setEditingContent(prev => ({ ...prev, canonical_url: e.target.value }))}
                      placeholder="https://safespace.ng/..."
                      className="w-full px-3 py-2 rounded-xl border border-[#E3E2DE] text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#59636B] mb-1">meta_description</label>
                  <textarea
                    rows={2}
                    value={editingContent.meta_description || ''}
                    onChange={(e) => setEditingContent(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="Search engine meta description tag..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E3E2DE] text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#59636B] mb-1">og_title (OpenGraph)</label>
                    <input
                      type="text"
                      value={editingContent.og_title || ''}
                      onChange={(e) => setEditingContent(prev => ({ ...prev, og_title: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-[#E3E2DE] text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#59636B] mb-1">robots_directive</label>
                    <input
                      type="text"
                      value={editingContent.robots_directive || 'index, follow'}
                      onChange={(e) => setEditingContent(prev => ({ ...prev, robots_directive: e.target.value }))}
                      placeholder="e.g. index, follow or noindex, follow"
                      className="w-full px-3 py-2 rounded-xl border border-[#E3E2DE] text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#59636B] mb-1">structured_data (JSON-LD Payload)</label>
                  <textarea
                    rows={4}
                    value={editingContent.structured_data || ''}
                    onChange={(e) => setEditingContent(prev => ({ ...prev, structured_data: e.target.value }))}
                    placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "Article"\n}`}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3E2DE] text-xs font-mono bg-[#17212B] text-[#123B5D] focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-[#E3E2DE] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E3E2DE] text-[#59636B] font-medium text-sm hover:bg-[#FAF9F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-700 text-white font-medium text-sm hover:bg-purple-800 shadow-sm"
                >
                  Save CMS Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEAD META & PUBLIC PREVIEW INSPECTOR MODAL */}
      {inspectorItem && (
        <div className="fixed inset-0 z-50 bg-[#17212B]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-[#E3E2DE] my-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E3E2DE] flex items-center justify-between bg-purple-900 text-white">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-300" />
                <h3 className="font-bold text-lg">SEO & Head Tag Inspector</h3>
              </div>
              <button
                onClick={() => setInspectorItem(null)}
                className="text-purple-300 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <h4 className="font-bold text-[#17212B] text-sm mb-1">{inspectorItem.title}</h4>
                <p className="text-[#59636B]">Canonical Slug: <code className="text-purple-800 font-mono">/{inspectorItem.slug}</code></p>
              </div>

              <div className="space-y-3 bg-[#17212B] text-[#F3F1EC] p-4 rounded-xl font-mono">
                <div className="text-[#59636B] font-bold border-b border-[#17212B] pb-1 text-[11px]">
                  &lt;head&gt; Rendered Tags
                </div>

                <div>
                  <span className="text-purple-400">&lt;title&gt;</span>
                  {inspectorItem.seo_title || inspectorItem.title}
                  <span className="text-purple-400">&lt;/title&gt;</span>
                </div>

                <div>
                  <span className="text-[#123B5D]">{'<link rel="canonical" href="'}</span>
                  {inspectorItem.canonical_url || `https://safespace.ng/${inspectorItem.slug}`}
                  <span className="text-[#123B5D]">{'"/>'}</span>
                </div>

                <div>
                  <span className="text-amber-400">{'<meta name="description" content="'}</span>
                  {inspectorItem.meta_description || inspectorItem.summary}
                  <span className="text-amber-400">{'"/>'}</span>
                </div>

                <div>
                  <span className="text-blue-400">{'<meta name="robots" content="'}</span>
                  {inspectorItem.robots_directive || 'index, follow'}
                  <span className="text-blue-400">{'"/>'}</span>
                </div>

                {inspectorItem.structured_data && (
                  <div className="pt-2 border-t border-[#17212B]">
                    <span className="text-purple-300">{'<script type="application/ld+json">'}</span>
                    <pre className="text-[#123B5D]/30 text-[10px] mt-1 whitespace-pre-wrap">
                      {inspectorItem.structured_data}
                    </pre>
                    <span className="text-purple-300">{'</script>'}</span>
                  </div>
                )}

              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E3E2DE] space-y-2">
                <h5 className="font-bold text-[#17212B] text-xs">Page Render Summary</h5>
                <p className="text-[#59636B] leading-relaxed text-xs">{inspectorItem.summary}</p>
              </div>
            </div>

            <div className="p-4 border-t border-[#E3E2DE] bg-[#FAF9F6] text-right">
              <button
                onClick={() => setInspectorItem(null)}
                className="px-4 py-2 rounded-xl bg-[#17212B] text-white font-medium text-xs hover:bg-[#17212B]"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
