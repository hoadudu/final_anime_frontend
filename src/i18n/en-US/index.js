// English language pack

export default {
  // Common UI elements and actions
  common: {
    // Site information
    siteName: 'AnimeHub',

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

    // Anime status
    ongoing: 'Ongoing',
    completed: 'Completed',
    upcoming: 'Upcoming',
    cancelled: 'Cancelled',
    hiatus: 'Hiatus',

    // Status messages
    success: 'Action was successful',
    refresh: 'Refresh',
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
    reset: 'Reset',
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
    chanel: 'Chanels',
    filter: 'Filter',
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

    // Genre page specific
    selectGenre: 'Select Genre',
    selectGenreDescription: 'Choose a genre to view anime belonging to that category',
    totalFound: 'Found {total} anime in total',
    errorOccurred: 'An error occurred',
    errorMessage: 'Unable to load anime list. Please try again.',
    noResults: 'No results found',
    tryDifferentGenre: 'Try selecting a different genre',
    viewDetails: 'View Details',
    showing: 'Showing {from}–{to} of {total} results',

    // SEO and meta descriptions
    discoverAnimeByGenre: 'Discover the rich world of anime with thousands of anime across various genres',
    exploreAnimeIn: 'Explore anime in',
    discoverBestAnime: 'Discover the best anime in',
    withRatingsAndDetails: 'with ratings and details',
    watchAnime: 'Watch anime',
    animeGenres: 'Anime genres',
    pickYourFavorite: 'Pick your favorite genres',

    // Sorting options
    sortBy: 'Sort by',
    sortLatest: 'Latest',
    sortOldest: 'Oldest',
    sortTitle: 'Title A-Z',
    sortRating: 'Highest rated',
    sortViews: 'Most viewed',
    sortToggle: 'Toggle sort',
  },

  // Company page (Studios, Producers, Licensors)
  company: {
    company: 'Company',
    selectCompany: 'Select Company',
    selectCompanyDescription: 'Choose a company to view anime produced by them',
    totalFound: 'Found {total} anime in total',
    errorOccurred: 'An error occurred',
    errorMessage: 'Unable to load anime list. Please try again.',
    noResults: 'No results found',
    noResultsMessage: 'No anime found from this company',
    viewDetails: 'View Details',
    showing: 'Showing {from}–{to} of {total} results',

    // SEO and meta descriptions
    discoverAnimeByCompany: 'Discover anime from various studios, producers and licensors',
    exploreAnimeFrom: 'Explore anime from',
    discoverBestAnime: 'Discover the best anime from',
    withRatingsAndDetails: 'with ratings and details',
    watchAnime: 'Watch anime',
    animeCompanies: 'Anime companies',

    // Sorting options
    sortBy: 'Sort by',
    sortLatest: 'Latest',
    sortOldest: 'Oldest',
    sortTitle: 'Title A-Z',
    sortRating: 'Highest rated',
    sortViews: 'Most viewed',
  },

  // Profile page
  profile: {
    // Header
    joinedAt: 'Joined',
    totalAnime: 'Total Anime',
    avgScore: 'Avg Score',
    notLoggedIn: 'Not Logged In',
    pleaseLogin: 'Please login to view your profile',

    // Status tabs
    continue: 'Continue Watching',
    watching: 'Watching',
    completed: 'Completed',
    onHold: 'On Hold',
    dropped: 'Dropped',
    planToWatch: 'Plan to Watch',
    customLists: 'Custom Lists',

    // Filter bar
    searchAnime: 'Search anime...',
    sortBy: 'Sort by',
    showing: 'Showing',
    anime: 'anime',

    // Sort options
    sortUpdatedDesc: 'Recently Updated',
    sortUpdatedAsc: 'Oldest Updated',
    sortTitleAsc: 'Title (A-Z)',
    sortTitleDesc: 'Title (Z-A)',
    sortScoreDesc: 'Score (High to Low)',
    sortScoreAsc: 'Score (Low to High)',

    // Anime card
    episodes: 'episodes',
    updated: 'Updated',

    // Empty states
    noAnime: 'No anime found',
    noAnimeMessage: 'You have no anime in {status} list',

    // Error states
    errorLoadingProfile: 'Failed to load profile',
    errorLoadingList: 'Failed to load anime list',

    // Delete actions
    confirmDelete: 'Remove from List',
    confirmDeleteMessage: 'Are you sure you want to remove "{title}" from your list?',
    deleteButton: 'Remove',
    deletingAnime: 'Removing from list...',
    deleteSuccess: 'Successfully removed from your list',
    deleteError: 'Failed to remove from list. Please try again.',

    // Settings
    settings: 'Settings',
    selectAvatar: 'Select Avatar',
    currentAvatar: 'Current Avatar',
    noAvatarsAvailable: 'No avatars available',
    selectCategory: 'Select Category',
    selectCategoryFirst: 'Please select a category first',
    avatarsFor: 'Avatars for',
    noAvatarsForTag: 'No avatars available for this category',
    noCategoriesAvailable: 'No categories available',
    saveAvatar: 'Save Avatar',
    avatarUpdated: 'Avatar updated successfully',
    avatarUpdateError: 'Failed to update avatar',
    profileInfo: 'Profile Information',
    username: 'Username',
    usernameCannotChange: 'Username cannot be changed',
    email: 'Email',
    emailCannotChange: 'Email cannot be changed',
    displayName: 'Display Name',
    nameRequired: 'Name is required',
    bio: 'Bio',
    bioHint: 'Tell us about yourself',
    updateProfile: 'Update Profile',
    profileUpdated: 'Profile updated successfully',
    updateError: 'Failed to update profile',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    passwordRequired: 'Password is required',
    passwordMinLength: 'Password must be at least 6 characters',
    passwordsDoNotMatch: 'Passwords do not match',
    passwordChanged: 'Password changed successfully',
    passwordChangeError: 'Failed to change password',
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
    noAnimeId: 'Anime ID not found',
    addingToList: 'Adding to your list...',
    addedToListSuccess: 'Successfully added to your watch list!',
    addedToListError: 'Failed to add to watch list. Please try again.',
    pleaseLoginFirst: 'Please login to add anime to your list',
    savedOffline: 'Saved temporarily, will sync when online',
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
    watchOrder: 'Watch Order',
    studiosProducersLicensors: 'Studios, Producers & Licensors',
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
    animeNotAvailable: 'Anime information not available',
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

  // Post Reactions
  reactions: {
    title: 'Reactions',
    total: 'total',
    loading: 'Loading reactions...',
    errorLoading: 'Error loading reactions',
    errorAddingReaction: 'Error adding reaction',
    errorRemovingReaction: 'Error removing reaction',
    reactionAdded: 'Added reaction: {reaction}',
    reactionRemoved: 'Reaction removed',
    loginRequired: 'Please login to react',
    loginToReact: 'Login to react',
    yourReaction: 'Your reaction',

    // Reaction types
    boring: 'Boring',
    awesome: 'Awesome',
    excellent: 'Excellent'
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
    showing: 'Showing {from}–{to} of {total} results',

    // SEO and meta descriptions
    foundResults: 'Found {count} results for "{keyword}"',
    noResultsFor: 'No results found for keyword',
    tryDifferentKeywordOrCheck: 'Try different keywords or check your spelling',
    searchAnimeDescription: 'Search and discover thousands of anime across various genres',
    discoverAnimeMatching: 'Discover anime that match your interests'
  },

  // Filter Page
  filter: {
    filterAnime: 'Filter Anime',
    filterResults: 'Filter Results',
    filter: 'Filter',
    foundResults: 'Found {count} results',
    type: 'Type',
    status: 'Status',
    season: 'Season',
    year: 'Year',
    genres: 'Genres',
    sort: 'Sort',
    sortBy: 'Sort by',
    sortDefault: 'Default',
    noFiltersApplied: 'No filters applied',
    clearAllFilters: 'Clear all filters',
    resetAll: 'Reset All',
    maxGenresReached: 'Maximum 3 genres allowed',
    allTypes: 'All types',
    allStatuses: 'All statuses',
    airing: 'Airing',
    completed: 'Completed',
    customYear: 'Custom year',
    upcoming: 'Upcoming',
    sortLatest: 'Latest',
    sortOldest: 'Oldest',
    sortTitle: 'Title A-Z',
    sortRating: 'Highest rated',
    sortViews: 'Most viewed',
    totalFound: 'Total {total} anime found',
    errorOccurred: 'An error occurred',
    errorMessage: 'Failed to load filter results. Please try again.',
    noResults: 'No results found',
    tryDifferentFilters: 'Try applying different filters',
    viewDetails: 'View details',
    showing: 'Showing {from}–{to} of {total} results',
    selected: 'selected',
    forType: 'for type',
    withStatus: 'with status',
    fromYear: 'from year',
    filterAnimeDescription: 'Filter and discover anime based on various criteria'
  },

  // Auth dialog/modal
  auth: {
    login: 'Login',
    register: 'Sign Up',
    loginTab: 'Login',
    registerTab: 'Register',
    forgotPasswordTab: 'Forgot Password',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    rememberMe: 'Remember me',
    toRegister: "Don't have an account? Register",
    toLogin: 'Already have an account? Login',
    noAccountYet: "Don't have an account?",
    haveAccount: 'Already have an account?',
    rememberPassword: 'Remember your password?',
    forgotPasswordDescription: 'Enter your email address and we will send you a link to reset your password.',
    sendResetLink: 'Send Reset Link',
    resetLinkSent: 'Password reset link sent! Please check your email.',
    // Reset password page
    resetPasswordTitle: 'Reset Password',
    resetPasswordDescription: 'Enter your new password below.',
    newPassword: 'New Password',
    resetPassword: 'Reset Password',
    passwordResetSuccess: 'Password reset successfully! You can now login with your new password.',
    invalidResetLink: 'Invalid or expired reset link.',
    backToLogin: 'Back to Login',
    passwordRequired: 'Password is required',
    passwordMinLength: 'Password must be at least 8 characters',
    passwordStrength: 'Password must contain uppercase, lowercase, and number',
    // Notifications
    loginSuccess: 'Welcome back! Logged in successfully',
    registerSuccess: 'Account created successfully. Please login.',
    logoutSuccess: 'Logged out successfully. See you again!',
    logoutWarning: 'Logged out from this device',
  },

  // Notifications
  notification: {
    defaultTitle: 'Notification',
    defaultMessage: 'You have a new notification',
    markAsRead: 'Mark as Read',
    markedAsRead: 'Marked as read',
    markAsReadError: 'Could not mark as read',
    justNow: 'Just now',
    hoursAgo: '{hours} hours ago',
    daysAgo: '{days} days ago',
    autoCloseIn: 'Auto-close in {seconds} seconds',
    generalNotification: 'General Notification',
    systemMaintenance: 'System Maintenance',
    newFeature: 'New Feature',
    importantUpdate: 'Important Update'
  },

  // Device Management
  deviceManagement: {
    title: 'Active Devices',
    subtitle: 'Manage devices where you are logged in',
    currentDevice: 'Current Device',
    ipAddress: 'IP Address',
    lastUsed: 'Last Used',
    createdAt: 'Created',
    revokeDevice: 'Revoke this device',
    revokeAllOthers: 'Sign out all other devices',
    noDevices: 'No active devices',
    tokenStats: 'Token Statistics',
    activeDevices: 'Active',
    expiredTokens: 'Expired',
    revokedTokens: 'Revoked',
    confirmRevokeTitle: 'Revoke Device',
    confirmRevokeMessage: 'Are you sure you want to revoke access from "{device}"?',
    confirmRevokeAllTitle: 'Revoke All Other Devices',
    confirmRevokeAllMessage: 'Are you sure you want to sign out from {count} other device(s)? This action cannot be undone.',
    deviceRevoked: 'Device revoked successfully',
    devicesRevoked: '{count} device(s) revoked successfully',
  }
}
