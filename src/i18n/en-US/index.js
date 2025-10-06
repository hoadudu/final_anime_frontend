// English language pack

export default {
  // Common UI elements and actions
  common: {
    // Basic actions
    loading: 'Loading...',
    loadMore: 'Load More',
    viewMore: 'View more',
    retry: 'Retry',
    tryAgain: 'Try Again',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    first: 'First',
    last: 'Last',
    pageInfo: 'Page {current} of {total}',

    // Selection and filters
    all: 'All',
    none: 'None',
    select: 'Select',
    deselect: 'Deselect',
    apply: 'Apply',
    clear: 'Clear',
    clearAll: 'Clear All',

    // Dialog actions
    cancel: 'Cancel',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    close: 'Close',

    // Search and data states
    search: 'Search',
    noData: 'No data available',
    noResults: 'No results found',
    untitled: 'Untitled',
    episodes: 'Episodes',
    shares: 'Shares',
    showMore: 'Show More',
    showLess: 'Show Less',

    // Status messages
    success: 'Action was successful',
    failed: 'Action failed',
    error: 'An error occurred',

    // Navigation and user
    language: 'Language',
    home: 'Home',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Logout',
    login: 'Login',
    signUp: 'Sign Up',
  },

  // Header component
  header: {
    menuButton: 'Menu',
    searchPlaceholder: 'Search',
    createVideo: 'Create a video or post',
    apps: 'Apps',
    messages: 'Messages',
    notifications: 'Notifications',
    account: 'Account',
  },

  // Drawer/Sidebar navigation
  drawer: {
    genre: 'Genre',
    language: 'Language',
    moreFromYoutube: 'More from Youtube',
  },

  // Top Ten sidebar component
  topTen: {
    title: 'Top 10',
    today: 'Today',
    week: 'Week',
    month: 'Month',
    year: 'Year',
    all: 'All',
    loading: 'Loading top 10...',
    noData: 'No top anime data available',
    error: 'Failed to load top 10 data',
  },

  // Genre modal and filtering
  genres: {
    selectGenres: 'Select Genres',
    searchGenres: 'Search genres...',
    genre: 'Genre',
    genres: 'Genres',
    allGenres: 'All Genres',
    explicit: 'Explicit',
    themes: 'Themes',
    demographics: 'Demographics',
    selectedGenres: 'Selected genres',
    loadingGenres: 'Loading genres...',
    anime: 'anime',
  },

  // Movie/Anime tooltip
  tooltip: {
    releaseDate: 'Release Date',
    rating: 'Rating',
    genres: 'Genres',
    cast: 'Cast',
    views: 'Views',
  },

  // Hero section
  hero: {
    trendingBadge: 'Trending',
    movieBadge: 'Movie',
    seasonLabel: 'Season',
    watchNow: 'Watch Now',
    moreInfo: 'More Info',
    castLabel: 'Cast',
    loadingFeaturedAnime: 'Loading Featured Anime...',
    retry: 'Retry',
  },

  // Featured anime sections
  featured: {
    topAiring: 'Top Airing',
    mostPopular: 'Most Popular',
    mostLiked: 'Most Liked',
    latestCompleted: 'Latest Completed',
    viewMore: 'View more',
  },

  // Trending section
  trending: {
    trendingTitle: 'Trending',
    trending: 'Trending Now',
    trendingDescription: 'Most popular anime right now',
    loadingTrendingAnime: 'Loading trending anime...',
    noTrendingAnime: 'No trending anime available',
    retry: 'Retry',
  },

  // Latest episodes section
  latestEpisodes: {
    title: 'Latest Episodes',
    latestEpisodes: 'Latest Episodes',
    latestEpisodesDescription: 'Recently released anime episodes',
    loading: 'Loading latest episodes...',
    loadingLatestEpisodes: 'Loading latest episodes...',
    noAnime: 'No anime episodes available',
  },

  // Home page content
  homePage: {
    watchNow: 'Watch Now',
    moreInfo: 'More Info',
    continueWatching: 'Continue Watching',
    recommendedForYou: 'Recommended for You',
    topRated: 'Top Rated Anime',
    upcoming: 'Upcoming Anime',
  },

  // Anime details and metadata
  anime: {
    anime: 'Anime',
    synopsis: 'Synopsis',
    characters: 'Characters',
    staff: 'Staff',
    reviews: 'Reviews',
    trailers: 'Trailers',
    openingThemes: 'Opening Themes',
    endingThemes: 'Ending Themes',
    relatedAnime: 'Related Anime',
    recommendations: 'Recommendations',

    // User actions
    addToList: 'Add to My List',
    removeFromList: 'Remove from My List',
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',
    markAsWatched: 'Mark as Watched',
    unmarkAsWatched: 'Unmark as Watched',

    // Metadata
    year: 'Year',
    rating: 'Rating',
    type: 'Type',
    format: 'Format',
    duration: 'Duration',
    episodes: 'Episodes',
    status: 'Status',
    score: 'Score',
    rank: 'Rank',
    popularity: 'Popularity',
    members: 'Members',
    studios: 'Studios',
    source: 'Source',
    aired: 'Aired',
    releaseDate: 'Release Date',

    // Formatted values
    durationMinutes: '{minutes} minutes',
    episodesCount: '{count} episodes',

    // Age ratings
    ratingG: 'G - All Ages',
    ratingPG: 'PG - Children',
    ratingPG13: 'PG-13 - Teens 13 or older',
    ratingR17: 'R - 17+ (violence & profanity)',
    ratingR18: 'R+ - Mild Nudity',
    ratingRx: 'Rx - Hentai',

    // Status types
    finishedAiring: 'Finished Airing',
    currentlyAiring: 'Currently Airing',
    notYetAired: 'Not Yet Aired',
  },

  // Error handling
  errors: {
    notFound: 'Page not found',
    serverError: 'Server error',
    networkError: 'Network error',
    unauthorized: 'You must be logged in to access this page',
    forbidden: 'You do not have permission to access this resource',
    imageLoadError: 'Failed to load image',
    dataLoadError: 'Failed to load data',
  },

  // User messages and notifications
  messages: {
    welcome: 'Welcome back, {username}!',
    noResults: 'No results found',
    addedToList: 'Added to your list',
    removedFromList: 'Removed from your list',
    addedToFavorites: 'Added to your favorites',
    removedFromFavorites: 'Removed from your favorites',
    refreshSuccess: 'Data refreshed successfully',
    refreshError: 'Failed to refresh data',
  },

  // Anime Info Page
  animeInfo: {
    errorLoading: 'Failed to load anime information',
    watch2gether: 'Watch2gether',
    watchNow: 'Watch now',
    addToList: 'Add to List',
    currentlyWatching: 'Currently Watching',
    watching: 'Watching',
    onHold: 'On-Hold',
    planToWatch: 'Plan to Watch',
    dropped: 'Dropped',
    completed: 'Completed',
    shareAnime: 'Share Anime',
    shareToFriends: 'to your friends',
    overview: 'Overview',
    animeDetails: 'Anime Details',
    japanese: 'Japanese',
    synonyms: 'Synonyms',
    aired: 'Aired',
    premiered: 'Premiered',
    duration: 'Duration',
    status: 'Status',
    malScore: 'MAL Score',
    genres: 'Genres',
    studios: 'Studios',
    producers: 'Producers',
    promoText: '{site} is the best site to watch {title} SUB online, or you can even watch {title} DUB in HD quality. You can also find {studio} anime on {site} website.',
    noImageAvailable: 'No Image Available',
    relatedSeries: 'Related Series',
    relatedSeriesDescription: 'Anime series that belong to the same franchise or story universe',
    viewDetails: 'View Details',
    watchOrder: 'Watch Order'
  },

  // Anime Page specific
  animePage: {
    title: 'Anime Info',
    defaultDescription: 'Watch anime online with high quality streaming',
    loadingAnimeInfo: 'Loading anime information...',
    loadingRecommendations: 'Loading recommendations...',
    recommendations: 'Recommendations',
    recommendationsComingSoon: 'Recommendations coming soon...',
    topAnime: 'Top Anime',
    recentReviews: 'Recent Reviews',
    latestNews: 'Latest News',
    comingSoon: 'Coming soon...',
    imagesGallery: 'Images Gallery',
    genres: 'Genres',
    description: 'Description'
  },

  // Watch Page
  watch: {
    title: 'Watch',
    episodes: 'Episodes',
    searchEpisode: 'Search episode',
    prev: 'Previous',
    next: 'Next',
    prevEpisode: 'Previous Episode',
    nextEpisode: 'Next Episode',
    quality: 'Quality',
    servers: 'Servers',
    noStream: 'No stream available',
    noStreamDescription: 'No streaming sources are currently available for this episode. Please try other episodes or check back later.',
    expand: 'Expand',
    collapse: 'Collapse',
    cinemaMode: 'Cinema Mode',
    exitCinema: 'Exit Cinema Mode',
    autoPlay: 'Auto Play',
    autoNext: 'Auto Next Episode',
    autoSkipIntro: 'Auto Skip Intro',
    addToWatchlist: 'Add to Watchlist',
    removeFromWatchlist: 'Remove from Watchlist',
    addedToWatchlist: 'Added to watchlist',
    removedFromWatchlist: 'Removed from watchlist',
    comments: 'Comments',
    noComments: 'No comments yet',
    recommended: 'Recommended for You',
    watching: 'Watching',
    lastWatched: 'Last watched',
    pageDescription: 'Stream anime episodes online with multiple servers and subtitles.',
    defaultEpisodeDescription: 'Watch {episodeTitle} of {animeTitle} in high quality with multiple servers.',
    nowWatching: 'You are watching',
    episode: 'Episode',
    tryOtherServers: 'If current server does not work, please try other servers beside.',

    // Episode List specific
    noEpisodes: 'No episodes found',
    selectEpisodeGroup: 'Select Episode Group',
    episodeList: 'Episode List',

    // Vote/Rating specific
    rateQuestion: 'What do you think about this anime?',
    voteNow: 'Vote now',
    boring: 'Boring',
    great: 'Great',
    amazing: 'Amazing',

    // Additional watch page keys
    currentEpisode: 'Current Episode',
    animeInfo: 'Info',
    save: 'Save',
    saved: 'Saved'
  },

  // Search Page
  search: {
    enterKeyword: 'Enter a keyword to start searching for anime',
    startSearching: 'Type something in the search box above',
    resultsFor: 'Search results for',
    totalFound: 'Total {total} anime found',
    errorOccurred: 'An error occurred',
    errorMessage: 'Failed to load search results. Please try again.',
    noResults: 'No results found',
    tryDifferentKeyword: 'Try using different keywords or check your spelling',
    viewDetails: 'View Details',
    showing: 'Showing {from}–{to} of {total} results'
  }
}
