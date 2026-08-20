'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Trash2, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { GalleryPhoto } from '@/types'

const STORAGE_BUCKET = 'church-files'

interface AlbumPhotoManagerProps {
  albumId: string
  initialPhotos: GalleryPhoto[]
}

export default function AlbumPhotoManager({ albumId, initialPhotos }: AlbumPhotoManagerProps) {
  const router = useRouter()
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initialPhotos)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [urlDraft, setUrlDraft] = useState('')

  const supabase = createClient()

  const addPhoto = async (imageUrl: string) => {
    const { data, error: insertError } = await supabase
      .from('gallery_photos')
      .insert({
        album_id: albumId,
        image_url: imageUrl,
        sort_order: photos.length + 1,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      return
    }

    setPhotos((p) => [...p, data as GalleryPhoto])
    router.refresh()
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setBusy(true)
    setError('')

    for (const file of files) {
      const path = `gallery/${albumId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file)

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`)
        break
      }

      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
      await addPhoto(data.publicUrl)
    }

    setBusy(false)
    e.target.value = ''
  }

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlDraft.trim()) return
    setBusy(true)
    setError('')
    await addPhoto(urlDraft.trim())
    setUrlDraft('')
    setBusy(false)
  }

  const handleCaption = async (photo: GalleryPhoto, caption: string) => {
    setPhotos((p) => p.map((x) => (x.id === photo.id ? { ...x, caption_en: caption } : x)))
  }

  const saveCaption = async (photo: GalleryPhoto) => {
    const { error: updateError } = await supabase
      .from('gallery_photos')
      .update({ caption_en: photo.caption_en })
      .eq('id', photo.id)
    if (updateError) setError(updateError.message)
  }

  const handleDelete = async (photo: GalleryPhoto) => {
    if (!window.confirm('Delete this photo?')) return
    const { error: deleteError } = await supabase
      .from('gallery_photos')
      .delete()
      .eq('id', photo.id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setPhotos((p) => p.filter((x) => x.id !== photo.id))
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="card card-body space-y-4">
        <label className="flex items-center gap-2 border-2 border-dashed border-neutral-300 rounded-lg p-4 cursor-pointer hover:border-primary-400 transition-colors">
          {busy ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
          ) : (
            <Upload className="w-5 h-5 text-neutral-400" />
          )}
          <span className="text-sm text-neutral-600">
            {busy ? 'Uploading...' : 'Upload photos (you can select several at once)'}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={busy}
          />
        </label>

        <form onSubmit={handleAddUrl} className="flex gap-2">
          <input
            type="url"
            className="input flex-1"
            placeholder="...or paste an image URL"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            aria-label="Image URL"
          />
          <button type="submit" disabled={busy} className="btn btn-outline btn-sm">
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
        )}
      </div>

      {photos.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="card overflow-hidden">
              <div className="aspect-square bg-neutral-100">
                <img src={photo.image_url} alt={photo.caption_en || ''} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 space-y-2">
                <input
                  className="input py-2 min-h-0 text-sm"
                  placeholder="Caption"
                  value={photo.caption_en || ''}
                  onChange={(e) => handleCaption(photo, e.target.value)}
                  onBlur={() => saveCaption(photo)}
                  aria-label="Photo caption"
                />
                <button
                  onClick={() => handleDelete(photo)}
                  className="flex items-center gap-1 text-xs text-red-600 hover:underline"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 text-center py-12">No photos in this album yet.</p>
      )}
    </div>
  )
}
