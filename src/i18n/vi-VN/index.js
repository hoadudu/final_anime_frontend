// Vietnamese language pack

export default {
  // Common UI elements and actions
  common: {
    // Basic actions
    loading: 'Đang tải...',
    loadMore: 'Tải thêm',
    viewMore: 'Xem thêm',
    retry: 'Thử lại',
    tryAgain: 'Thử lại',
    back: 'Trở lại',
    next: 'Tiếp theo',
    previous: 'Trước đó',
    first: 'Đầu tiên',
    last: 'Cuối cùng',
    pageInfo: 'Trang {current} của {total}',

    // Selection and filters
    all: 'Tất cả',
    none: 'Không có',
    select: 'Chọn',
    deselect: 'Bỏ chọn',
    apply: 'Áp dụng',
    clear: 'Xóa',
    clearAll: 'Xóa tất cả',

    // Dialog actions
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    yes: 'Có',
    no: 'Không',
    ok: 'OK',
    close: 'Đóng',

    // Search and data states
    search: 'Tìm kiếm',
    noData: 'Không có dữ liệu',
    noResults: 'Không tìm thấy kết quả',
    untitled: 'Không có tiêu đề',
    episodes: 'Tập phim',
    shares: 'Chia sẻ',
    showMore: 'Xem thêm',
    showLess: 'Ẩn bớt',

    // Status messages
    success: 'Thực hiện thành công',
    failed: 'Thực hiện thất bại',
    error: 'Có lỗi xảy ra',

    // Navigation and user
    language: 'Ngôn ngữ',
    home: 'Trang chủ',
    settings: 'Cài đặt',
    profile: 'Hồ sơ',
    logout: 'Đăng xuất',
    login: 'Đăng nhập',
    signUp: 'Đăng ký',
  },

  // Header component
  header: {
    menuButton: 'Menu',
    searchPlaceholder: 'Tìm kiếm',
    createVideo: 'Tạo video hoặc bài đăng',
    apps: 'Ứng dụng',
    messages: 'Tin nhắn',
    notifications: 'Thông báo',
    account: 'Tài khoản',
  },

  // Drawer/Sidebar navigation
  drawer: {
    genre: 'Thể loại',
    language: 'Ngôn ngữ',
    moreFromYoutube: 'Thêm từ Youtube',
  },

  // Top Ten sidebar component
  topTen: {
    title: 'Top 10',
    today: 'Hôm nay',
    week: 'Tuần',
    month: 'Tháng',
    year: 'Năm',
    all: 'Tất cả',
    loading: 'Đang tải top 10...',
    noData: 'Không có dữ liệu top anime',
    error: 'Không thể tải dữ liệu top 10',
  },

  // Genre modal and filtering
  genres: {
    selectGenres: 'Chọn thể loại',
    searchGenres: 'Tìm kiếm thể loại...',
    genre: 'Thể loại',
    genres: 'Thể loại',
    allGenres: 'Tất cả thể loại',
    explicit: 'Nội dung người lớn',
    themes: 'Chủ đề',
    demographics: 'Nhân khẩu học',
    selectedGenres: 'Thể loại đã chọn',
    loadingGenres: 'Đang tải thể loại...',
    anime: 'anime',

    // Genre page specific
    selectGenre: 'Chọn thể loại',
    selectGenreDescription: 'Chọn một thể loại để xem danh sách anime thuộc thể loại đó',
    totalFound: 'Tổng cộng {total} anime được tìm thấy',
    errorOccurred: 'Có lỗi xảy ra',
    errorMessage: 'Không thể tải danh sách anime. Vui lòng thử lại.',
    noResults: 'Không tìm thấy kết quả',
    tryDifferentGenre: 'Hãy thử chọn thể loại khác',
    viewDetails: 'Xem Chi Tiết',
    showing: 'Hiển thị {from}–{to} trong {total} kết quả',

    // Sorting options
    sortBy: 'Sắp xếp theo',
    sortLatest: 'Mới nhất',
    sortOldest: 'Cũ nhất',
    sortTitle: 'Tên A-Z',
    sortRating: 'Đánh giá cao nhất',
    sortViews: 'Lượt xem nhiều nhất',
    sortToggle: 'Bật/tắt sắp xếp',
  },

  // Movie/Anime tooltip
  tooltip: {
    releaseDate: 'Ngày phát hành',
    rating: 'Đánh giá',
    genres: 'Thể loại',
    cast: 'Diễn viên',
    views: 'Lượt xem',
  },

  // Hero section
  hero: {
    trendingBadge: 'Thịnh hành',
    movieBadge: 'Phim',
    seasonLabel: 'Mùa',
    watchNow: 'Xem ngay',
    moreInfo: 'Thông tin thêm',
    castLabel: 'Diễn viên',
    loadingFeaturedAnime: 'Đang tải Anime nổi bật...',
    retry: 'Thử lại',
  },

  // Featured anime sections
  featured: {
    topAiring: 'Đang phát sóng hàng đầu',
    mostPopular: 'Phổ biến nhất',
    mostLiked: 'Được yêu thích nhất',
    latestCompleted: 'Hoàn thành gần đây',
    viewMore: 'Xem thêm',
  },

  // Trending section
  trending: {
    trendingTitle: 'Thịnh hành',
    trending: 'Đang thịnh hành',
    trendingDescription: 'Anime phổ biến nhất hiện tại',
    loadingTrendingAnime: 'Đang tải anime thịnh hành...',
    noTrendingAnime: 'Không có anime thịnh hành',
    retry: 'Thử lại',
  },

  // Latest episodes section
  latestEpisodes: {
    title: 'Tập phim mới nhất',
    latestEpisodes: 'Tập phim mới nhất',
    latestEpisodesDescription: 'Các tập anime được phát hành gần đây',
    loading: 'Đang tải tập phim mới nhất...',
    loadingLatestEpisodes: 'Đang tải tập phim mới nhất...',
    noAnime: 'Không có tập anime nào',
  },

  // Home page content
  homePage: {
    watchNow: 'Xem ngay',
    moreInfo: 'Thông tin thêm',
    continueWatching: 'Tiếp tục xem',
    recommendedForYou: 'Đề xuất cho bạn',
    topRated: 'Anime được đánh giá cao',
    upcoming: 'Anime sắp ra mắt',
  },

  // Anime details and metadata
  anime: {
    anime: 'Anime',
    synopsis: 'Tóm tắt',
    characters: 'Nhân vật',
    staff: 'Nhân sự',
    reviews: 'Đánh giá',
    trailers: 'Trailer',
    openingThemes: 'Nhạc mở đầu',
    endingThemes: 'Nhạc kết thúc',
    relatedAnime: 'Anime liên quan',
    recommendations: 'Đề xuất',

    // User actions
    addToList: 'Thêm vào danh sách',
    removeFromList: 'Xóa khỏi danh sách',
    addToFavorites: 'Thêm vào yêu thích',
    removeFromFavorites: 'Xóa khỏi yêu thích',
    markAsWatched: 'Đánh dấu đã xem',
    unmarkAsWatched: 'Bỏ đánh dấu đã xem',

    // Metadata
    year: 'Năm',
    rating: 'Đánh giá',
    type: 'Loại',
    format: 'Định dạng',
    duration: 'Thời lượng',
    episodes: 'Tập',
    status: 'Trạng thái',
    score: 'Điểm',
    rank: 'Xếp hạng',
    popularity: 'Độ phổ biến',
    members: 'Thành viên',
    studios: 'Studio',
    source: 'Nguồn',
    aired: 'Phát sóng',
    releaseDate: 'Ngày phát hành',

    // Formatted values
    durationMinutes: '{minutes} phút',
    episodesCount: '{count} tập',

    // Age ratings
    ratingG: 'G - Mọi lứa tuổi',
    ratingPG: 'PG - Trẻ em',
    ratingPG13: 'PG-13 - Thanh thiếu niên từ 13 tuổi',
    ratingR17: 'R - 17+ (bạo lực & từ ngữ thô tục)',
    ratingR18: 'R+ - Khỏa thân nhẹ',
    ratingRx: 'Rx - Hentai',

    // Status types
    finishedAiring: 'Đã hoàn thành',
    currentlyAiring: 'Đang phát sóng',
    notYetAired: 'Chưa phát sóng',
  },

  // Error handling
  errors: {
    notFound: 'Không tìm thấy trang',
    serverError: 'Lỗi máy chủ',
    networkError: 'Lỗi mạng',
    unauthorized: 'Bạn phải đăng nhập để truy cập trang này',
    forbidden: 'Bạn không có quyền truy cập tài nguyên này',
    imageLoadError: 'Không thể tải hình ảnh',
    dataLoadError: 'Không thể tải dữ liệu',
  },

  // User messages and notifications
  messages: {
    welcome: 'Chào mừng trở lại, {username}!',
    noResults: 'Không tìm thấy kết quả',
    addedToList: 'Đã thêm vào danh sách của bạn',
    removedFromList: 'Đã xóa khỏi danh sách của bạn',
    addedToFavorites: 'Đã thêm vào yêu thích',
    removedFromFavorites: 'Đã xóa khỏi yêu thích',
    refreshSuccess: 'Làm mới dữ liệu thành công',
    refreshError: 'Không thể làm mới dữ liệu',
  },





  // Anime Info Page
  animeInfo: {
    errorLoading: 'Không thể tải thông tin anime',
    watch2gether: 'Xem cùng nhau',
    watchNow: 'Xem ngay',
    addToList: 'Thêm vào danh sách',
    currentlyWatching: 'Đang xem',
    watching: 'Đang xem',
    onHold: 'Tạm ngưng',
    planToWatch: 'Dự định xem',
    dropped: 'Bỏ dở',
    completed: 'Hoàn thành',
    shareAnime: 'Chia sẻ Anime',
    shareToFriends: 'cho bạn bè của bạn',
    overview: 'Tổng quan',
    animeDetails: 'Chi tiết Anime',
    japanese: 'Tiếng Nhật',
    synonyms: 'Tên khác',
    aired: 'Ngày phát sóng',
    premiered: 'Khởi chiếu',
    duration: 'Thời lượng',
    status: 'Tình trạng',
    malScore: 'Điểm MAL',
    genres: 'Thể loại',
    studios: 'Hãng phim',
    producers: 'Nhà sản xuất',
    promoText: '{site} là trang web tốt nhất để xem {title} bản SUB online, hoặc bạn cũng có thể xem {title} bản DUB với chất lượng HD. Bạn cũng có thể tìm thấy anime của {studio} trên trang web {site}.',
    noImageAvailable: 'Không có hình ảnh',
    relatedSeries: 'Series Liên Quan',
    relatedSeriesDescription: 'Các series anime thuộc cùng franchise hoặc vũ trụ câu chuyện',
    viewDetails: 'Xem Chi Tiết',
    watchOrder: 'Thứ Tự Xem'
  },

  // Anime Page specific
  animePage: {
    title: 'Thông Tin Anime',
    defaultDescription: 'Xem anime online với chất lượng cao',
    loadingAnimeInfo: 'Đang tải thông tin anime...',
    loadingRecommendations: 'Đang tải đề xuất...',
    recommendations: 'Đề xuất',
    recommendationsComingSoon: 'Đề xuất sắp ra mắt...',
    topAnime: 'Anime Hàng Đầu',
    recentReviews: 'Đánh Giá Gần Đây',
    latestNews: 'Tin Tức Mới Nhất',
    comingSoon: 'Sắp ra mắt...',
    imagesGallery: 'Thư Viện Hình Ảnh',
    genres: 'Thể loại',
    description: 'Mô tả'
  },

  // Watch Page
  watch: {
    title: 'Xem',
    episodes: 'Tập phim',
    searchEpisode: 'Tìm kiếm tập phim',
    prev: 'Trước',
    next: 'Tiếp',
    prevEpisode: 'Tập trước',
    nextEpisode: 'Tập tiếp theo',
    quality: 'Chất lượng',
    servers: 'Máy chủ',
    noStream: 'Không có nguồn phát',
    noStreamDescription: 'Hiện tại không có nguồn phát nào cho tập phim này. Vui lòng thử các tập khác hoặc kiểm tra lại sau.',
    expand: 'Mở rộng',
    collapse: 'Thu gọn',
    cinemaMode: 'Chế độ rạp chiếu phim',
    exitCinema: 'Thoát chế độ rạp',
    autoPlay: 'Tự động phát',
    autoNext: 'Tự động tập tiếp theo',
    autoSkipIntro: 'Tự động bỏ qua intro',
    addToWatchlist: 'Thêm vào danh sách xem',
    removeFromWatchlist: 'Xóa khỏi danh sách xem',
    addedToWatchlist: 'Đã thêm vào danh sách xem',
    removedFromWatchlist: 'Đã xóa khỏi danh sách xem',
    comments: 'Bình luận',
    noComments: 'Chưa có bình luận nào',
    recommended: 'Đề xuất cho bạn',
    watching: 'Đang xem',
    lastWatched: 'Xem gần nhất',
    pageDescription: 'Xem các tập anime trực tuyến với nhiều máy chủ và phụ đề.',
    defaultEpisodeDescription: 'Xem {episodeTitle} của {animeTitle} với chất lượng cao và nhiều máy chủ.',
    nowWatching: 'Bạn đang xem',
    episode: 'Tập',
    tryOtherServers: 'Nếu máy chủ hiện tại không hoạt động, hãy thử các máy chủ khác bên cạnh.',

    // Episode List specific
    noEpisodes: 'Không tìm thấy tập phim',
    selectEpisodeGroup: 'Chọn nhóm tập phim',
    episodeList: 'Danh sách tập phim',

    // Vote/Rating specific
    rateQuestion: 'Bạn nghĩ gì về anime này?',
    voteNow: 'Bình chọn ngay',
    boring: 'Nhàm chán',
    great: 'Tuyệt vời',
    amazing: 'Xuất sắc',

    // Additional watch page keys
    currentEpisode: 'Tập hiện tại',
    animeInfo: 'Thông tin',
    save: 'Lưu',
    saved: 'Đã lưu'
  },

  // Search Page
  search: {
    enterKeyword: 'Nhập từ khóa để bắt đầu tìm kiếm anime',
    startSearching: 'Gõ từ khóa vào ô tìm kiếm phía trên',
    resultsFor: 'Kết quả tìm kiếm cho',
    totalFound: 'Tổng cộng {total} anime được tìm thấy',
    errorOccurred: 'Có lỗi xảy ra',
    errorMessage: 'Không thể tải kết quả tìm kiếm. Vui lòng thử lại.',
    noResults: 'Không tìm thấy kết quả',
    tryDifferentKeyword: 'Hãy thử sử dụng từ khóa khác hoặc kiểm tra chính tả',
    viewDetails: 'Xem Chi Tiết',
    showing: 'Hiển thị {from}–{to} trong {total} kết quả'
  }

}
