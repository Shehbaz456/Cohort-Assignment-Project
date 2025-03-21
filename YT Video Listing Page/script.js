document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const videosContainer = document.getElementById("videos-container");
    const searchInput = document.getElementById("search-input");
    const mobileSearchInput = document.getElementById("mobile-search-input");
    const searchButton = document.getElementById("search-button");
    const mobileSearchButton = document.getElementById("mobile-search-button");
    const loadingIndicator = document.getElementById("loading");
    const sortSelect = document.getElementById("sort-by");
    const resultsCount = document.getElementById("results-count");
    const hamburgerMenu = document.querySelector(".hamburger-menu");
    const mobileMenu = document.querySelector(".mobile-menu");
  
    // API URL
    const API_URL = "https://api.freeapi.app/api/v1/public/youtube/videos";
  
    // State variables
    let allVideos = []; // Store all fetched videos for client-side operations
    let filteredVideos = []; // Store filtered videos
    let sortBy = "default";
    let searchTerm = "";
  
    // Mobile menu toggle
    hamburgerMenu.addEventListener("click", () => {
      mobileMenu.classList.toggle("active");
      // Ensure the mobile search input is focused when menu opens
      if (mobileMenu.classList.contains("active")) {
        setTimeout(() => {
          mobileSearchInput.focus();
        }, 100);
      }
    });
  
    // Sort change
    sortSelect.addEventListener("change", () => {
      sortBy = sortSelect.value;
      applyFiltersAndSort();
    });
  
    // Real-time search functionality
    searchInput.addEventListener("input", () => {
      searchTerm = searchInput.value.trim().toLowerCase();
      mobileSearchInput.value = searchTerm; // Sync with mobile search
      applyFiltersAndSort();
    });
  
    // Mobile search input
    mobileSearchInput.addEventListener("input", () => {
      searchTerm = mobileSearchInput.value.trim().toLowerCase();
      searchInput.value = searchTerm; // Sync with desktop search
      applyFiltersAndSort();
    });
  
    // Search button click handlers
    searchButton.addEventListener("click", () => {
      searchTerm = searchInput.value.trim().toLowerCase();
      mobileSearchInput.value = searchTerm; // Sync with mobile search
      applyFiltersAndSort();
    });
  
    mobileSearchButton.addEventListener("click", () => {
      searchTerm = mobileSearchInput.value.trim().toLowerCase();
      searchInput.value = searchTerm; // Sync with desktop search
      applyFiltersAndSort();
      mobileMenu.classList.remove("active");
    });
  
    // Enter key press handlers
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        searchTerm = searchInput.value.trim().toLowerCase();
        mobileSearchInput.value = searchTerm; // Sync with mobile search
        applyFiltersAndSort();
      }
    });
  
    mobileSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        searchTerm = mobileSearchInput.value.trim().toLowerCase();
        searchInput.value = searchTerm; // Sync with desktop search
        applyFiltersAndSort();
        mobileMenu.classList.remove("active");
      }
    });
  
    // Apply filters and sorting
    function applyFiltersAndSort() {
      // Filter videos by search term
      filteredVideos = allVideos.filter((video) => {
        const title = video.items.snippet.title.toLowerCase();
        const channelTitle = video.items.snippet.channelTitle.toLowerCase();
        
        return searchTerm === "" || 
               title.includes(searchTerm) || 
               channelTitle.includes(searchTerm);
      });
  
      // Sort videos
      if (sortBy === "views") {
        filteredVideos.sort(
          (a, b) => Number.parseInt(b.items.statistics.viewCount) - Number.parseInt(a.items.statistics.viewCount)
        );
      } else if (sortBy === "likes") {
        filteredVideos.sort(
          (a, b) => Number.parseInt(b.items.statistics.likeCount) - Number.parseInt(a.items.statistics.likeCount)
        );
      } else if (sortBy === "date") {
        filteredVideos.sort((a, b) => new Date(b.items.snippet.publishedAt) - new Date(a.items.snippet.publishedAt));
      }
  
      // Update results count
      resultsCount.textContent = `Showing ${filteredVideos.length} of ${allVideos.length} videos`;
  
      // Display filtered videos
      displayVideos();
    }
  
    // Fetch videos from API
    async function fetchVideos() {
      try {
        loadingIndicator.style.display = "flex";
        videosContainer.innerHTML = "";
  
        const response = await fetch(`${API_URL}?limit=50`); // Fetch more videos at once
  
        if (!response.ok) {
          throw new Error("Failed to fetch videos");
        }
  
        const data = await response.json();
  
        // Store all videos
        allVideos = data.data.data;
        filteredVideos = [...allVideos];
        
        // Initial display
        applyFiltersAndSort();
        
      } catch (error) {
        console.error("Error fetching videos:", error);
        videosContainer.innerHTML = `<div class="error-message">Failed to load videos. Please try again later.</div>`;
      } finally {
        loadingIndicator.style.display = "none";
      }
    }
  
    // Display videos
    function displayVideos() {
      videosContainer.innerHTML = "";
  
      if (filteredVideos.length === 0) {
        videosContainer.innerHTML = `<div class="error-message">No videos found matching your search.</div>`;
        return;
      }
  
      filteredVideos.forEach((video) => {
        const snippet = video.items.snippet;
        const statistics = video.items.statistics;
        const videoId = video.items.id;
        
        createVideoCard(
          snippet.title,
          snippet.channelTitle,
          snippet.thumbnails.high.url,
          snippet.description,
          statistics.viewCount,
          snippet.publishedAt,
          statistics.likeCount,
          videoId
        );
      });
    }
  
    // Create video card
    function createVideoCard(videoTitle, channelTitle, thumbnailUrl, description, viewCount, publishedTime, likeCount, videoId) {
      // Truncate description if too long
      if (description.length > 200) {
        description = description.substring(0, 200) + "...";
      }
  
      // Format the date
      const publishDate = new Date(publishedTime);
      const formattedDate = publishDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
  
      // Format view and like counts
      const formattedViews = formatCount(viewCount);
      const formattedLikes = formatCount(likeCount);
  
      const card = document.createElement("div");
      card.classList.add("video-card");
      card.innerHTML = `
        <div onclick="window.open('https://www.youtube.com/watch?v=${videoId}', '_blank')">
          <div class="thumbnail-container">
            <img src="${thumbnailUrl}" alt="${videoTitle}" class="thumbnail">
          </div>
          <div class="video-info">
            <div class="video-statistics">
              <div class="likeview">
                <svg style="color:rgb(197, 47, 47);" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <p class="video-metadata">${formattedLikes}</p>
              </div>
              <div class="likeview">
                <svg class="w-[29px] h-[29px] text-gray-800 dark:text-white" style="color: #fff;" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-width="1.3" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"/>
                  <path stroke="currentColor" stroke-width="1.3" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
                <p class="video-metadata">${formattedViews}</p>
              </div>
            </div>
            <h3 class="video-title">${videoTitle}</h3>
            <p class="video-description">${description}</p>
            <p class="channel-title">- ${channelTitle}</p>
            <p class="Date-Publish">${formattedDate}</p>
          </div>
        </div>
      `;
      videosContainer.appendChild(card);
    }
  
    // Format large numbers (e.g., 1000 -> 1K)
    function formatCount(count) {
      const num = Number.parseInt(count);
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
      }
      return num.toString();
    }
  
    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!hamburgerMenu.contains(e.target) && !mobileMenu.contains(e.target) && mobileMenu.classList.contains("active")) {
        mobileMenu.classList.remove("active");
      }
    });
  
    // Initialize the app
    fetchVideos();
  });
