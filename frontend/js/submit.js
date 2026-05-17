document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const params = new URLSearchParams(window.location.search);
  const milestoneId = params.get('milestone');

  if (!milestoneId) {
    showToast('No milestone selected', 'error');
    setTimeout(() => window.location.href = '/outcomes.html', 1500);
    return;
  }

  const form = document.getElementById('submitForm');
  if (!form) return;

  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  const fileList = document.getElementById('fileList');
  let uploadedFiles = [];

  if (uploadArea && fileInput) {
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));
  }

  function handleFiles(files) {
    Array.from(files).forEach(file => {
      if (file.size > 50 * 1024 * 1024) {
        showToast(`${file.name} is too large. Max 50MB`, 'error');
        return;
      }
      uploadedFiles.push(file.name);
      if (fileList) {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
          <span>${file.name}</span>
          <span>${(file.size / 1024).toFixed(1)} KB</span>
          <button type="button" onclick="this.parentElement.remove()">Remove</button>
        `;
        fileList.appendChild(item);
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const githubLink = document.getElementById('githubLink')?.value.trim();
    const videoLink = document.getElementById('videoLink')?.value.trim();
    const notes = document.getElementById('notes')?.value.trim();

    if (!githubLink) {
      showToast('GitHub link is required', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
    }

    try {
      await apiFetch(`/milestones/${milestoneId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          github_link: githubLink,
          video_link: videoLink,
          student_notes: notes,
          files: uploadedFiles
        })
      });

      showToast('Milestone submitted successfully!');
      setTimeout(() => window.location.href = '/outcomes.html', 1500);

    } catch (err) {
      showToast(err.message || 'Submission failed', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit milestone';
      }
    }
  });
});