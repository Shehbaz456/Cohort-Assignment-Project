document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const videosContainer = document.getElementById("videos-container")
    const searchInput = document.getElementById("search-input")
    const mobileSearchInput = document.getElementById("mobile-search-input")
    const searchButton = document.getElementById("search-button")
    const mobileSearchButton = document.getElementById("mobile-search-button")
    const loadingIndicator = document.getElementById("loading")
    const paginationContainer = document.getElementById("pagination")
    const sortSelect = document.getElementById("sort-by")
    const filterToggle = document.getElementById("filter-toggle")
    const filterDropdown = document.getElementById("filter-dropdown")
    const applyFiltersBtn = document.getElementById("apply-filters")
    const resetFiltersBtn = document.getElementById("reset-filters")
    const minViewsInput = document.getElementById("min-views")
    const minLikesInput = document.getElementById("min-likes")
    const resultsCount = document.getElementById("results-count")
    const hamburgerMenu = document.querySelector(".hamburger-menu")
    const mobileMenu = document.querySelector(".mobile-menu")
  
    // API URL
    const API_URL = "https://api.freeapi.app/api/v1/public/youtube/videos"
  
    // State variables
    let currentPage = 1
    const videosPerPage = 10
    let allVideos = [] // Store all fetched videos for client-side operations
    let filteredVideos = [] // Store filtered videos
    const filters = {
      minViews: 0,
      minLikes: 0,
      searchTerm: "",
    }
    let sortBy = "default"
  
    // Mobile menu toggle
    hamburgerMenu.addEventListener("click", () => {
      mobileMenu.classList.toggle("active")
      // Ensure the mobile search input is focused when menu opens
      if (mobileMenu.classList.contains("active")) {
        setTimeout(() => {
          mobileSearchInput.focus()
        }, 100)
      }
    })
  
    // Filter dropdown toggle
    filterToggle.addEventListener("click", () => {
      filterDropdown.classList.toggle("active")
    })
  
    // Close filter dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!filterToggle.contains(e.target) && !filterDropdown.contains(e.target)) {
        filterDropdown.classList.remove("active")
      }
    })
  
    // Apply filters
    applyFiltersBtn.addEventListener("click", () => {
      filters.minViews = Number.parseInt(minViewsInput.value) || 0
      filters.minLikes = Number.parseInt(minLikesInput.value) || 0
      filterDropdown.classList.remove("active")
      applyFiltersAndSort()
    })
  
    // Reset filters
    resetFiltersBtn.addEventListener("click", () => {
      minViewsInput.value = ""
      minLikesInput.value = ""
      filters.minViews = 0
      filters.minLikes = 0
      applyFiltersAndSort()
    })
  
    // Sort change
    sortSelect.addEventListener("change", () => {
      sortBy = sortSelect.value
      applyFiltersAndSort()
    })
  
    // Search functionality
    function handleSearch() {
      const searchTerm = searchInput.value.trim().toLowerCase()
      filters.searchTerm = searchTerm
      applyFiltersAndSort()
    }
  
    searchButton.addEventListener("click", handleSearch)
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleSearch()
      }
    })
  
    // Mobile search
    function handleMobileSearch() {
      const searchTerm = mobileSearchInput.value.trim().toLowerCase()
      filters.searchTerm = searchTerm
      searchInput.value = searchTerm // Sync with desktop search
      applyFiltersAndSort()
      mobileMenu.classList.remove("active")
    }
  
    mobileSearchButton.addEventListener("click", handleMobileSearch)
    mobileSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleMobileSearch()
      }
    })
  
    // Apply filters and sorting
    function applyFiltersAndSort() {
      // Filter videos
      filteredVideos = allVideos.filter((video) => {
        const viewCount = Number.parseInt(video.items.statistics.viewCount)
        const likeCount = Number.parseInt(video.items.statistics.likeCount)
        const title = video.items.snippet.title.toLowerCase()
        const description = video.items.snippet.description.toLowerCase()
        const channelTitle = video.items.snippet.channelTitle.toLowerCase()
  
        const matchesSearch =
          filters.searchTerm === "" ||
          title.includes(filters.searchTerm) ||
          description.includes(filters.searchTerm) ||
          channelTitle.includes(filters.searchTerm)
  
        return viewCount >= filters.minViews && likeCount >= filters.minLikes && matchesSearch
      })
  
      // Sort videos
      if (sortBy === "views") {
        filteredVideos.sort(
          (a, b) => Number.parseInt(b.items.statistics.viewCount) - Number.parseInt(a.items.statistics.viewCount),
        )
      } else if (sortBy === "likes") {
        filteredVideos.sort(
          (a, b) => Number.parseInt(b.items.statistics.likeCount) - Number.parseInt(a.items.statistics.likeCount),
        )
      } else if (sortBy === "date") {
        filteredVideos.sort((a, b) => new Date(b.items.snippet.publishedAt) - new Date(a.items.snippet.publishedAt))
      }
  
      // Update results count
      resultsCount.textContent = `Showing ${filteredVideos.length} of ${allVideos.length} videos`
  
      // Reset to first page and display
      currentPage = 1
      displayVideos()
      setupPagination()
    }
  
    // Fetch videos from API
    async function fetchVideos(page = 1) {
      try {
        loadingIndicator.style.display = "flex"
        videosContainer.innerHTML = ""
  
        const response = await fetch(`${API_URL}?page=${page}&limit=${videosPerPage}`)
  
        if (!response.ok) {
          throw new Error("Failed to fetch videos")
        }
  
        const data = await response.json()
  
        if (page === 1) {
          // Only store all videos on first page load
          allVideos = data.data.data
          filteredVideos = [...allVideos]
          applyFiltersAndSort() // Initial filter and sort
        } else {
          // For pagination, just display the fetched videos
          displayVideosList(data.data.data)
          setupPagination(data.data.totalPages)
        }
      } catch (error) {
        console.error("Error fetching videos:", error)
        videosContainer.innerHTML = `<div class="error-message">Failed to load videos. Please try again later.</div>`
      } finally {
        loadingIndicator.style.display = "none"
      }
    }
  
    // Display videos with pagination
    function displayVideos() {
      videosContainer.innerHTML = ""
  
      // Calculate pagination
      const startIndex = (currentPage - 1) * videosPerPage
      const endIndex = Math.min(startIndex + videosPerPage, filteredVideos.length)
      const currentVideos = filteredVideos.slice(startIndex, endIndex)
  
      if (currentVideos.length === 0) {
        videosContainer.innerHTML = `<div class="error-message">No videos found matching your criteria.</div>`
        return
      }
  
      displayVideosList(currentVideos)
    }
  
    // Display a list of videos
    function displayVideosList(videosList) {
      videosList.forEach((video) => {
        const snippet = video.items.snippet
        const statistics = video.items.statistics
  
        createVideoCard(
          snippet.title,
          snippet.channelTitle,
          snippet.thumbnails.high.url,
          snippet.description,
          statistics.viewCount,
          snippet.publishedAt,
          statistics.likeCount,
        )
      })
    }
  
    // Create video card
    function createVideoCard(videoTitle, channelTitle, thumbnailUrl, description, viewCount, publishedTime, likeCount) {
      if (description.length > 200) {
        description = description.substring(0, 200) + "..."
      }
  
      // Format the date
      const publishDate = new Date(publishedTime)
      const formattedDate = publishDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
  
      // Format view and like counts
      const formattedViews = formatCount(viewCount)
      const formattedLikes = formatCount(likeCount)
  
      const card = document.createElement("div")
      card.classList.add("video-card")
      card.innerHTML = `
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
          `
      videosContainer.appendChild(card)
    }
  
    // Format large numbers (e.g., 1000 -> 1K)
    function formatCount(count) {
      const num = Number.parseInt(count)
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M"
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K"
      }
      return num.toString()
    }
  
    // Setup pagination
    function setupPagination() {
      paginationContainer.innerHTML = ""
  
      if (filteredVideos.length <= videosPerPage) {
        return // No pagination needed
      }
  
      const totalPages = Math.ceil(filteredVideos.length / videosPerPage)
  
      // Previous button
      const prevButton = document.createElement("button")
      prevButton.textContent = "Previous"
      prevButton.disabled = currentPage === 1
      prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--
          displayVideos()
          setupPagination()
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
      })
  
      // Next button
      const nextButton = document.createElement("button")
      nextButton.textContent = "Next"
      nextButton.disabled = currentPage === totalPages
      nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
          currentPage++
          displayVideos()
          setupPagination()
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
      })
  
      // Page info
      const pageInfo = document.createElement("div")
      pageInfo.className = "pagination-info"
      pageInfo.textContent = `Page ${currentPage} of ${totalPages}`
  
      paginationContainer.appendChild(prevButton)
      paginationContainer.appendChild(pageInfo)
      paginationContainer.appendChild(nextButton)
    }
  
    // Initialize the app
    fetchVideos()
  })
  
  