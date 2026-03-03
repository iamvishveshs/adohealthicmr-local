import { getDatabase } from '../db/init.js';

export async function findAll(moduleId, videoType) {
  const db = getDatabase();
  let sql = 'SELECT module_id, video_type, video_id, preview, file_name, file_size, file_url, uploaded_by FROM videos';
  const params = [];
  const conditions = [];
  if (moduleId != null) {
    conditions.push('module_id = ?');
    params.push(moduleId);
  }
  if (videoType) {
    conditions.push('video_type = ?');
    params.push(videoType);
  }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  const rows = await db.allAsync(sql, params);
  return rows.map((r) => ({
    moduleId: r.module_id,
    videoType: r.video_type,
    videoId: r.video_id,
    preview: r.preview,
    fileName: r.file_name,
    fileSize: r.file_size,
    fileUrl: r.file_url,
    uploadedBy: r.uploaded_by,
  }));
}

export async function create(data) {
  const db = getDatabase();
  const { moduleId, videoType, videoId, preview, fileName, fileSize, fileUrl, uploadedBy } = data;
  const existing = await db.getAsync(
    'SELECT id FROM videos WHERE module_id = ? AND video_type = ? AND video_id = ?',
    [moduleId, videoType, videoId]
  );
  if (existing) {
    await db.runAsync(
      'UPDATE videos SET preview = ?, file_name = ?, file_size = ?, file_url = ?, uploaded_by = ? WHERE id = ?',
      [preview || '', fileName || '', fileSize || 0, fileUrl || null, uploadedBy || null, existing.id]
    );
  } else {
    await db.runAsync(
      'INSERT INTO videos (module_id, video_type, video_id, preview, file_name, file_size, file_url, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [moduleId, videoType, videoId, preview || '', fileName || '', fileSize || 0, fileUrl || null, uploadedBy || null]
    );
  }
  return data;
}

export async function remove(moduleId, videoType, videoId) {
  const db = getDatabase();
  const result = await db.runAsync(
    'DELETE FROM videos WHERE module_id = ? AND video_type = ? AND video_id = ?',
    [moduleId, videoType, videoId]
  );
  return result.changes > 0;
}
