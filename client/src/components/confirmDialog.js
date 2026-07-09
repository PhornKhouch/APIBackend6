// Reusable confirmation dialog backed by SweetAlert2 (loaded via CDN in
// index.html, exposed as the global `Swal`). Styled to match the app's dark
// theme. Returns a promise that resolves to true when the user confirms.
//
//   const ok = await confirmDelete({ title: 'Delete subject "Math"?' });
//   if (!ok) return;

const THEME = {
  background: 'var(--card)',
  color: 'var(--text)',
  customClass: {
    popup: 'swal-app',
    confirmButton: 'btn btn-danger',
    cancelButton: 'btn btn-secondary',
  },
  buttonsStyling: false,
};

export function confirmDialog({
  title = 'Are you sure?',
  text = '',
  icon = 'warning',
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
} = {}) {
  // Graceful fallback if the CDN failed to load.
  if (typeof window.Swal === 'undefined') {
    return Promise.resolve(window.confirm(`${title}\n\n${text}`.trim()));
  }

  return window.Swal.fire({
    ...THEME,
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: true,
  }).then((result) => result.isConfirmed);
}

// Convenience wrapper for destructive delete confirmations.
export function confirmDelete({ title, text } = {}) {
  return confirmDialog({
    title: title || 'Delete this record?',
    text: text || 'This action cannot be undone.',
    icon: 'warning',
    confirmButtonText: 'Delete',
  });
}
