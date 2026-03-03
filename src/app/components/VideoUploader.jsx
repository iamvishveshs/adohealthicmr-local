'use client';

import { useState, useRef } from 'react';

/**
 * VideoUploader Component
 *
 * Direct Cloudinary video upload with:
 * - Local video preview
 * - Upload progress tracking
 * - Support for large files (250MB+)
 * - Uses unsigned preset "ml_default"
 * - Uploads to "videos/" folder
 */
export default function VideoUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'adohealth';
  const uploadPreset = 'adohealth_signed';
  const folder = 'videos';

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }

    // Validate file size (optional - Cloudinary can handle large files)
    const maxSize = 5 * 1024 * 1024 * 1024; // 5GB
    if (file.size > maxSize) {
      setError(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum of 5GB`);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setUploadResult(null);
    setUploadProgress(0);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Clean up preview URL on unmount
  const cleanupPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Handle upload to Cloudinary
  // Handle secure upload to Cloudinary
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      // 1. Get the signature from your API
      const timestamp = Math.round(new Date().getTime() / 1000);
      const paramsToSign = {
        timestamp: timestamp,
        folder: folder,
        upload_preset: 'adohealth_signed', // Create a SIGNED preset in Cloudinary settings
      };

      const signRes = await fetch('/api/sign-cloudinary', {
        method: 'POST',
        body: JSON.stringify({ paramsToSign }),
      });
      const { signature } = await signRes.json();

      // 2. Prepare FormData for Direct Upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);
      formData.append('upload_preset', 'adohealth_signed');

      // 3. XHR for Progress Tracking
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          setUploadResult(JSON.parse(xhr.responseText));
          setUploading(false);
        } else {
          setError('Upload failed. Check your Cloudinary Preset settings.');
          setUploading(false);
        }
      };

      xhr.send(formData);
    } catch (err) {
      setError('Failed to initiate secure upload.');
      setUploading(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    cleanupPreview();
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploading(false);
    setUploadProgress(0);
    setUploadResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get video URL from result
  const getVideoUrl = () => {
    if (!uploadResult) return null;
    return uploadResult.secure_url || uploadResult.url;
  };

  const videoUrl = getVideoUrl();

  return (
    <div className="video-uploader-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Video Uploader</h2>

      {/* File Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label
          htmlFor="video-file-input"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
        >
          {selectedFile ? 'Change Video File' : 'Select Video File'}
        </label>
        <input
          id="video-file-input"
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        {selectedFile && (
          <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            padding: '15px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '5px',
            color: '#c00',
            marginBottom: '20px',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Local Preview */}
      {previewUrl && !uploadResult && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Preview</h3>
          <video
            src={previewUrl}
            controls
            style={{
              width: '100%',
              maxHeight: '400px',
              borderRadius: '5px',
              backgroundColor: '#000',
            }}
          />
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && !uploadResult && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            style={{
              padding: '12px 24px',
              backgroundColor: uploading ? '#ccc' : '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            {uploading ? 'Uploading...' : 'Upload to Cloudinary'}
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Upload Progress:</span>
            <span style={{ fontWeight: 'bold' }}>{uploadProgress}%</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '30px',
              backgroundColor: '#e0e0e0',
              borderRadius: '15px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                  width: `${uploadProgress}%`,
                  height: '100%',
                  backgroundColor: '#0070f3',
                  transition: 'width 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
            >
              {uploadProgress}%
            </div>
          </div>
        </div>
      )}

      {/* Upload Result */}
      {uploadResult && (
        <div style={{ marginTop: '30px' }}>
          <div
            style={{
              padding: '20px',
              backgroundColor: '#e8f5e9',
              border: '1px solid #4caf50',
              borderRadius: '5px',
              marginBottom: '20px',
            }}
          >
            <h3 style={{ color: '#2e7d32', marginTop: 0 }}>✅ Upload Successful!</h3>
            <div style={{ marginTop: '15px' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Public ID:</strong> {uploadResult.public_id}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Video URL:</strong>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#0070f3', marginLeft: '10px', wordBreak: 'break-all' }}
                >
                  {videoUrl}
                </a>
              </div>
              {uploadResult.bytes && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>File Size:</strong> {(uploadResult.bytes / 1024 / 1024).toFixed(2)} MB
                </div>
              )}
              {uploadResult.duration && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>Duration:</strong> {uploadResult.duration.toFixed(2)} seconds
                </div>
              )}
              {uploadResult.width && uploadResult.height && (
                <div>
                  <strong>Resolution:</strong> {uploadResult.width} x {uploadResult.height}
                </div>
              )}
            </div>
          </div>

          {/* Uploaded Video Player */}
          {videoUrl && (
            <div style={{ marginTop: '20px' }}>
              <h3>Uploaded Video</h3>
              <video
                src={videoUrl}
                controls
                style={{
                  width: '100%',
                  maxHeight: '500px',
                  borderRadius: '5px',
                  backgroundColor: '#000',
                }}
              />
            </div>
          )}

          {/* Reset Button */}
          <button
            onClick={handleReset}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Upload Another Video
          </button>
        </div>
      )}
    </div>
  );
}