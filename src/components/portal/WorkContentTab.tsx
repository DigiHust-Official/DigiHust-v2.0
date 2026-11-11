import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Upload,
  Link as LinkIcon,
  Check,
  X,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { Project, GalleryItem, PROJECTS, toSlug, normalizeProject } from '../../data/workProjects';
import { SiteContent } from '../../types';

interface WorkContentTabProps {
  siteContent: SiteContent;
  updateSiteContent: (section: keyof SiteContent | Partial<SiteContent>, data?: any) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  uploadAssetSafely: (file: File, folder?: string) => Promise<string | null>;
}

const CATEGORY_PRESETS = [
  'Web Development',
  'Creative & Branding',
  'AI & Data Solutions',
  'AI Solutions & Automation',
  'Creative & UI/UX',
  'Cybersecurity & Auditing',
];

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const WorkContentTab: React.FC<WorkContentTabProps> = ({
  siteContent,
  updateSiteContent,
  showToast,
  uploadAssetSafely,
}) => {
  // Use existing workProjects or seed from PROJECTS
  const currentProjects: Project[] =
    siteContent.workProjects && siteContent.workProjects.length > 0
      ? siteContent.workProjects.map((p, idx) => normalizeProject(p, idx))
      : PROJECTS.map((p, idx) => normalizeProject(p, idx));

  const [projectsList, setProjectsList] = useState<Project[]>(currentProjects);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [slugCustomized, setSlugCustomized] = useState(false);
  const [cardImageMode, setCardImageMode] = useState<'upload' | 'url'>('url');
  const [cardImageInputUrl, setCardImageInputUrl] = useState('');
  const [isUploadingCardImg, setIsUploadingCardImg] = useState(false);
  const [cardImgUploadError, setCardImgUploadError] = useState<string | null>(null);
  const [urlValidationError, setUrlValidationError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);

  // Gallery item form state for adding new gallery image
  const [showAddGallery, setShowAddGallery] = useState(false);
  const [galleryImgMode, setGalleryImgMode] = useState<'upload' | 'url'>('url');
  const [newGallerySrc, setNewGallerySrc] = useState('');
  const [newGalleryAlt, setNewGalleryAlt] = useState('');
  const [newGalleryCaption, setNewGalleryCaption] = useState('');
  const [isUploadingGalleryImg, setIsUploadingGalleryImg] = useState(false);
  const [galleryUploadError, setGalleryUploadError] = useState<string | null>(null);

  // Sync with prop updates if not actively editing
  React.useEffect(() => {
    if (!editingProject) {
      if (siteContent.workProjects && siteContent.workProjects.length > 0) {
        setProjectsList(siteContent.workProjects.map((p, idx) => normalizeProject(p, idx)));
      } else {
        setProjectsList(PROJECTS.map((p, idx) => normalizeProject(p, idx)));
      }
    }
  }, [siteContent.workProjects, editingProject]);

  const saveToCMS = (updated: Project[]) => {
    const sorted = [...updated].map((p, idx) => ({ ...p, order: idx }));
    setProjectsList(sorted);
    updateSiteContent('workProjects', sorted);
  };

  // Reordering
  const moveProject = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projectsList.length) return;
    const nextList = [...projectsList];
    const [moved] = nextList.splice(index, 1);
    nextList.splice(targetIndex, 0, moved);
    saveToCMS(nextList);
    showToast(`Project moved ${direction}`, 'info');
  };

  // Published toggle
  const togglePublished = (projectId: string) => {
    const nextList = projectsList.map((p) =>
      p.id === projectId ? { ...p, published: !p.published } : p
    );
    saveToCMS(nextList);
    showToast('Project visibility updated', 'success');
  };

  // Delete
  const handleDelete = (projectId: string) => {
    const nextList = projectsList.filter((p) => p.id !== projectId);
    saveToCMS(nextList);
    setDeleteConfirmId(null);
    showToast('Project deleted successfully', 'success');
  };

  // Start Create
  const handleAddNew = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      slug: '',
      category: 'Web Development',
      title: '',
      shortDescription: '',
      cardImage: {
        src: '',
        alt: '',
      },
      previewUrl: '',
      published: true,
      order: projectsList.length,
      caseStudy: undefined,
      client: '',
      description: '',
      filterCat: 'Development',
      challenge: '',
      solution: '',
      results: [],
      tags: [],
      img: '',
    };
    setEditingProject(newProj);
    setIsNewProject(true);
    setSlugCustomized(false);
    setCardImageMode('url');
    setCardImageInputUrl('');
    setCardImgUploadError(null);
    setUrlValidationError(null);
    setSlugError(null);
    setShowAddGallery(false);
  };

  // Start Edit
  const handleStartEdit = (proj: Project) => {
    setEditingProject({
      ...proj,
      cardImage: { ...proj.cardImage },
      caseStudy: proj.caseStudy
        ? {
            ...proj.caseStudy,
            gallery: proj.caseStudy.gallery ? [...proj.caseStudy.gallery] : [],
          }
        : undefined,
    });
    setIsNewProject(false);
    setSlugCustomized(true);
    setCardImageMode('url');
    setCardImageInputUrl(proj.cardImage?.src || proj.img || '');
    setCardImgUploadError(null);
    setUrlValidationError(null);
    setSlugError(null);
    setShowAddGallery(false);
  };

  // File Upload handler with validation (jpg, png, webp only, max 5MB)
  const handleFileUpload = async (
    file: File,
    onSuccess: (url: string) => void,
    onError: (err: string) => void,
    setUploading: (b: boolean) => void
  ) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      onError('Invalid format. Accepted: JPG, PNG, and WebP only.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      onError(`File exceeds 5 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      return;
    }

    onError('');
    setUploading(true);
    try {
      const uploadedUrl = await uploadAssetSafely(file, 'work');
      if (uploadedUrl) {
        onSuccess(uploadedUrl);
      } else {
        onError('Upload failed. Please check network or paste image URL.');
      }
    } catch (err: any) {
      onError(err?.message || 'Error uploading file.');
    } finally {
      setUploading(false);
    }
  };

  // Save Project Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    // 1. Title validation
    if (!editingProject.title.trim()) {
      showToast('Project title is required.', 'error');
      return;
    }

    // 2. Slug validation
    const candidateSlug = (editingProject.slug || toSlug(editingProject.title)).trim();
    if (!candidateSlug) {
      setSlugError('Slug is required.');
      showToast('Slug is required.', 'error');
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidateSlug)) {
      setSlugError('Slug must contain only lowercase letters, numbers, and single hyphens.');
      showToast('Invalid slug format.', 'error');
      return;
    }
    const duplicate = projectsList.some(
      (p) => p.slug === candidateSlug && p.id !== editingProject.id
    );
    if (duplicate) {
      setSlugError(`Slug "${candidateSlug}" is already used by another project.`);
      showToast('Slug must be unique.', 'error');
      return;
    }

    // 3. Short Description validation
    if (editingProject.shortDescription.length > 140) {
      showToast('Short description cannot exceed 140 characters.', 'error');
      return;
    }

    // 4. Preview URL validation
    if (
      editingProject.previewUrl &&
      editingProject.previewUrl.trim() !== '' &&
      !editingProject.previewUrl.startsWith('https://')
    ) {
      setUrlValidationError('Preview URL must begin with https://');
      showToast('Preview URL must be https://', 'error');
      return;
    }

    // 4b. Client Rating validation (0.5 to 5, step 0.5)
    if (
      editingProject.clientRating !== undefined &&
      editingProject.clientRating !== null &&
      !isNaN(editingProject.clientRating)
    ) {
      if (editingProject.clientRating < 0.5 || editingProject.clientRating > 5) {
        showToast('Client rating must be between 0.5 and 5.', 'error');
        return;
      }
    }

    // 5. Card Image validation
    const cardImg = editingProject.cardImage?.src?.trim();
    if (!cardImg) {
      showToast('Card image is required.', 'error');
      return;
    }
    if (!cardImg.startsWith('https://') && !cardImg.startsWith('data:image/')) {
      showToast('Card image URL must begin with https://', 'error');
      return;
    }

    // 6. Case Study validation (if enabled)
    if (editingProject.caseStudy) {
      if (!editingProject.caseStudy.summary?.trim()) {
        showToast('Case study summary is required when case study is enabled.', 'error');
        return;
      }
      if (editingProject.caseStudy.summary.length > 280) {
        showToast('Case study summary cannot exceed 280 characters.', 'error');
        return;
      }
    }

    const finalizedProject: Project = {
      ...editingProject,
      slug: candidateSlug,
      img: cardImg,
      cardImage: {
        src: cardImg,
        alt: editingProject.cardImage?.alt || editingProject.title,
      },
      description: editingProject.shortDescription,
    };

    let updatedList: Project[];
    if (isNewProject) {
      updatedList = [...projectsList, finalizedProject];
    } else {
      updatedList = projectsList.map((p) =>
        p.id === finalizedProject.id ? finalizedProject : p
      );
    }

    saveToCMS(updatedList);
    setEditingProject(null);
    showToast(isNewProject ? 'New project added successfully!' : 'Project updated successfully!', 'success');
  };

  // Gallery Management Helpers
  const addGalleryItem = () => {
    if (!editingProject) return;
    if (!newGallerySrc.trim() || !newGallerySrc.startsWith('https://')) {
      setGalleryUploadError('Gallery image URL must begin with https://');
      return;
    }
    if (!newGalleryAlt.trim()) {
      setGalleryUploadError('Alt text is required for accessibility.');
      return;
    }

    const newItem: GalleryItem = {
      src: newGallerySrc.trim(),
      alt: newGalleryAlt.trim(),
      caption: newGalleryCaption.trim() || undefined,
    };

    const currentCS = editingProject.caseStudy || { summary: '' };
    const currentGallery = currentCS.gallery || [];

    setEditingProject({
      ...editingProject,
      caseStudy: {
        ...currentCS,
        gallery: [...currentGallery, newItem],
      },
    });

    setNewGallerySrc('');
    setNewGalleryAlt('');
    setNewGalleryCaption('');
    setGalleryUploadError(null);
    setShowAddGallery(false);
  };

  const removeGalleryItem = (index: number) => {
    if (!editingProject || !editingProject.caseStudy) return;
    const currentGallery = editingProject.caseStudy.gallery || [];
    const nextGallery = currentGallery.filter((_, i) => i !== index);
    setEditingProject({
      ...editingProject,
      caseStudy: {
        ...editingProject.caseStudy,
        gallery: nextGallery,
      },
    });
  };

  const moveGalleryItem = (index: number, direction: 'up' | 'down') => {
    if (!editingProject || !editingProject.caseStudy) return;
    const currentGallery = [...(editingProject.caseStudy.gallery || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentGallery.length) return;
    const [moved] = currentGallery.splice(index, 1);
    currentGallery.splice(targetIdx, 0, moved);
    setEditingProject({
      ...editingProject,
      caseStudy: {
        ...editingProject.caseStudy,
        gallery: currentGallery,
      },
    });
  };

  // ── Render: Edit / Create Modal ──
  if (editingProject) {
    const isUploadingAny = isUploadingCardImg || isUploadingGalleryImg;
    const hasCaseStudy = Boolean(editingProject.caseStudy);

    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <h3 className="font-display font-extrabold text-lg text-[var(--text-heading)]">
              {isNewProject ? 'Add New Portfolio Project' : `Edit: ${editingProject.title}`}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Configure 16:9 card layout, preview link, and dedicated case study detail page.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditingProject(null)}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-subtle)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveForm} className="space-y-6">
          {/* ── CARD ESSENTIALS ── */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[var(--brand-teal)]">
              1. Card Attributes (Homepage & Work Grid)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingProject.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditingProject((prev) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        title: val,
                        slug: slugCustomized ? prev.slug : toSlug(val),
                      };
                    });
                  }}
                  placeholder="e.g. Real-Estate Marketplace Portal"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--brand-teal)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                  Slug (Route: /work/[slug]) *
                </label>
                <input
                  type="text"
                  required
                  value={editingProject.slug}
                  onChange={(e) => {
                    setSlugCustomized(true);
                    setSlugError(null);
                    setEditingProject((prev) => prev ? { ...prev, slug: toSlug(e.target.value) } : null);
                  }}
                  placeholder="e.g. real-estate-marketplace-portal"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-page)] border text-sm text-[var(--text-heading)] focus:outline-none ${
                    slugError ? 'border-red-500' : 'border-[var(--border-subtle)] focus:border-[var(--brand-teal)]'
                  }`}
                />
                {slugError && <p className="text-xs text-red-500 mt-1">{slugError}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  required
                  value={editingProject.category}
                  onChange={(e) =>
                    setEditingProject((prev) => prev ? { ...prev, category: e.target.value } : null)
                  }
                  placeholder="e.g. Web Development"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--brand-teal)]"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {CATEGORY_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setEditingProject((prev) => prev ? { ...prev, category: preset } : null)
                      }
                      className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                  Preview URL (Optional, https:// only)
                </label>
                <input
                  type="url"
                  value={editingProject.previewUrl || ''}
                  onChange={(e) => {
                    setUrlValidationError(null);
                    setEditingProject((prev) => prev ? { ...prev, previewUrl: e.target.value } : null);
                  }}
                  placeholder="https://example.demo"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-page)] border text-sm text-[var(--text-heading)] focus:outline-none ${
                    urlValidationError ? 'border-red-500' : 'border-[var(--border-subtle)] focus:border-[var(--brand-teal)]'
                  }`}
                />
                {urlValidationError && (
                  <p className="text-xs text-red-500 mt-1">{urlValidationError}</p>
                )}
              </div>
            </div>

            {/* Client Name & Client Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                  Client Name (Optional)
                </label>
                <input
                  type="text"
                  value={editingProject.client || ''}
                  onChange={(e) =>
                    setEditingProject((prev) =>
                      prev ? { ...prev, client: e.target.value } : null
                    )
                  }
                  placeholder="e.g. Apex FinTech"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--brand-teal)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                  Client Rating (0.5 to 5, step 0.5)
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={
                    editingProject.clientRating !== undefined && editingProject.clientRating !== null
                      ? editingProject.clientRating
                      : ''
                  }
                  onChange={(e) => {
                    const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                    setEditingProject((prev) =>
                      prev ? { ...prev, clientRating: val } : null
                    );
                  }}
                  placeholder="e.g. 5.0"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--brand-teal)]"
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase text-[var(--text-muted)]">
                  Short Description (Max 140 chars) *
                </label>
                <span
                  className={`text-[11px] font-mono ${
                    editingProject.shortDescription.length > 140 ? 'text-red-500 font-bold' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {editingProject.shortDescription.length} / 140
                </span>
              </div>
              <textarea
                required
                rows={2}
                maxLength={140}
                value={editingProject.shortDescription}
                onChange={(e) =>
                  setEditingProject((prev) =>
                    prev ? { ...prev, shortDescription: e.target.value } : null
                  )
                }
                placeholder="High-performance property listing platform with interactive geospatial search..."
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--brand-teal)]"
              />
            </div>

            {/* Card Image (Upload or Paste URL) */}
            <div className="p-4 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase text-[var(--text-muted)]">
                  16:9 Card Image *
                </label>
                <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-[var(--bg-subtle)]">
                  <button
                    type="button"
                    onClick={() => setCardImageMode('url')}
                    className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ${
                      cardImageMode === 'url' ? 'bg-[var(--brand-teal)] text-white' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    Paste URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardImageMode('upload')}
                    className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ${
                      cardImageMode === 'upload' ? 'bg-[var(--brand-teal)] text-white' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    Upload File
                  </button>
                </div>
              </div>

              {cardImageMode === 'url' ? (
                <div>
                  <input
                    type="url"
                    value={cardImageInputUrl}
                    onChange={(e) => {
                      const u = e.target.value;
                      setCardImageInputUrl(u);
                      setEditingProject((prev) =>
                        prev
                          ? {
                              ...prev,
                              cardImage: { ...prev.cardImage, src: u },
                              img: u,
                            }
                          : null
                      );
                    }}
                    placeholder="https://images.unsplash.com/... (must start with https://)"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--brand-teal)]"
                  />
                </div>
              ) : (
                <div>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--brand-teal)] rounded-xl cursor-pointer bg-[var(--bg-surface)]">
                    {isUploadingCardImg ? (
                      <div className="flex items-center space-x-2 text-xs text-[var(--brand-teal)] font-bold">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading image (max 5 MB)...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-xs text-[var(--text-muted)] font-semibold">
                        <Upload className="w-4 h-4" />
                        <span>Choose JPG, PNG, or WebP (max 5 MB)</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      disabled={isUploadingCardImg}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(
                            file,
                            (url) => {
                              setCardImageInputUrl(url);
                              setEditingProject((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      cardImage: { ...prev.cardImage, src: url },
                                      img: url,
                                    }
                                  : null
                              );
                              showToast('Card image uploaded successfully!', 'success');
                            },
                            (err) => setCardImgUploadError(err),
                            setIsUploadingCardImg
                          );
                        }
                      }}
                    />
                  </label>
                  {cardImgUploadError && (
                    <p className="text-xs text-red-500 mt-1">{cardImgUploadError}</p>
                  )}
                </div>
              )}

              {/* Alt text & Live 16:9 Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[var(--text-muted)] mb-1">
                    Image Alt Text *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProject.cardImage?.alt || ''}
                    onChange={(e) =>
                      setEditingProject((prev) =>
                        prev
                          ? {
                              ...prev,
                              cardImage: { ...prev.cardImage, alt: e.target.value },
                            }
                          : null
                      )
                    }
                    placeholder="Short description for accessibility"
                    className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-heading)] focus:outline-none"
                  />
                </div>

                {editingProject.cardImage?.src && (
                  <div>
                    <span className="block text-[11px] font-bold uppercase text-[var(--text-muted)] mb-1">
                      16:9 Preview
                    </span>
                    <div className="aspect-[16/9] w-full max-w-[200px] rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-[#081620]">
                      <img
                        src={editingProject.cardImage.src}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Published Toggle */}
            <div className="flex items-center space-x-3 pt-2">
              <label className="flex items-center cursor-pointer select-none space-x-2">
                <input
                  type="checkbox"
                  checked={editingProject.published}
                  onChange={(e) =>
                    setEditingProject((prev) =>
                      prev ? { ...prev, published: e.target.checked } : null
                    )
                  }
                  className="rounded text-[var(--brand-teal)] focus:ring-0"
                />
                <span className="text-xs font-bold text-[var(--text-heading)]">
                  Published (Visible on public website)
                </span>
              </label>
            </div>
          </div>

          {/* ── CASE STUDY DETAIL SECTION ── */}
          <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-[var(--brand-teal)]">
                  2. Dedicated Case Study Page (/work/{editingProject.slug || 'slug'})
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  Enables the detailed case study narrative, results, and lightbox gallery.
                </p>
              </div>
              <label className="flex items-center cursor-pointer space-x-2">
                <input
                  type="checkbox"
                  checked={hasCaseStudy}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setEditingProject((prev) =>
                        prev
                          ? {
                              ...prev,
                              caseStudy: {
                                summary: prev.shortDescription || '',
                                challenge: '',
                                solution: '',
                                results: '',
                                gallery: [],
                              },
                            }
                          : null
                      );
                    } else {
                      setEditingProject((prev) => (prev ? { ...prev, caseStudy: undefined } : null));
                    }
                  }}
                  className="rounded text-[var(--brand-teal)]"
                />
                <span className="text-xs font-bold text-[var(--text-heading)]">
                  Enable Case Study Page
                </span>
              </label>
            </div>

            {hasCaseStudy && editingProject.caseStudy && (
              <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-subtle)]">
                {/* Summary */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase text-[var(--text-muted)]">
                      Case Study Summary (Max 280 chars) *
                    </label>
                    <span
                      className={`text-[11px] font-mono ${
                        (editingProject.caseStudy.summary || '').length > 280
                          ? 'text-red-500 font-bold'
                          : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {(editingProject.caseStudy.summary || '').length} / 280
                    </span>
                  </div>
                  <textarea
                    required
                    rows={3}
                    maxLength={280}
                    value={editingProject.caseStudy.summary}
                    onChange={(e) =>
                      setEditingProject((prev) => {
                        if (!prev || !prev.caseStudy) return null;
                        return {
                          ...prev,
                          caseStudy: { ...prev.caseStudy, summary: e.target.value },
                        };
                      })
                    }
                    placeholder="High-level narrative summary describing the business impact..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--brand-teal)]"
                  />
                </div>

                {/* Challenge */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                    The Challenge
                  </label>
                  <textarea
                    rows={3}
                    value={editingProject.caseStudy.challenge || ''}
                    onChange={(e) =>
                      setEditingProject((prev) => {
                        if (!prev || !prev.caseStudy) return null;
                        return {
                          ...prev,
                          caseStudy: { ...prev.caseStudy, challenge: e.target.value },
                        };
                      })
                    }
                    placeholder="Describe legacy bottlenecks, scaling hurdles, or client pain points..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--brand-teal)]"
                  />
                </div>

                {/* Solution */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                    The Solution
                  </label>
                  <textarea
                    rows={3}
                    value={editingProject.caseStudy.solution || ''}
                    onChange={(e) =>
                      setEditingProject((prev) => {
                        if (!prev || !prev.caseStudy) return null;
                        return {
                          ...prev,
                          caseStudy: { ...prev.caseStudy, solution: e.target.value },
                        };
                      })
                    }
                    placeholder="Describe the technical architecture, custom models, design systems delivered..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--brand-teal)]"
                  />
                </div>

                {/* Results */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                    The Results & Business Outcomes
                  </label>
                  <textarea
                    rows={3}
                    value={editingProject.caseStudy.results || ''}
                    onChange={(e) =>
                      setEditingProject((prev) => {
                        if (!prev || !prev.caseStudy) return null;
                        return {
                          ...prev,
                          caseStudy: { ...prev.caseStudy, results: e.target.value },
                        };
                      })
                    }
                    placeholder="Key metrics, latency improvements, revenue uplift, or conversion stats..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--brand-teal)]"
                  />
                </div>

                {/* Gallery Items */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-bold uppercase text-[var(--text-muted)]">
                      Case Study Lightbox Gallery ({editingProject.caseStudy.gallery?.length || 0} images)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddGallery(true)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--brand-teal)] text-white text-xs font-bold flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Image</span>
                    </button>
                  </div>

                  {/* Add Gallery Sub-Form */}
                  {showAddGallery && (
                    <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--brand-teal)]/40 space-y-3 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--text-heading)]">
                          Add Gallery Image
                        </span>
                        <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-[var(--bg-subtle)]">
                          <button
                            type="button"
                            onClick={() => setGalleryImgMode('url')}
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                              galleryImgMode === 'url'
                                ? 'bg-[var(--brand-teal)] text-white'
                                : 'text-[var(--text-muted)]'
                            }`}
                          >
                            Paste URL
                          </button>
                          <button
                            type="button"
                            onClick={() => setGalleryImgMode('upload')}
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                              galleryImgMode === 'upload'
                                ? 'bg-[var(--brand-teal)] text-white'
                                : 'text-[var(--text-muted)]'
                            }`}
                          >
                            Upload File
                          </button>
                        </div>
                      </div>

                      {galleryImgMode === 'url' ? (
                        <input
                          type="url"
                          value={newGallerySrc}
                          onChange={(e) => {
                            setGalleryUploadError(null);
                            setNewGallerySrc(e.target.value);
                          }}
                          placeholder="https://... (image URL)"
                          className="w-full px-3 py-2 rounded-lg bg-[var(--bg-page)] border border-[var(--border-subtle)] text-xs text-[var(--text-heading)]"
                        />
                      ) : (
                        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-[var(--border-subtle)] rounded-lg cursor-pointer bg-[var(--bg-page)]">
                          {isUploadingGalleryImg ? (
                            <span className="text-xs text-[var(--brand-teal)] font-bold flex items-center space-x-1">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Uploading...</span>
                            </span>
                          ) : (
                            <span className="text-xs text-[var(--text-muted)] font-semibold flex items-center space-x-1">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Choose JPG, PNG, WebP (max 5 MB)</span>
                            </span>
                          )}
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            disabled={isUploadingGalleryImg}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(
                                  file,
                                  (url) => {
                                    setNewGallerySrc(url);
                                    showToast('Gallery image uploaded!', 'success');
                                  },
                                  (err) => setGalleryUploadError(err),
                                  setIsUploadingGalleryImg
                                );
                              }
                            }}
                          />
                        </label>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={newGalleryAlt}
                          onChange={(e) => setNewGalleryAlt(e.target.value)}
                          placeholder="Alt text (required) *"
                          className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-page)] border border-[var(--border-subtle)] text-xs text-[var(--text-heading)]"
                        />
                        <input
                          type="text"
                          value={newGalleryCaption}
                          onChange={(e) => setNewGalleryCaption(e.target.value)}
                          placeholder="Caption (optional)"
                          className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-page)] border border-[var(--border-subtle)] text-xs text-[var(--text-heading)]"
                        />
                      </div>

                      {galleryUploadError && (
                        <p className="text-xs text-red-500">{galleryUploadError}</p>
                      )}

                      <div className="flex justify-end space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddGallery(false);
                            setGalleryUploadError(null);
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-semibold text-[var(--text-muted)]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isUploadingGalleryImg}
                          onClick={addGalleryItem}
                          className="px-3.5 py-1 rounded-lg bg-[var(--brand-teal)] text-white text-xs font-bold disabled:opacity-50"
                        >
                          Add to Gallery
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Gallery Items List */}
                  {editingProject.caseStudy.gallery &&
                  editingProject.caseStudy.gallery.length > 0 ? (
                    <div className="space-y-2">
                      {editingProject.caseStudy.gallery.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <img
                              src={item.src}
                              alt={item.alt}
                              className="w-16 aspect-[16/9] object-cover rounded-md bg-[#081620]"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[var(--text-heading)] truncate">
                                {item.alt}
                              </p>
                              {item.caption && (
                                <p className="text-[11px] text-[var(--text-muted)] truncate">
                                  {item.caption}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveGalleryItem(idx, 'up')}
                              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-heading)] disabled:opacity-30"
                              title="Move up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === (editingProject.caseStudy?.gallery?.length || 0) - 1}
                              onClick={() => moveGalleryItem(idx, 'down')}
                              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-heading)] disabled:opacity-30"
                              title="Move down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeGalleryItem(idx)}
                              className="p-1 rounded text-red-400 hover:text-red-500 hover:bg-red-500/10"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--text-muted)] italic">
                      No gallery images added yet. Click &quot;Add Image&quot; above.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setEditingProject(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploadingAny}
              className="px-5 py-2.5 rounded-xl bg-[var(--brand-teal)] hover:bg-[var(--brand-teal-hover)] text-white text-xs font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isUploadingAny ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading Asset...</span>
                </>
              ) : (
                <span>{isNewProject ? 'Create Project' : 'Save Project Changes'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── Render: Projects List ──
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[var(--border-subtle)] gap-3">
        <div>
          <h3 className="font-display font-extrabold text-lg text-[var(--text-heading)]">
            Work Projects & Case Studies Studio
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Manage 16:9 portfolio cards, sliding hover panels, preview links, and dedicated case study pages.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddNew}
          className="px-4 py-2 rounded-xl bg-[var(--brand-teal)] hover:bg-[var(--brand-teal-hover)] text-white text-xs font-bold shadow-md flex items-center space-x-1.5 w-fit cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Projects Table / Card List */}
      <div className="space-y-3">
        {projectsList.map((project, index) => {
          const hasCaseStudy = Boolean(
            project.caseStudy &&
            project.caseStudy.summary &&
            project.caseStudy.summary.trim().length > 0
          );
          const hasPreview = Boolean(project.previewUrl && project.previewUrl.trim().length > 0);

          return (
            <div
              key={project.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-subtle)] hover:border-[var(--brand-teal)]/40 transition-all gap-4"
            >
              <div className="flex items-center space-x-4 min-w-0">
                {/* 16:9 Thumbnail */}
                <div className="w-24 aspect-[16/9] rounded-xl overflow-hidden bg-[#081620] border border-[var(--border-subtle)] shrink-0">
                  <img
                    src={project.cardImage?.src || project.img}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-[var(--brand-teal)] uppercase tracking-wider">
                      {project.category}
                    </span>
                    {hasCaseStudy ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                        Case Study Active
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/10 text-[var(--text-muted)] border border-slate-500/20 font-semibold">
                        Card Only
                      </span>
                    )}
                    {hasPreview && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold flex items-center gap-1">
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>Preview Active</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-display font-bold text-sm text-[var(--text-heading)] truncate">
                    {project.title}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] truncate max-w-xl">
                    {project.shortDescription}
                  </p>
                  <p className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
                    /work/{project.slug}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between md:justify-end space-x-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--border-subtle)]">
                {/* Reorder Buttons */}
                <div className="flex items-center space-x-0.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveProject(index, 'up')}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-subtle)] disabled:opacity-20 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === projectsList.length - 1}
                    onClick={() => moveProject(index, 'down')}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-subtle)] disabled:opacity-20 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Published Toggle */}
                <button
                  type="button"
                  onClick={() => togglePublished(project.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    project.published
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-500/10 text-[var(--text-muted)] border border-slate-500/20'
                  }`}
                  title={project.published ? 'Published' : 'Hidden'}
                >
                  {project.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{project.published ? 'Published' : 'Draft'}</span>
                </button>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => handleStartEdit(project)}
                  className="p-2 rounded-xl text-[var(--text-heading)] bg-[var(--bg-subtle)] hover:bg-[var(--border-subtle)] cursor-pointer"
                  title="Edit Project"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Delete Button */}
                {deleteConfirmId === project.id ? (
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleDelete(project.id)}
                      className="px-2 py-1 rounded-lg bg-red-600 text-white text-[11px] font-bold"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2 py-1 rounded-lg bg-[var(--bg-subtle)] text-[var(--text-muted)] text-[11px]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(project.id)}
                    className="p-2 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
