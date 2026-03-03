// Browser Console Script to Delete Modules 2-8
// Copy and paste this into your browser console while logged in as admin

(async function deleteModules2to8() {
  try {
    const modulesToDelete = [2, 3, 4, 5, 6, 7, 8];
    console.log(`🗑️  Deleting modules: ${modulesToDelete.join(', ')}...`);

    const response = await fetch('/api/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'delete',
        resource: 'modules',
        data: modulesToDelete,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Delete failed');
    }

    const result = await response.json();
    console.log(`✅ Successfully deleted ${result.result.deleted} modules`);
    console.log('📊 Full result:', result);
    
    // Reload the page to see changes
    if (confirm('Modules deleted successfully! Reload page to see changes?')) {
      window.location.reload();
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    alert('Error deleting modules: ' + error.message);
  }
})();
