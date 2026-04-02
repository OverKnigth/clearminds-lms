import { useState, useEffect, useRef } from 'react';
import Modal from '@/shared/components/Modal';
import type { CourseData } from '../../domain/entities';
import { api } from '@/shared/services/api';
import { useDialog } from '@/shared/hooks/useDialog';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CourseFormData) => Promise<void>;
  course?: CourseData | null;
  tutors: Array<{ id: string; names: string; lastNames: string; email: string }>;
}

export interface CourseFormData {
  name: string;
  imageUrl: string;
  description: string;
  status: string;
  tutorIds: string[];
}

export function CourseFormModal({ isOpen, onClose, onSubmit, course, tutors }: CourseFormModalProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    imageUrl: '',
    description: '',
    status: 'active',
    tutorIds: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { dialog, close: closeDialog, showAlert } = useDialog();

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        imageUrl: course.imageUrl || '',
        description: course.description || '',
        status: course.status,
        tutorIds: course.tutorIds || []
      });
      setImagePreview(course.imageUrl || '');
    } else {
      setFormData({
        name: '',
        imageUrl: '',
        description: '',
        status: 'active',
        tutorIds: []
      });
      setImagePreview('');
    }
  }, [course, isOpen]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert('La imagen no debe superar los 5MB');
      return;
    }

    if (!formData.name || formData.name.trim() === '') {
      showAlert('Por favor ingresa el nombre del curso antes de subir la imagen');
      return;
    }

    try {
      setIsUploadingImage(true);
      const response = await api.uploadCourseImage(file, formData.name);
      if (response.success) {
        const publicUrl = response.data.imageUrl;
        setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
        setImagePreview(publicUrl);
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      showAlert('Error al subir la imagen: ' + (error.response?.data?.message || error.message));
      setImagePreview('');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting course:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTutor = (tutorId: string) => {
    setFormData(prev => ({
      ...prev,
      tutorIds: prev.tutorIds.includes(tutorId)
        ? prev.tutorIds.filter(id => id !== tutorId)
        : [...prev.tutorIds, tutorId]
    }));
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={course ? 'Editar Curso' : 'Crear Nuevo Curso'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Nombre del Curso</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="JavaScript Fundamentals"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Imagen del Curso</label>
            {!formData.name && (
              <p className="text-xs text-yellow-400 mb-2">⚠️ Primero ingresa el nombre del curso</p>
            )}
            <div className="space-y-3">
              {imagePreview && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-slate-700">
                  <img 
                    src={imagePreview}
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error loading image:', imagePreview);
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23334155" width="200" height="200"/%3E%3Ctext fill="%2394a3b8" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EError al cargar%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage || !formData.name}
                className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingImage ? 'Subiendo imagen...' : imagePreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
              </button>
              <p className="text-xs text-slate-400">
                Formatos: JPG, PNG, GIF, WEBP. Máximo 5MB
                <br />
                La imagen se guardará en: <span className="text-slate-300">{formData.name || 'nombre-del-curso'}/imagen.ext</span>
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Descripción del curso..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Estado</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tutores Asignados</label>
            <div className="max-h-48 overflow-y-auto bg-slate-700 border border-slate-600 rounded-lg p-3 space-y-2">
              {tutors.length === 0 ? (
                <p className="text-slate-400 text-sm">No hay tutores disponibles</p>
              ) : (
                tutors.map((tutor) => (
                  <label key={tutor.id} className="flex items-center gap-3 p-2 hover:bg-slate-600 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tutorIds.includes(tutor.id)}
                      onChange={() => toggleTutor(tutor.id)}
                      className="w-4 h-4 text-red-600 bg-slate-600 border-slate-500 rounded focus:ring-red-500"
                    />
                    <span className="text-white text-sm">{tutor.names} {tutor.lastNames}</span>
                    <span className="text-slate-400 text-xs ml-auto">{tutor.email}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : course ? 'Actualizar' : 'Crear Curso'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        danger={dialog.danger}
        onConfirm={dialog.onConfirm}
        onCancel={closeDialog}
      />
    </>
  );
}
