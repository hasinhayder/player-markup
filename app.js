document.addEventListener('DOMContentLoaded', function() {
    const chapters = document.querySelectorAll('.chapter');
    const episodes = document.querySelectorAll('.episode');
    const contentDisplay = document.getElementById('content-display');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const completeBtn = document.getElementById('complete-btn');
    const bookmarkBtn = document.getElementById('bookmark-btn');
    const downloadBtn = document.getElementById('download-btn');
    const sidebar = document.getElementById('sidebar');
    const resizer = document.getElementById('sidebar-resizer');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');

    let currentEpisodeIndex = 0;
    const allEpisodes = Array.from(episodes);

    function loadContent(episode) {
        const contentType = episode.dataset.contentType;
        const resourceUrl = episode.dataset.resourceUrl;
        
        contentDisplay.innerHTML = ''; // Clear previous content

        if (contentType === 'video') {
            const contentSrc = episode.dataset.contentSrc;
            const videoTitle = episode.querySelector('h3').innerText;
            // Try to get a description from a data attribute or fallback to a default
            const videoDescription = episode.dataset.description || '';
            // Try to get a detailed notes id from a data attribute
            const notesId = episode.dataset.notesId;
            let notesHtml = '';
            if (notesId) {
                const notesTemplate = document.getElementById(notesId);
                if (notesTemplate) {
                    notesHtml = notesTemplate.innerHTML;
                }
            }
            contentDisplay.innerHTML = `
                <div>
                    <div class="video-container bg-black rounded-lg overflow-hidden shadow-lg">
                        <iframe src="${contentSrc}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                    <h2 class="text-2xl font-bold mt-6 mb-2 px-4 md:px-8">${videoTitle}</h2>
                    <div class="text-gray-600 text-base px-4 md:px-8 mb-6" id="video-description">${videoDescription}</div>
                    <div class="video-notes-section px-4 md:px-8 mb-8">
                        ${notesHtml}
                    </div>
                </div>
            `;
            // Ensure syntax highlighting for code blocks in video notes
            hljs.highlightAll();
        } else if (contentType === 'text') {
            const contentId = episode.dataset.contentId;
            const template = document.getElementById(contentId);
            if (template) {
                contentDisplay.innerHTML = template.innerHTML;
                // After adding the content, tell highlight.js to process it
                hljs.highlightAll();
            } else {
                contentDisplay.innerHTML = `<p class="p-8">Content not found.</p>`;
            }
        }

        // Update download link
        downloadBtn.href = resourceUrl;

        // Update active state in sidebar
        episodes.forEach(ep => ep.classList.remove('active'));
        episode.classList.add('active');
        
        // Update button states
        updateNavButtons();
        updateCompleteButton(episode);
        updateBookmarkButton(episode);
    }

    function updateNavButtons() {
        prevBtn.disabled = currentEpisodeIndex === 0;
        nextBtn.disabled = currentEpisodeIndex === allEpisodes.length - 1;
    }

    function updateCompleteButton(episode) {
        if (episode.classList.contains('completed')) {
            completeBtn.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Completed';
            completeBtn.classList.add('bg-green-100', 'text-green-700');
            completeBtn.classList.remove('border-green-500', 'text-green-600', 'hover:bg-green-50');
        } else {
            completeBtn.innerHTML = '<i class="far fa-check-circle mr-2"></i>Mark as Completed';
            completeBtn.classList.remove('bg-green-100', 'text-green-700');
            completeBtn.classList.add('border-green-500', 'text-green-600', 'hover:bg-green-50');
        }
    }
    
    function updateBookmarkButton(episode) {
        const mainBookmarkIcon = bookmarkBtn.querySelector('i');
        const sidebarBookmarkIcon = episode.querySelector('.fa-bookmark');

        if (episode.classList.contains('bookmarked')) {
            mainBookmarkIcon.classList.replace('far', 'fas');
            mainBookmarkIcon.classList.add('text-blue-600');
            sidebarBookmarkIcon.classList.replace('far', 'fas');
            sidebarBookmarkIcon.classList.add('text-blue-600');
        } else {
            mainBookmarkIcon.classList.replace('fas', 'far');
            mainBookmarkIcon.classList.remove('text-blue-600');
            sidebarBookmarkIcon.classList.replace('fas', 'far');
            sidebarBookmarkIcon.classList.remove('text-blue-600');
        }
    }

    // Chapter collapse functionality
    chapters.forEach(chapter => {
        const header = chapter.querySelector('.chapter-header');
        const icon = header.querySelector('i');
        header.addEventListener('click', () => {
            chapter.classList.toggle('open');
            // Explicitly set the icon class based on the 'open' state
            if (chapter.classList.contains('open')) {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            } else {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
        });
    });

    // Episode click functionality
    allEpisodes.forEach((episode, index) => {
        episode.addEventListener('click', (e) => {
            // Prevent toggling bookmark when clicking the main episode body
            if (e.target.closest('.fa-bookmark')) {
                return;
            }
            currentEpisodeIndex = index;
            loadContent(episode);
            closeSidebar(); // Hide sidebar on mobile after click
        });

        // Sidebar bookmark toggle
        const bookmarkIcon = episode.querySelector('.fa-bookmark');
        bookmarkIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent episode from loading again
            episode.classList.toggle('bookmarked');
            
            if(episode.classList.contains('active')) {
               updateBookmarkButton(episode);
            } else {
               if (episode.classList.contains('bookmarked')) {
                   bookmarkIcon.classList.replace('far', 'fas');
                   bookmarkIcon.classList.add('text-blue-600');
               } else {
                   bookmarkIcon.classList.replace('fas', 'far');
                   bookmarkIcon.classList.remove('text-blue-600');
               }
            }
        });
    });

    // Navigation button functionality
    prevBtn.addEventListener('click', () => {
        if (currentEpisodeIndex > 0) {
            currentEpisodeIndex--;
            loadContent(allEpisodes[currentEpisodeIndex]);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentEpisodeIndex < allEpisodes.length - 1) {
            currentEpisodeIndex++;
            loadContent(allEpisodes[currentEpisodeIndex]);
        }
    });

    // Control buttons functionality
    completeBtn.addEventListener('click', () => {
        const currentEpisode = allEpisodes[currentEpisodeIndex];
        currentEpisode.classList.toggle('completed');
        updateCompleteButton(currentEpisode);
    });

    bookmarkBtn.addEventListener('click', () => {
        const currentEpisode = allEpisodes[currentEpisodeIndex];
        currentEpisode.classList.toggle('bookmarked');
        updateBookmarkButton(currentEpisode);
    });

    // Hamburger menu and responsive sidebar
    const hamburgerBtn = document.getElementById('hamburger-btn');
    function isMobile() {
        return window.innerWidth <= 768;
    }
    function closeSidebar() {
        if (isMobile()) {
            sidebar.classList.remove('open');
        }
    }
    hamburgerBtn.addEventListener('click', function() {
        sidebar.classList.add('open');
    });
    // Hide sidebar by default on mobile
    function setSidebarInitial() {
        if (isMobile()) {
            sidebar.classList.remove('open');
            // Show first episode content on mobile
            if (allEpisodes.length > 0) {
                currentEpisodeIndex = 0;
                loadContent(allEpisodes[0]);
            }
        } else {
            sidebar.classList.add('open');
            // Show first episode content on desktop
            if (allEpisodes.length > 0) {
                currentEpisodeIndex = 0;
                loadContent(allEpisodes[0]);
            }
        }
    }
    setSidebarInitial();
    window.addEventListener('resize', setSidebarInitial);

    // Sidebar resizer functionality
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    // Only enable resizing on md and up
    function isResizable() {
        return window.innerWidth >= 768;
    }

    function setResizerVisibility() {
        if (isResizable()) {
            resizer.classList.remove('hidden');
        } else {
            resizer.classList.add('hidden');
            sidebar.style.width = '';
            sidebar.style.flex = '';
        }
    }
    setResizerVisibility();
    window.addEventListener('resize', setResizerVisibility);

    resizer.addEventListener('mousedown', function(e) {
        if (!isResizable()) return;
        isResizing = true;
        startX = e.clientX;
        startWidth = sidebar.offsetWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', function(e) {
        if (!isResizing || !isResizable()) return;
        let newWidth = startWidth + (e.clientX - startX);
        newWidth = Math.max(180, Math.min(600, newWidth)); // min/max width
        sidebar.style.width = newWidth + 'px';
        sidebar.style.flex = 'none';
    });

    document.addEventListener('mouseup', function() {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });

    // Sidebar close button functionality
    function setSidebarCloseBtnVisibility() {
        if (window.innerWidth <= 768) {
            sidebarCloseBtn.style.display = 'block';
        } else {
            sidebarCloseBtn.style.display = 'none';
        }
    }
    setSidebarCloseBtnVisibility();
    window.addEventListener('resize', setSidebarCloseBtnVisibility);
    sidebarCloseBtn.addEventListener('click', function() {
        sidebar.classList.remove('open');
    });
});
